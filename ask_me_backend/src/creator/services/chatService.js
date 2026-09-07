const sequelize = require("../../config/database");
const models = require("../../models");
const ChatMessage = models.ChatMessage || require("../../models/ChatMessageModel");
const DonationSession = models.DonationSession || require("../../models/DonationSessionModels");
const Donation = models.Donation || require("../../models/DonationModel");
const CreatorsModel = models.CreatorsModel || models.Creator || require("../../models/CreatorsModel");
const { getIO } = require("../../config/socket");

/**
 * Get Chat History for a Live Session
 */
const getSessionMessagesService = async (sessionId) => {
  if (!sessionId) {
    const err = new Error("Session ID is required.");
    err.statusCode = 400;
    throw err;
  }

  const records = await ChatMessage.findAll({
    where: { session_id: sessionId, is_deleted: false },
    order: [["created_at", "ASC"]],
    limit: 100,
  });

  const messages = records.map((m) => ({
    id: m.id,
    sessionId: m.session_id,
    senderType: m.sender_type,
    senderId: m.sender_id,
    senderName: m.sender_name || (m.sender_type === "creator" ? "Creator Host" : "Viewer"),
    donationId: m.donation_id,
    message: m.message,
    messageType: m.message_type,
    createdAt: m.created_at || m.createdAt,
  }));

  return { messages };
};

/**
 * Creator Replies to a Viewer Donation
 */
const replyToDonationService = async (creatorId, data) => {
  const { sessionId, donationId, message, senderName } = data;

  if (!sessionId || !donationId || !message || !String(message).trim()) {
    const err = new Error("Missing required parameters (sessionId, donationId, message).");
    err.statusCode = 400;
    throw err;
  }

  // Verify creator owns the session
  if (creatorId) {
    const session = await DonationSession.findByPk(sessionId);
    if (session && String(session.creator_id) !== String(creatorId)) {
      const err = new Error("Unauthorized: Creator does not own this session.");
      err.statusCode = 403;
      throw err;
    }
  }

  const replyRecord = await ChatMessage.create({
    session_id: sessionId,
    sender_type: "creator",
    sender_id: creatorId || 0,
    sender_name: senderName || "Creator Host",
    donation_id: donationId,
    message: message.trim(),
    message_type: "donation_reply",
    is_deleted: false,
  });

  const replyPayload = {
    id: replyRecord.id,
    sessionId: parseInt(sessionId, 10),
    senderType: "creator",
    senderId: creatorId || 0,
    senderName: senderName || "Creator Host",
    donationId: parseInt(donationId, 10),
    message: message.trim(),
    messageType: "donation_reply",
    createdAt: replyRecord.createdAt,
  };

  try {
    const io = getIO();
    if (io) {
      io.to(`live_session_${sessionId}`).emit("donation_replied", replyPayload);
      io.to(`live_session_${sessionId}`).emit("new_message", replyPayload);
    }
  } catch (e) { }

  return { reply: replyPayload };
};

/**
 * Get Overlay Data for OBS / Streamlabs
 */
const getOverlayDataService = async (identifier) => {
  if (!identifier) {
    const err = new Error("Identifier is required.");
    err.statusCode = 400;
    throw err;
  }

  let creator = null;

  if (!isNaN(identifier)) {
    creator = await CreatorsModel.findByPk(identifier);
  } else {
    const cleanUsername = String(identifier).replace(/^@/, "").trim();
    creator = await CreatorsModel.findOne({ where: { username: cleanUsername } });
    if (!creator) {
      creator = await CreatorsModel.findOne({ where: { full_name: cleanUsername } });
    }
  }

  if (!creator) {
    const err = new Error("Creator not found.");
    err.statusCode = 404;
    throw err;
  }

  let activeSession = await DonationSession.findOne({
    where: { creator_id: creator.id, status: "active" },
    order: [["started_at", "DESC"]],
  });

  if (!activeSession) {
    activeSession = await DonationSession.findOne({
      where: { creator_id: creator.id },
      order: [["createdAt", "DESC"]],
    });
  }

  const origin = process.env.FRONTEND_URL || "http://localhost:3000";
  const sessionCode = activeSession?.session_code || "live";
  const paymentLink = `${origin}/pay/${sessionCode}?creatorId=${creator.id}&sessionId=${activeSession?.id || 1}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(paymentLink)}`;

  return {
    creator: {
      id: creator.id,
      fullName: creator.full_name,
      username: `@${creator.username}`,
      profileImage: creator.profile_image || "",
    },
    session: activeSession
      ? {
        id: activeSession.id,
        sessionCode: activeSession.session_code,
        title: activeSession.title,
        category: activeSession.category,
        status: activeSession.status,
      }
      : null,
    paymentLink,
    qrCodeUrl,
    supportText: "Support Creator",
    scanText: "Scan & Send Message",
  };
};

/**
 * Get Overlay Alerts for OBS Overlay
 */
const getOverlayAlertsService = async (creatorId, queryParams = {}) => {
  if (!creatorId) {
    const err = new Error("Creator ID is required.");
    err.statusCode = 400;
    throw err;
  }

  const { sessionId, filter } = queryParams;

  let activeSession = null;
  if (sessionId) {
    activeSession = await DonationSession.findOne({
      where: { id: sessionId, creator_id: creatorId },
    });
  }
  if (!activeSession) {
    activeSession = await DonationSession.findOne({
      where: { creator_id: creatorId, status: "active" },
      order: [["createdAt", "DESC"]],
    });
  }

  let alerts = [];
  let filterCounts = { all: 0, priority: 0, answered: 0, rejected: 0 };
  let latestReadAlert = null;

  if (activeSession) {
    const donations = await Donation.findAll({
      where: {
        creator_id: creatorId,
        session_id: activeSession.id,
        payment_status: "success",
      },
      order: [["created_at", "DESC"]],
    });

    const formattedDonations = donations.map((d) => ({
      id: d.id,
      donationUuid: d.donation_uuid,
      viewerName: d.anonymous ? "Anonymous Supporter" : d.viewer_name || "Supporter",
      amount: parseFloat(d.amount || 0),
      message: d.message || "",
      paidAt: d.paid_at || d.createdAt,
      isVip: !!d.is_vip,
      status: d.status || "not_read",
      sessionId: d.session_id,
      isFlagged: !!(d.is_flagged || (d.message && /abuse|spam|hate|hack/i.test(d.message))),
    }));

    const unreadList = formattedDonations.filter((d) => d.status === "not_read" || !d.status);
    const superchatList = unreadList.filter((d) => !d.isVip);
    const membersList = unreadList.filter((d) => d.isVip);
    const priorityList = formattedDonations.filter((d) => (d.isVip || d.amount >= 500) && (d.status === "not_read" || !d.status));
    const answeredList = formattedDonations.filter((d) => d.status === "read" || d.status === "answered");
    const rejectedList = formattedDonations.filter((d) => d.status === "cancelled" || d.status === "rejected");

    filterCounts = {
      all: unreadList.length,
      superchat: superchatList.length,
      members: membersList.length,
      priority: priorityList.length,
      answered: answeredList.length,
      rejected: rejectedList.length,
    };

    const reqFilter = String(filter || "all").toLowerCase();
    let filteredAlerts = unreadList;
    if (reqFilter === "superchat") filteredAlerts = superchatList;
    else if (reqFilter === "members" || reqFilter === "priority") filteredAlerts = membersList;
    else if (reqFilter === "answered") filteredAlerts = answeredList;
    else if (reqFilter === "rejected") filteredAlerts = rejectedList;

    // VIP questions first at top of queue
    filteredAlerts.sort((a, b) => {
      const aVip = a.isVip ? 1 : 0;
      const bVip = b.isVip ? 1 : 0;
      if (bVip !== aVip) return bVip - aVip;
      return new Date(a.paidAt || 0) - new Date(b.paidAt || 0);
    });

    alerts = filteredAlerts;

    const latestRead = await Donation.findOne({
      where: {
        creator_id: creatorId,
        session_id: activeSession.id,
        payment_status: "success",
        status: "read",
      },
      order: [["updatedAt", "DESC"]],
    });

    if (latestRead) {
      latestReadAlert = {
        id: latestRead.id,
        donationUuid: latestRead.donation_uuid,
        viewerName: latestRead.anonymous ? "Anonymous Supporter" : latestRead.viewer_name || "Supporter",
        amount: parseFloat(latestRead.amount || 0),
        message: latestRead.message || "",
        paidAt: latestRead.paid_at || latestRead.createdAt,
        isVip: !!latestRead.is_vip,
        status: latestRead.status,
        sessionId: latestRead.session_id,
      };
    }
  }

  return {
    alerts,
    filterCounts,
    latestReadAlert,
    activeSession: activeSession
      ? {
        id: activeSession.id,
        title: activeSession.title,
        sessionCode: activeSession.session_code,
        status: activeSession.status,
      }
      : null,
  };
};

/**
 * Update Donation Status ('read' or 'cancelled')
 */
const updateDonationStatusService = async (donationId, status, creatorId) => {
  if (!donationId) {
    const err = new Error("Donation ID is required.");
    err.statusCode = 400;
    throw err;
  }

  if (!["read", "cancelled"].includes(status)) {
    const err = new Error("Invalid status. Must be read or cancelled.");
    err.statusCode = 400;
    throw err;
  }

  const isUuid = typeof donationId === "string" && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(donationId);

  let donation = null;
  if (isUuid) {
    donation = await Donation.findOne({ where: { donation_uuid: donationId } });
  } else {
    const numId = Number(donationId);
    if (!isNaN(numId)) {
      donation = await Donation.findOne({ where: { id: numId } });
    }
  }

  if (!donation) {
    const err = new Error("Donation record not found.");
    err.statusCode = 404;
    throw err;
  }

  if (creatorId && String(donation.creator_id) !== String(creatorId)) {
    const err = new Error("Unauthorized to update this donation status.");
    err.statusCode = 403;
    throw err;
  }

  donation.status = status;
  await donation.save();

  const alertPayload = {
    id: donation.id,
    donationUuid: donation.donation_uuid,
    viewerName: donation.anonymous ? "Anonymous Supporter" : donation.viewer_name || "Supporter",
    amount: parseFloat(donation.amount || 0),
    message: donation.message || "",
    paidAt: donation.paid_at || donation.createdAt,
    isVip: !!donation.is_vip,
    sessionId: donation.session_id,
    creatorId: donation.creator_id,
  };

  try {
    const io = getIO();
    if (io) {
      if (donation.session_id) {
        io.to(`live_session_${donation.session_id}`).emit("queue_item_completed", {
          donationId: donation.id,
          donationUuid: donation.donation_uuid,
          status,
        });
        if (status === "read") {
          io.to(`live_session_${donation.session_id}`).emit("show_overlay_alert", alertPayload);
        }
      }
      if (donation.creator_id && status === "read") {
        io.to(`creator_${donation.creator_id}`).emit("show_overlay_alert", alertPayload);
        io.emit(`overlay_alert_${donation.creator_id}`, alertPayload);
      }
    }
  } catch (e) { }

  return { donation };
};

module.exports = {
  getSessionMessagesService,
  replyToDonationService,
  getOverlayDataService,
  getOverlayAlertsService,
  updateDonationStatusService,
};
