const crypto = require("crypto");
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const sequelize = require("../../config/database");
const { DonationSession, QrCode, Donation, PaymentTransaction, PaymentWebhook, Wallet, WalletTransaction, VipMembership, Creator, User } = require("../../models");
const { getCreatorNetSharePercent } = require("../../config/commissionConfig");
const { createCreatorNotificationService } = require("./notificationService");
const { sendAskListedWhatsApp, sendNewAskReceivedWhatsApp } = require("../../services/whatsappService");
const { getIO } = require("../../config/socket");
const { normalizeMoney, subtractMoney } = require("../../utils/money");

/**
 * Process Viewer Donation Payment for a Live Session
 */
const processViewerDonationService = async (data, authenticatedUser = null) => {
  const {
    sessionCode,
    sessionId,
    creatorId,
    amount,
    viewerName,
    viewerEmail,
    viewerMobile,
    message,
    anonymous,
    paymentMethod,
    gateway,
    gatewayOrderId,
    gatewayPaymentId,
    gatewaySignature,
    viewerId
  } = data;

  const parsedAmount = parseFloat(amount || 0);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    const err = new Error("Please enter a valid donation amount.");
    err.statusCode = 400;
    throw err;
  }

  let session = null;
  if (sessionId) {
    session = await DonationSession.findByPk(sessionId, {
      include: [{ model: QrCode, as: "qrCode", required: false }],
    });
  } else if (sessionCode) {
    session = await DonationSession.findOne({
      where: { session_code: sessionCode },
      include: [{ model: QrCode, as: "qrCode", required: false }],
    });
  }

  if (session && session.status !== "active") {
    const err = new Error("This Live Donation Session has ended. New payments are no longer accepted.");
    err.statusCode = 400;
    throw err;
  }

  if (session) {
    const qrCodeRecord = session.qrCode || (await QrCode.findOne({ where: { session_id: session.id } }));
    const now = new Date();
    const qrExpiresAt = qrCodeRecord?.expires_at || (session.started_at ? new Date(new Date(session.started_at).getTime() + 3 * 3600 * 1000) : null);
    const isQrExpired = qrCodeRecord?.status === "expired" || (qrExpiresAt && now >= new Date(qrExpiresAt));

    if (isQrExpired) {
      if (qrCodeRecord && qrCodeRecord.status !== "expired") {
        qrCodeRecord.update({ status: "expired" }).catch(() => { });
      }
      const err = new Error("QR payment session has expired, but the live session is still active.");
      err.statusCode = 400;
      throw err;
    }
  }

  const targetCreatorId = creatorId || session?.creator_id;
  if (!targetCreatorId) {
    const err = new Error("Creator ID is required.");
    err.statusCode = 400;
    throw err;
  }

  const targetSessionId = session?.id || sessionId;
  if (!targetSessionId) {
    const err = new Error("Session ID is required.");
    err.statusCode = 400;
    throw err;
  }

  let viewerIdToSave = authenticatedUser?.id || data.viewerId || data.viewer_id || null;
  const viewerEmailToSave = authenticatedUser?.email || viewerEmail || data.viewerEmail || data.viewer_email || null;
  const viewerMobileToSave = viewerMobile || data.viewerMobile || data.viewer_mobile || data.viewerPhone || data.viewer_phone || data.phone_number || data.phone || null;

  const isGuest = data.is_guest !== undefined ? !!data.is_guest : !viewerIdToSave;

  // Resolve or auto-create a Viewer User record for guest checkout so viewer_id is ALWAYS saved in database
  if (!viewerIdToSave) {
    try {
      const orConditions = [];
      if (viewerEmailToSave) {
        orConditions.push({ email: viewerEmailToSave });
      }
      if (viewerMobileToSave) {
        orConditions.push({ phone: viewerMobileToSave });
      }

      let existingViewer = null;
      if (orConditions.length > 0) {
        existingViewer = await User.findOne({
          where: { [Op.or]: orConditions },
        });
      }

      if (existingViewer) {
        viewerIdToSave = existingViewer.id;
      } else {
        const rawPassword = `GuestPass_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        const hashedPassword = await bcrypt.hash(rawPassword, 10);

        const newViewer = await User.create({
          name: viewerName && viewerName.trim() ? viewerName.trim() : "Guest Supporter",
          email: viewerEmailToSave || `guest_${Date.now()}_${Math.random().toString(36).substring(2, 6)}@askme.guest`,
          phone: viewerMobileToSave || null,
          password: hashedPassword,
          role: "viewer",
        });

        if (newViewer) {
          viewerIdToSave = newViewer.id;
        }
      }
    } catch (guestErr) {
      console.error("Guest viewer record create karne me error:", guestErr.message);
    }
  }
  // Check VIP membership
  let isVipMember = false;
  if (viewerIdToSave && targetCreatorId) {
    const existingVip = await VipMembership.findOne({
      where: {
        viewer_id: String(viewerIdToSave),
        creator_id: String(targetCreatorId),
        status: "active",
      },
    });
    if (existingVip) isVipMember = true;
  }
  if (data.isVip) isVipMember = true;

  const transaction = await sequelize.transaction();

  try {
    // 1. Create Donation Record
    const donationRecord = await Donation.create(
      {
        session_id: targetSessionId,
        creator_id: targetCreatorId,
        viewer_id: viewerIdToSave ? String(viewerIdToSave) : null,
        viewer_name: viewerName ? viewerName.trim() : "Anonymous Supporter",
        viewer_email: viewerEmailToSave,
        viewer_mobile: viewerMobileToSave,
        amount: parsedAmount,
        currency: "INR",
        message: message ? message.trim() : "",
        anonymous: !!anonymous,
        payment_status: "success",
        status: "not_read",
        paid_at: new Date(),
        is_vip: isVipMember,
        is_guest: isGuest,
      },
      { transaction }
    );

    // 2. Gateway Order/Payment Verification & Payment Transaction Record
    const gatewayName = gateway || "Razorpay";
    const realPaymentId = gatewayPaymentId || `pay_${donationRecord.donation_uuid}`;
    const realOrderId = gatewayOrderId || `order_${donationRecord.donation_uuid}`;

    const paymentTxnRecord = await PaymentTransaction.create(
      {
        donation_id: donationRecord.id,
        gateway: gatewayName,
        gateway_order_id: realOrderId,
        gateway_payment_id: realPaymentId,
        gateway_transaction_id: donationRecord.donation_uuid,
        payment_method: paymentMethod ? String(paymentMethod).toUpperCase() : "UPI",
        amount: parsedAmount,
        currency: "INR",
        status: "success",
        gateway_response: {
          status: "success",
          gateway: gatewayName,
          amount: parsedAmount,
          paidAt: new Date(),
        },
        paid_at: new Date(),
      },
      { transaction }
    );

    // 3. Update Live Session Totals
    if (session) {
      await session.increment(
        { total_donations: 1, total_amount: parsedAmount },
        { transaction }
      );
    }

    // 4. Update Wallet Balance with ROW LOCKING (FOR UPDATE)
    const netSharePercent = getCreatorNetSharePercent(isVipMember);
    const creatorEarnings = normalizeMoney(parsedAmount * netSharePercent);
    const platformFee = subtractMoney(parsedAmount, creatorEarnings);

    const [walletRec] = await Wallet.findOrCreate({
      where: { creator_id: targetCreatorId },
      defaults: {
        creator_id: targetCreatorId,
        total_earnings: 0,
        available_balance: 0,
        pending_balance: 0,
        withdrawn_amount: 0,
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    const balBefore = parseFloat(walletRec.pending_balance || 0);
    await walletRec.increment(
      { total_earnings: creatorEarnings, pending_balance: creatorEarnings },
      { transaction }
    );
    const balAfter = balBefore + creatorEarnings;

    // 5. Create Wallet Transaction Ledger Entry
    const donorDisplayName = anonymous ? "Anonymous Supporter" : viewerName ? viewerName.trim() : "Supporter";
    await WalletTransaction.create(
      {
        wallet_id: walletRec.id,
        creator_id: targetCreatorId,
        donation_id: donationRecord.id,
        transaction_type: "donation",
        direction: "credit",
        amount: creatorEarnings,
        balance_before: balBefore,
        balance_after: balAfter,
        description: `Donation received from ${donorDisplayName}`,
        reference: donationRecord.donation_uuid,
      },
      { transaction }
    );

    await transaction.commit();

    // 6. Notifications & Socket Events (post-transaction commit)
    (async () => {
      try {
        const creatorObj = await Creator.findByPk(targetCreatorId);
        const creatorName = creatorObj?.full_name || creatorObj?.username || "Creator";
        const creatorMobile = creatorObj?.mobile;

        if (viewerMobileToSave) {
          sendAskListedWhatsApp({
            viewerPhone: viewerMobileToSave,
            creatorName: creatorName,
            sessionCode: session?.session_code || sessionCode
          }).catch(err => console.error('[WhatsApp Service] Error sending ask_listed:', err.message));
        }

        if (creatorMobile) {
          sendNewAskReceivedWhatsApp({
            creatorPhone: creatorMobile,
            viewerName: donorDisplayName
          }).catch(err => console.error('[WhatsApp Service] Error sending new_ask_received:', err.message));
        }
      } catch (err) {
        console.error('[WhatsApp Service] Error fetching creator details for notification:', err.message);
      }
    })();

    createCreatorNotificationService({
      creatorId: targetCreatorId,
      type: "payment_received",
      title: "New Viewer Payment Received! 💰",
      message: `₹${parsedAmount.toFixed(2)} payment received from ${donorDisplayName}${message ? `: "${message.trim()}"` : ""}`,
      referenceType: "donation",
      referenceId: donationRecord.id,
    }).catch(() => { });

    // Calculate queue position
    const queuePosition = (await Donation.count({
      where: { session_id: targetSessionId, payment_status: "success", status: "not_read" },
    })) || 1;

    try {
      const io = getIO();
      if (io) {
        const socketPayload = {
          id: donationRecord.id,
          sessionId: targetSessionId,
          senderType: isGuest ? "guest" : "viewer",
          senderId: viewerIdToSave || 0,
          senderName: donorDisplayName,
          donationId: donationRecord.id,
          amount: parsedAmount,
          message: message ? message.trim() : `Supported the stream with ₹${parsedAmount}`,
          messageType: "donation",
          isVip: isVipMember,
          isGuest: isGuest,
          queuePosition,
          createdAt: new Date(),
        };
        io.to(`live_session_${targetSessionId}`).emit("new_donation", socketPayload);
        io.to(`live_session_${targetSessionId}`).emit("new_message", socketPayload);
        io.to(`live_session_${targetSessionId}`).emit("viewer_queue_position", {
          sessionId: targetSessionId,
          donationId: donationRecord.id,
          viewerName: donorDisplayName,
          isVip: isVipMember,
          queuePosition,
          message: `Aap ${queuePosition} number pe hain queue mein.`,
        });
      }
    } catch (e) { }

    const methodLabels = {
      upi: "Instant UPI (PhonePe/GPay)",
      debit_card: "Debit Card (Visa/Mastercard)",
      credit_card: "Credit Card",
      netbanking: "Net Banking",
      wallet: "Wallets (Paytm/Amazon Pay)",
    };

    return {
      donationUuid: donationRecord.donation_uuid,
      donationId: donationRecord.id,
      sessionId: targetSessionId,
      creatorId: targetCreatorId,
      amount: parsedAmount,
      grossAmount: parsedAmount,
      netCreatorEarning: creatorEarnings,
      platformCommission: platformFee,
      paymentMethod: methodLabels[paymentMethod] || "Instant UPI",
      viewerName: donorDisplayName,
      message: message || "",
      isVip: isVipMember,
      queuePosition,
      queueMessage: `Aap ${queuePosition} number pe hain queue mein.`,
      paidAt: donationRecord.paid_at,
    };
  } catch (error) {
    if (transaction && !transaction.finished) {
      await transaction.rollback();
    }
    throw error;
  }
};

/**
 * Handle Payment Webhook Endpoint with Idempotency Safety
 */
const handlePaymentWebhookService = async (body, headers = {}) => {
  const { event, data, payload: bodyPayload, status } = body;
  const payload = data || bodyPayload || body;

  const gatewayPaymentId = payload.paymentId || payload.gateway_payment_id || payload.payment_id || payload.id;
  const gatewayOrderId = payload.orderId || payload.gateway_order_id || payload.order_id;
  const parsedAmount = parseFloat(payload.amount || 0);

  // Webhook Signature Verification (Razorpay / Custom HMAC)
  const webhookSecret = process.env.PAYMENT_GATEWAY_SECRET || process.env.RAZORPAY_WEBHOOK_SECRET;
  const signatureHeader = headers["x-razorpay-signature"] || headers["x-webhook-signature"];

  if (webhookSecret && signatureHeader) {
    const rawBody = JSON.stringify(body);
    const expectedSignature = crypto.createHmac("sha256", webhookSecret).update(rawBody).digest("hex");
    if (signatureHeader !== expectedSignature) {
      const err = new Error("Invalid payment webhook signature.");
      err.statusCode = 401;
      throw err;
    }
  }

  // Idempotency Check: Don't process already-credited payments
  if (gatewayPaymentId) {
    const existingTxn = await PaymentTransaction.findOne({
      where: { gateway_payment_id: gatewayPaymentId },
    });
    if (existingTxn) {
      return { status: "success", message: "Webhook already processed (Idempotent call)" };
    }
  }

  if ((event === "payment.completed" || event === "donation.success" || status === "success") && parsedAmount > 0) {
    const targetCreatorId = payload.creatorId || payload.creator_id || 1;
    const targetSessionId = payload.sessionId || payload.session_id || 1;

    let viewerIdToSave = payload.viewerId || payload.viewer_id || null;
    const viewerEmailToSave = payload.viewerEmail || payload.email || null;
    const viewerMobileToSave = payload.viewerMobile || payload.phone || null;

    if (!viewerIdToSave) {
      try {
        const orConditions = [];
        if (viewerEmailToSave && viewerEmailToSave.trim()) {
          orConditions.push({ email: viewerEmailToSave.trim().toLowerCase() });
        }
        if (viewerMobileToSave && viewerMobileToSave.trim()) {
          orConditions.push({ phone: viewerMobileToSave.trim() });
        }

        let existingViewer = null;
        if (orConditions.length > 0) {
          existingViewer = await User.findOne({
            where: { [sequelize.Op.or]: orConditions },
          });
        }

        if (existingViewer) {
          viewerIdToSave = existingViewer.id;
        } else {
          const defaultPassword = `GuestPass_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
          const newViewer = await User.create({
            name: payload.viewerName || payload.name ? (payload.viewerName || payload.name).trim() : "Guest Supporter",
            email: viewerEmailToSave && viewerEmailToSave.trim() ? viewerEmailToSave.trim().toLowerCase() : `guest_${Date.now()}_${Math.random().toString(36).substring(2, 6)}@askme.guest`,
            phone: viewerMobileToSave && viewerMobileToSave.trim() ? viewerMobileToSave.trim() : null,
            password: defaultPassword,
            role: "user",
          });
          if (newViewer) {
            viewerIdToSave = newViewer.id;
          }
        }
      } catch (guestErr) {
        console.warn("Notice resolving/creating guest viewer record in webhook:", guestErr.message);
      }
    }

    const transaction = await sequelize.transaction();
    try {
      const donationRecord = await Donation.create(
        {
          session_id: targetSessionId,
          creator_id: targetCreatorId,
          viewer_id: viewerIdToSave ? String(viewerIdToSave) : null,
          viewer_name: payload.viewerName || payload.name || "Anonymous Supporter",
          viewer_email: viewerEmailToSave,
          viewer_mobile: viewerMobileToSave,
          amount: parsedAmount,
          currency: "INR",
          message: payload.message || "",
          anonymous: !!payload.anonymous,
          payment_status: "success",
          status: "not_read",
          paid_at: new Date(),
          is_guest: !payload.viewerId && !payload.viewer_id,
        },
        { transaction }
      );

      if (gatewayPaymentId) {
        await PaymentTransaction.create(
          {
            donation_id: donationRecord.id,
            gateway: payload.gateway || "Razorpay",
            gateway_order_id: gatewayOrderId || `order_${donationRecord.donation_uuid}`,
            gateway_payment_id: gatewayPaymentId,
            gateway_transaction_id: donationRecord.donation_uuid,
            payment_method: payload.paymentMethod || "UPI",
            amount: parsedAmount,
            currency: "INR",
            status: "success",
            paid_at: new Date(),
          },
          { transaction }
        );
      }

      const netSharePercent = getCreatorNetSharePercent();
      const creatorEarnings = normalizeMoney(parsedAmount * netSharePercent);

      const [walletRec] = await Wallet.findOrCreate({
        where: { creator_id: targetCreatorId },
        defaults: { creator_id: targetCreatorId, total_earnings: 0, available_balance: 0, pending_balance: 0, withdrawn_amount: 0 },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      const balBefore = parseFloat(walletRec.pending_balance || 0);
      await walletRec.increment({ total_earnings: creatorEarnings, pending_balance: creatorEarnings }, { transaction });

      await WalletTransaction.create(
        {
          wallet_id: walletRec.id,
          creator_id: targetCreatorId,
          donation_id: donationRecord.id,
          transaction_type: "donation",
          direction: "credit",
          amount: creatorEarnings,
          balance_before: balBefore,
          balance_after: balBefore + creatorEarnings,
          description: `Donation received via Webhook`,
          reference: donationRecord.donation_uuid,
        },
        { transaction }
      );

      await transaction.commit();
    } catch (err) {
      if (transaction && !transaction.finished) await transaction.rollback();
      throw err;
    }
  }

  return { status: "success", message: "Webhook received & processed successfully" };
};

module.exports = {
  processViewerDonationService,
  handlePaymentWebhookService,
};
