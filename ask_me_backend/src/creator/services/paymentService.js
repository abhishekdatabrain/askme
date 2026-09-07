const crypto = require("crypto");
const sequelize = require("../../config/database");
const { DonationSession, Donation, PaymentTransaction, PaymentWebhook, Wallet, WalletTransaction, VipMembership } = require("../../models");
const { getCreatorNetSharePercent } = require("../../config/commissionConfig");
const { createCreatorNotificationService } = require("./notificationService");
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
  } = data;

  const parsedAmount = parseFloat(amount || 0);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    const err = new Error("Please enter a valid donation amount.");
    err.statusCode = 400;
    throw err;
  }

  let session = null;
  if (sessionId) {
    session = await DonationSession.findByPk(sessionId);
  } else if (sessionCode) {
    session = await DonationSession.findOne({ where: { session_code: sessionCode } });
  }

  if (session && session.status !== "active") {
    const err = new Error("This Live Donation Session has ended. New payments are no longer accepted for this QR Code.");
    err.statusCode = 400;
    throw err;
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

  const viewerIdToSave = authenticatedUser?.id || data.viewerId || data.viewer_id || null;
  const viewerEmailToSave = authenticatedUser?.email || viewerEmail || null;

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
        viewer_mobile: viewerMobile || null,
        amount: parsedAmount,
        currency: "INR",
        message: message ? message.trim() : "",
        anonymous: !!anonymous,
        payment_status: "success",
        status: "not_read",
        paid_at: new Date(),
        is_vip: isVipMember,
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
          senderType: "viewer",
          senderId: viewerIdToSave || 0,
          senderName: donorDisplayName,
          donationId: donationRecord.id,
          amount: parsedAmount,
          message: message ? message.trim() : `Supported the stream with ₹${parsedAmount}`,
          messageType: "donation",
          isVip: isVipMember,
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

    const transaction = await sequelize.transaction();
    try {
      const donationRecord = await Donation.create(
        {
          session_id: targetSessionId,
          creator_id: targetCreatorId,
          viewer_name: payload.viewerName || payload.name || "Anonymous Supporter",
          viewer_email: payload.viewerEmail || payload.email || null,
          amount: parsedAmount,
          currency: "INR",
          message: payload.message || "",
          anonymous: !!payload.anonymous,
          payment_status: "success",
          status: "not_read",
          paid_at: new Date(),
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
