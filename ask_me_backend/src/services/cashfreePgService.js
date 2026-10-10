const https = require('https');
const dotenv = require('dotenv');
dotenv.config();

const { DonationSession, QrCode, Donation, PaymentTransaction } = require('../models');
const { processViewerDonationService } = require('../creator/services/paymentService');

// In-memory store for pending Cashfree payment orders
const cashfreePendingOrders = new Map();

/**
 * Helper to execute HTTP Requests to Cashfree Payment Gateway (PG) API v3
 */
const callCashfreePgAPI = (path, payload = null, method = 'POST') => {
  const clientId = process.env.CASHFREE_PAYMENT_CLIENT_ID || process.env.CASHFREE_CLIENT_ID || '';
  const clientSecret = process.env.CASHFREE_PAYMENT_CLIENT_SECRET || process.env.CASHFREE_CLIENT_SECRET || '';
  const envMode = (process.env.CASHFREE_PAYMENT_ENV || process.env.CASHFREE_ENV || 'sandbox').toLowerCase();
  let apiVersion = process.env.CASHFREE_PAYMENT_API_VERSION || '2023-08-01';
  if (apiVersion === '2026-01-01' || !apiVersion.startsWith('202')) {
    apiVersion = '2023-08-01';
  }

  const isProd = envMode === 'production' || envMode === 'prod';
  const hostname = isProd ? 'api.cashfree.com' : 'sandbox.cashfree.com';

  const postData = payload ? JSON.stringify(payload) : '';

  const headers = {
    'x-client-id': clientId,
    'x-client-secret': clientSecret,
    'x-api-version': apiVersion,
    'Content-Type': 'application/json',
  };

  if (postData) {
    headers['Content-Length'] = Buffer.byteLength(postData);
  }

  const options = {
    hostname,
    port: 443,
    path: `/pg${path}`,
    method,
    headers,
  };

  return new Promise((resolve) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ statusCode: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ statusCode: res.statusCode, rawBody: body });
        }
      });
    });

    req.on('error', (err) => {
      resolve({ statusCode: 500, error: err.message });
    });

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
};

/**
 * Create Cashfree Payment Order
 */
const createCashfreeOrderService = async (data, authenticatedUser = null) => {
  const {
    sessionCode,
    sessionId,
    creatorId,
    amount,
    viewerName,
    viewerEmail,
    viewerPhone,
    message,
    anonymous,
    agreedToConsent,
    idempotencyKey,
    verificationToken,
    viewerId,
  } = data;

  const parsedAmount = parseFloat(amount || 0);
  if (isNaN(parsedAmount) || parsedAmount < 40) {
    const err = new Error('Minimum donation amount is ₹40.');
    err.statusCode = 400;
    throw err;
  }
  if (parsedAmount > 99999) {
    const err = new Error('Maximum donation amount is ₹99,999.');
    err.statusCode = 400;
    throw err;
  }

  // Check live session validity
  let session = null;
  if (sessionId) {
    session = await DonationSession.findByPk(sessionId, {
      include: [{ model: QrCode, as: 'qrCode', required: false }],
    });
  } else if (sessionCode) {
    session = await DonationSession.findOne({
      where: { session_code: sessionCode },
      include: [{ model: QrCode, as: 'qrCode', required: false }],
    });
  }

  if (session && session.status !== 'active') {
    const err = new Error('This Live Donation Session has ended. New payments are no longer accepted.');
    err.statusCode = 400;
    throw err;
  }

  const targetCreatorId = creatorId || session?.creator_id;
  const targetSessionId = session?.id || sessionId;

  const orderId = `cf_order_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const clientId = process.env.CASHFREE_PAYMENT_CLIENT_ID || process.env.CASHFREE_CLIENT_ID || '';
  const envMode = (process.env.CASHFREE_PAYMENT_ENV || process.env.CASHFREE_ENV || 'sandbox').toLowerCase();
  const isProd = envMode === 'production' || envMode === 'prod';

  // Sanitize customer details for Cashfree API requirements
  const cleanPhone = (phone) => {
    if (!phone) return '9999999999';
    const digits = String(phone).replace(/\D/g, '');
    return digits.length >= 10 ? digits.slice(-10) : '9999999999';
  };
  const cleanEmail = (email) => {
    if (email && String(email).includes('@')) return String(email).trim();
    return 'supporter@askme.live';
  };

  const orderPayload = {
    order_id: orderId,
    order_amount: parsedAmount,
    order_currency: 'INR',
    customer_details: {
      customer_id: `cust_${authenticatedUser?.id || viewerId || Date.now()}`,
      customer_name: viewerName && String(viewerName).trim() ? String(viewerName).trim() : 'Supporter',
      customer_email: cleanEmail(viewerEmail),
      customer_phone: cleanPhone(viewerPhone),
    },
    order_note: `AskMe Question for Session ${sessionCode || targetSessionId}`,
  };

  let paymentSessionId = '';

  if (clientId) {
    const pgRes = await callCashfreePgAPI('/orders', orderPayload, 'POST');
    if ((pgRes.statusCode === 200 || pgRes.statusCode === 201) && pgRes.data && pgRes.data.payment_session_id) {
      paymentSessionId = pgRes.data.payment_session_id;
    } else {
      console.error('[Cashfree PG Order Error]', pgRes.statusCode, pgRes.data || pgRes.rawBody);
      const errorMessage = pgRes.data?.message || pgRes.data?.error || `Cashfree order creation failed with status ${pgRes.statusCode}`;
      const err = new Error(errorMessage);
      err.statusCode = pgRes.statusCode >= 400 && pgRes.statusCode < 600 ? pgRes.statusCode : 500;
      throw err;
    }
  } else {
    paymentSessionId = `cf_session_mock_${Date.now()}`;
  }

  // Cache pending order details for verification
  cashfreePendingOrders.set(orderId, {
    orderId,
    paymentSessionId,
    idempotencyKey,
    verificationToken,
    sessionCode,
    sessionId: targetSessionId,
    creatorId: targetCreatorId,
    amount: parsedAmount,
    viewerName,
    viewerEmail,
    viewerPhone,
    message,
    anonymous: !!anonymous,
    agreedToConsent: !!agreedToConsent,
    viewerId: authenticatedUser?.id || viewerId || null,
    createdAt: Date.now(),
  });

  return {
    orderId,
    paymentSessionId,
    environment: isProd ? 'production' : 'sandbox',
  };
};

/**
 * Verify Cashfree Payment Order & Process Donation (Idempotent)
 */
const verifyCashfreeOrderService = async (data) => {
  const { orderId, verificationToken } = data;

  if (!orderId) {
    const err = new Error('Order ID is required for verification.');
    err.statusCode = 400;
    throw err;
  }

  // 1. Idempotency Check: Return existing successful donation if already processed
  const existingTxn = await PaymentTransaction.findOne({
    where: { gateway: 'Cashfree', gateway_order_id: orderId },
  });

  if (existingTxn) {
    const existingDonation = await Donation.findByPk(existingTxn.donation_id);
    return {
      paymentStatus: 'success',
      result: {
        donationUuid: existingDonation?.donation_uuid,
        donationId: existingDonation?.id,
        sessionId: existingDonation?.session_id,
        creatorId: existingDonation?.creator_id,
        amount: parseFloat(existingDonation?.amount || 0),
        viewerName: existingDonation?.viewer_name,
        message: existingDonation?.message,
        paidAt: existingDonation?.paid_at,
      },
    };
  }

  // 2. Fetch order attempt metadata from cache
  const pendingData = cashfreePendingOrders.get(orderId);
  const clientId = process.env.CASHFREE_PAYMENT_CLIENT_ID || process.env.CASHFREE_CLIENT_ID || '';

  let cfPaymentStatus = 'SUCCESS';
  let gatewayPaymentId = `cf_pay_${orderId}`;
  let paymentGroup = 'UPI';

  if (clientId) {
    const pgRes = await callCashfreePgAPI(`/orders/${orderId}/payments`, null, 'GET');
    if (pgRes.statusCode === 200 && Array.isArray(pgRes.data) && pgRes.data.length > 0) {
      const latestPayment = pgRes.data[0];
      cfPaymentStatus = latestPayment.payment_status || 'SUCCESS';
      if (latestPayment.cf_payment_id) {
        gatewayPaymentId = String(latestPayment.cf_payment_id);
      }
      if (latestPayment.payment_group) {
        paymentGroup = latestPayment.payment_group;
      }
    } else if (pgRes.statusCode === 200 && pgRes.data && pgRes.data.order_status) {
      if (pgRes.data.order_status === 'PAID') {
        cfPaymentStatus = 'SUCCESS';
      } else if (pgRes.data.order_status === 'EXPIRED') {
        cfPaymentStatus = 'FAILED';
      } else {
        cfPaymentStatus = 'PENDING';
      }
    }
  }

  if (cfPaymentStatus === 'PENDING') {
    return { paymentStatus: 'pending', hasPendingPayment: true };
  }

  if (cfPaymentStatus === 'FAILED' || cfPaymentStatus === 'CANCELLED' || cfPaymentStatus === 'USER_DROPPED') {
    return { paymentStatus: 'failed' };
  }

  // 3. Process viewer donation & wallet credit idempotently
  const donationPayload = {
    sessionCode: pendingData?.sessionCode,
    sessionId: pendingData?.sessionId,
    creatorId: pendingData?.creatorId,
    amount: pendingData?.amount || 100,
    viewerName: pendingData?.viewerName,
    viewerEmail: pendingData?.viewerEmail,
    viewerMobile: pendingData?.viewerPhone,
    message: pendingData?.message,
    anonymous: pendingData?.anonymous,
    paymentMethod: paymentGroup,
    gateway: 'Cashfree',
    gatewayOrderId: orderId,
    gatewayPaymentId: gatewayPaymentId,
    viewerId: pendingData?.viewerId,
  };

  const result = await processViewerDonationService(donationPayload, null);

  // Clear cache
  cashfreePendingOrders.delete(orderId);

  return {
    paymentStatus: 'success',
    result,
  };
};

/**
 * Handle Cashfree Webhook
 */
const handleCashfreeWebhookService = async (body, headers = {}) => {
  const payload = body?.data || body;
  const orderId = payload?.order?.order_id || payload?.order_id;
  const paymentStatus = payload?.payment?.payment_status || payload?.payment_status;

  if (orderId && (paymentStatus === 'SUCCESS' || body?.event === 'PAYMENT_SUCCESS_WEBHOOK')) {
    try {
      await verifyCashfreeOrderService({ orderId });
    } catch (err) {
      console.error('[Cashfree Webhook] Error:', err.message);
    }
  }

  return { status: 'OK' };
};

module.exports = {
  createCashfreeOrderService,
  verifyCashfreeOrderService,
  handleCashfreeWebhookService,
};
