const { Op } = require('sequelize');
const QrCode = require('../models/QrCodeModel');
const DonationSession = require('../models/DonationSessionModels');
const { getIO } = require('../config/socket');

/**
 * 16. Auto Expiry Flow Scheduler (Independent QR Expiry Mechanism):
 * Creator starts broadcast session -> QR Code expires in exactly 3 hours (expires_at)
 * Scheduler / Cron finds active QR codes where expires_at <= NOW()
 * UPDATES: QrCode.status = 'expired'
 * NOTE: Live broadcast session (donation_sessions.status) remains 'active' until ended by creator/stream.
 */
const checkAndExpireSessions = async () => {
  try {
    const now = new Date();

    // Find active QR codes whose expiry time has passed
    const expiredQrRecords = await QrCode.findAll({
      where: {
        status: 'active',
        expires_at: {
          [Op.ne]: null,
          [Op.lte]: now,
        },
      },
    });

    if (expiredQrRecords.length > 0) {
      const expiredSessionIds = expiredQrRecords.map((qr) => qr.session_id);

      await QrCode.update(
        { status: 'expired' },
        {
          where: {
            id: expiredQrRecords.map((qr) => qr.id),
          },
        }
      );

      console.log(`[AUTO-EXPIRY SCHEDULER] ${expiredQrRecords.length} QR code session(s) expired at ${now.toISOString()}`);

      // Broadcast real-time Socket.IO notification to active session rooms
      try {
        const io = getIO();
        if (io) {
          expiredSessionIds.forEach((sessionId) => {
            const roomName = `live_session_${sessionId}`;
            io.to(roomName).emit('qr_status_changed', {
              sessionId,
              qrStatus: 'expired',
              isQrExpired: true,
              message: 'QR payment session has expired, but the live session is still active.',
            });
          });
        }
      } catch (socketErr) {
        console.warn('Notice: Socket.IO emit error during QR expiry:', socketErr.message);
      }
    }

    return expiredQrRecords.length;
  } catch (error) {
    console.error('[AUTO-EXPIRY SCHEDULER ERROR]:', error.message);
    return 0;
  }
};

let schedulerTimer = null;

const startSessionScheduler = (intervalMs = 30000) => {
  // Immediate check on boot
  checkAndExpireSessions();

  // Recurring cron interval
  if (!schedulerTimer) {
    schedulerTimer = setInterval(checkAndExpireSessions, intervalMs);
    console.log(`[SESSION SCHEDULER] QR 3-Hour Expiry runner active (Interval: ${intervalMs / 1000}s)`);
  }
};

module.exports = {
  checkAndExpireSessions,
  startSessionScheduler,
};
