const sequelize = require("../../config/database");
const { Op } = require("sequelize");
const models = require("../../models");
const DonationSession = models.DonationSession || require("../../models/DonationSessionModels");
const CreatorsModel = models.CreatorsModel || models.Creator || require("../../models/CreatorsModel");
const CreatorProfile = models.CreatorProfile || require("../../models/CreatorProfileModel");
const Donation = models.Donation || require("../../models/DonationModel");
const QrCode = models.QrCode || require("../../models/QrCodeModel");
const { parsePagination, buildPaginationMeta } = require("../../utils/pagination");

/**
 * Create a new Live Donation Session
 */
const createLiveSessionService = async (creatorId, data) => {
  if (!creatorId) {
    const err = new Error("Creator ID is required.");
    err.statusCode = 400;
    throw err;
  }

  const { title, category, thumbnailUrl, description, streamingPlatform, streamUrl, durationHours } = data;

  if (!title || !String(title).trim()) {
    const err = new Error("Stream Title is required.");
    err.statusCode = 400;
    throw err;
  }

  const creator = await CreatorsModel.findByPk(creatorId);
  if (!creator) {
    const err = new Error("Creator not found.");
    err.statusCode = 404;
    throw err;
  }

  const durationNum = Number(durationHours) || 2;
  const endsAt = new Date(Date.now() + durationNum * 3600 * 1000);

  const uniqueSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const sessionCode = `${uniqueSlug}-${Math.random().toString(36).substring(2, 7)}`;

  const transaction = await sequelize.transaction();

  try {
    // Atomically close any previously active session for this creator
    await DonationSession.update(
      { status: "closed", ended_at: new Date() },
      { where: { creator_id: creatorId, status: "active" }, transaction }
    );

    const newSession = await DonationSession.create(
      {
        creator_id: creatorId,
        session_code: sessionCode,
        title: title.trim(),
        category: category || "",
        description: description || "",
        thumbnail_url: thumbnailUrl || "",
        stream_url: streamUrl || "",
        duration_hours: durationNum,
        ends_at: endsAt,
        status: "active",
        started_at: new Date(),
        total_donations: 0,
        total_amount: 0,
      },
      { transaction }
    );

    const origin = process.env.FRONTEND_URL || "http://localhost:3000";
    const paymentLink = `${origin}/pay/${sessionCode}?creatorId=${creatorId}&sessionId=${newSession.id}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(paymentLink)}`;
    const overlayUrl = `${origin}/overlay/${creator.username}`;

    await QrCode.create(
      {
        session_id: newSession.id,
        qr_token: `QR-${newSession.id}-${Date.now()}`,
        payment_url: paymentLink,
        qr_image_url: qrCodeUrl,
        status: "active",
      },
      { transaction }
    );

    await transaction.commit();

    return {
      session: {
        id: newSession.id,
        sessionCode: newSession.session_code,
        title: newSession.title,
        category: newSession.category,
        description: newSession.description,
        thumbnailUrl: newSession.thumbnail_url,
        streamUrl: newSession.stream_url,
        streamingPlatform: streamingPlatform || "YouTube Live",
        durationHours: newSession.duration_hours,
        endsAt: newSession.ends_at,
        status: newSession.status,
        startedAt: newSession.started_at,
        createdAt: newSession.createdAt,
        totalDonations: 0,
        totalAmount: 0,
      },
      paymentLink,
      qrCodeUrl,
      overlayUrl,
    };
  } catch (error) {
    if (transaction && !transaction.finished) {
      await transaction.rollback();
    }
    throw error;
  }
};

/**
 * Get Creator Live Sessions (Optimized - No N+1 queries)
 */
const getLiveSessionsService = async (creatorId, queryParams = {}) => {
  if (!creatorId) {
    const err = new Error("Creator ID is required.");
    err.statusCode = 400;
    throw err;
  }

  const { page, limit, offset } = parsePagination(queryParams);
  const { search, q, startDate, from, endDate, to, status } = queryParams;

  const whereCondition = { creator_id: creatorId };

  // Search filter (title, category, description, session_code)
  const searchTerm = (search || q || "").trim();
  if (searchTerm) {
    const searchPattern = `%${searchTerm}%`;
    whereCondition[Op.or] = [
      { title: { [Op.iLike]: searchPattern } },
      { category: { [Op.iLike]: searchPattern } },
      { description: { [Op.iLike]: searchPattern } },
      { session_code: { [Op.iLike]: searchPattern } },
    ];
  }

  // Status filter (active, closed, etc.)
  if (status && status.toLowerCase() !== "all") {
    whereCondition.status = status.toLowerCase();
  }

  // Date filter (startDate / endDate or from / to)
  const startStr = startDate || from;
  const endStr = endDate || to;
  if (startStr || endStr) {
    const dateCond = {};
    if (startStr) {
      const start = new Date(startStr);
      if (!isNaN(start.getTime())) {
        start.setHours(0, 0, 0, 0);
        dateCond[Op.gte] = start;
      }
    }
    if (endStr) {
      const end = new Date(endStr);
      if (!isNaN(end.getTime())) {
        end.setHours(23, 59, 59, 999);
        dateCond[Op.lte] = end;
      }
    }
    if (Object.getOwnPropertySymbols(dateCond).length > 0) {
      whereCondition[Op.and] = whereCondition[Op.and] || [];
      whereCondition[Op.and].push({
        [Op.or]: [
          { started_at: dateCond },
          { createdAt: dateCond }
        ]
      });
    }
  }

  const { count, rows: sessions } = await DonationSession.findAndCountAll({
    where: whereCondition,
    order: [["started_at", "DESC"]],
    limit,
    offset,
  });

  const sessionIds = sessions.map((s) => s.id);

  // Grouped query to fetch donation question counts for all sessions at once (Eliminates N+1!)
  let questionCountsMap = {};
  if (sessionIds.length > 0) {
    const counts = await Donation.findAll({
      attributes: ["session_id", [sequelize.fn("COUNT", sequelize.col("id")), "questionCount"]],
      where: {
        session_id: sessionIds,
        payment_status: "success",
      },
      group: ["session_id"],
      raw: true,
    });
    counts.forEach((c) => {
      questionCountsMap[c.session_id] = parseInt(c.questionCount, 10) || 0;
    });
  }

  const origin = process.env.FRONTEND_URL || "http://localhost:3000";
  const now = new Date();

  const formatted = sessions.map((s) => {
    const paymentLink = `${origin}/pay/${s.session_code}?creatorId=${s.creator_id}&sessionId=${s.id}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(paymentLink)}`;

    let curStatus = s.status;
    if (curStatus === "active" && s.ends_at && now > new Date(s.ends_at)) {
      curStatus = "closed";
      // Perform silent update without blocking response
      s.update({ status: "closed", ended_at: s.ends_at }).catch(() => { });
    }

    const questionCount = questionCountsMap[s.id] || s.total_donations || 0;

    return {
      id: s.id,
      sessionCode: s.session_code,
      title: s.title,
      category: s.category,
      description: s.description,
      thumbnailUrl: s.thumbnail_url,
      streamUrl: s.stream_url,
      durationHours: s.duration_hours || 2,
      endsAt: s.ends_at,
      status: curStatus,
      startedAt: s.started_at,
      createdAt: s.createdAt || s.started_at,
      endedAt: s.ended_at,
      totalDonations: s.total_donations || questionCount,
      totalAmount: parseFloat(s.total_amount || 0),
      questionCount,
      paymentLink,
      qrCodeUrl,
    };
  });

  const pagination = buildPaginationMeta(count, page, limit);

  return {
    sessions: formatted,
    pagination,
  };
};

/**
 * Close / End a Live Session
 */
const closeLiveSessionService = async (sessionId, creatorId) => {
  if (!sessionId) {
    const err = new Error("Session ID is required.");
    err.statusCode = 400;
    throw err;
  }

  const session = await DonationSession.findByPk(sessionId);
  if (!session) {
    const err = new Error("Live session not found.");
    err.statusCode = 404;
    throw err;
  }

  if (creatorId && String(session.creator_id) !== String(creatorId)) {
    const err = new Error("Unauthorized to close this live session.");
    err.statusCode = 403;
    throw err;
  }

  await session.update({
    status: "closed",
    ended_at: new Date(),
  });

  return {
    sessionId: session.id,
    status: "closed",
  };
};

/**
 * Start / Activate a Live Session by ID
 */
const startLiveSessionByIdService = async (sessionId, creatorId) => {
  if (!sessionId) {
    const err = new Error("Session ID is required.");
    err.statusCode = 400;
    throw err;
  }

  const session = await DonationSession.findByPk(sessionId);
  if (!session) {
    const err = new Error("Live session not found.");
    err.statusCode = 404;
    throw err;
  }

  const targetCreatorId = creatorId || session.creator_id;
  if (creatorId && String(session.creator_id) !== String(creatorId)) {
    const err = new Error("Unauthorized to manage this live session.");
    err.statusCode = 403;
    throw err;
  }

  const transaction = await sequelize.transaction();

  try {
    // Atomically close any existing active session for this creator
    await DonationSession.update(
      { status: "closed", ended_at: new Date() },
      { where: { creator_id: targetCreatorId, status: "active" }, transaction }
    );

    const durationNum = Number(session.duration_hours || 2);
    const endsAt = new Date(Date.now() + durationNum * 3600 * 1000);

    await session.update(
      {
        status: "active",
        started_at: new Date(),
        ends_at: endsAt,
        ended_at: null,
      },
      { transaction }
    );

    await transaction.commit();

    const origin = process.env.FRONTEND_URL || "http://localhost:3000";
    const paymentLink = `${origin}/pay/${session.session_code}?creatorId=${session.creator_id}&sessionId=${session.id}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(paymentLink)}`;

    return {
      session: {
        id: session.id,
        sessionCode: session.session_code,
        title: session.title,
        category: session.category,
        description: session.description,
        thumbnailUrl: session.thumbnail_url,
        durationHours: durationNum,
        endsAt,
        status: "active",
        startedAt: session.started_at,
        paymentLink,
        qrCodeUrl,
      },
    };
  } catch (error) {
    if (transaction && !transaction.finished) {
      await transaction.rollback();
    }
    throw error;
  }
};

/**
 * Get Public Live Session Details
 */
const getPublicSessionDetailsService = async (sessionCode) => {
  if (!sessionCode) {
    const err = new Error("Session code is required.");
    err.statusCode = 400;
    throw err;
  }

  let session = await DonationSession.findOne({ where: { session_code: sessionCode } });

  if (!session && !isNaN(sessionCode)) {
    session = await DonationSession.findByPk(sessionCode);
  }

  if (!session) {
    const err = new Error("Live Donation Session not found.");
    err.statusCode = 404;
    throw err;
  }

  if (session.status === "active" && session.ends_at && new Date() > new Date(session.ends_at)) {
    await session.update({ status: "closed", ended_at: session.ends_at }).catch(() => { });
  }

  const creator = await CreatorsModel.findByPk(session.creator_id);
  const profile = await CreatorProfile.findOne({ where: { creator_id: session.creator_id } });

  const origin = process.env.FRONTEND_URL || "http://localhost:3000";
  const paymentLink = `${origin}/pay/${session.session_code}?creatorId=${session.creator_id}&sessionId=${session.id}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(paymentLink)}`;

  return {
    session: {
      id: session.id,
      sessionCode: session.session_code,
      title: session.title,
      category: session.category,
      description: session.description,
      thumbnailUrl: session.thumbnail_url,
      streamUrl: session.stream_url,
      status: session.status,
      endsAt: session.ends_at,
      startedAt: session.started_at,
      totalDonations: session.total_donations || 0,
      totalAmount: parseFloat(session.total_amount || 0),
    },
    creator: {
      id: creator?.id || session.creator_id,
      fullName: creator?.full_name || "Creator Host",
      username: creator?.username ? `@${creator.username}` : "@creator",
      profileImage: creator?.profile_image || "",
      bio: profile?.bio || "",
    },
    paymentLink,
    qrCodeUrl,
  };
};

/**
 * Get Questions/Donations for a specific session (with search & date filter support)
 */
const getSessionQuestionsService = async (sessionId, queryParams = {}) => {
  if (!sessionId) {
    const err = new Error("Session ID is required.");
    err.statusCode = 400;
    throw err;
  }

  const { page, limit, offset } = parsePagination(queryParams);
  const { search, q, startDate, from, endDate, to, filter, type } = queryParams;

  const whereCondition = {
    session_id: sessionId,
    payment_status: "success",
  };

  // Filter by members vs superchat
  const targetType = (filter || type || "").toLowerCase();
  if (targetType === "members" || targetType === "priority" || targetType === "vip") {
    whereCondition.is_vip = true;
  } else if (targetType === "superchat") {
    whereCondition[Op.or] = [
      { is_vip: false },
      { is_vip: null }
    ];
  }

  // Search filter (viewer_name, viewer_email, message)
  const searchTerm = (search || q || "").trim();
  if (searchTerm) {
    const searchPattern = `%${searchTerm}%`;
    whereCondition[Op.or] = [
      { viewer_name: { [Op.iLike]: searchPattern } },
      { viewer_email: { [Op.iLike]: searchPattern } },
      { message: { [Op.iLike]: searchPattern } },
    ];
  }

  // Date filter (startDate / endDate or from / to)
  const startStr = startDate || from;
  const endStr = endDate || to;
  if (startStr || endStr) {
    const dateCond = {};
    if (startStr) {
      const start = new Date(startStr);
      if (!isNaN(start.getTime())) {
        start.setHours(0, 0, 0, 0);
        dateCond[Op.gte] = start;
      }
    }
    if (endStr) {
      const end = new Date(endStr);
      if (!isNaN(end.getTime())) {
        end.setHours(23, 59, 59, 999);
        dateCond[Op.lte] = end;
      }
    }
    if (Object.getOwnPropertySymbols(dateCond).length > 0) {
      whereCondition[Op.and] = whereCondition[Op.and] || [];
      whereCondition[Op.and].push({
        [Op.or]: [
          { paid_at: dateCond },
          { createdAt: dateCond }
        ]
      });
    }
  }

  const { count, rows: records } = await Donation.findAndCountAll({
    where: whereCondition,
    order: [["created_at", "DESC"]],
    limit,
    offset,
  });

  const questions = records.map((d) => ({
    id: d.id,
    donationUuid: d.donation_uuid,
    viewerName: d.anonymous ? "Anonymous Supporter" : d.viewer_name || "Supporter",
    viewerEmail: d.viewer_email || "",
    amount: parseFloat(d.amount || 0),
    message: d.message || "",
    paidAt: d.paid_at || d.createdAt,
    isVip: !!d.is_vip,
    status: d.status || "not_read",
  }));

  // Sort VIP questions first in queue
  questions.sort((a, b) => {
    const aVip = a.isVip ? 1 : 0;
    const bVip = b.isVip ? 1 : 0;
    if (bVip !== aVip) return bVip - aVip;
    return new Date(a.paidAt || 0) - new Date(b.paidAt || 0);
  });

  const pagination = buildPaginationMeta(count, page, limit);

  return {
    questions,
    pagination,
  };
};

module.exports = {
  createLiveSessionService,
  getLiveSessionsService,
  closeLiveSessionService,
  startLiveSessionByIdService,
  getPublicSessionDetailsService,
  getSessionQuestionsService,
};
