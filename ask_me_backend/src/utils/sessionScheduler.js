const { Op } = require('sequelize');
const DonationSession = require('../models/DonationSessionModels');

/**
 * 16. Auto Expiry Flow Scheduler (V1 Safety Mechanism):
 * Creator starts session -> ends_at = start + duration_hours (e.g. 4 hours)
 * Scheduler / Cron finds active sessions where ends_at <= NOW()
 * UPDATES: status = 'closed' (expired), ended_at = NOW()
 * Expired sessions immediately disappear from LIVE feed.
 */
const checkAndExpireSessions = async () => {
  try {
    const now = new Date();

    const [expiredCount] = await DonationSession.update(
      {
        status: 'closed',
        ended_at: now,
      },
      {
        where: {
          status: 'active',
          ends_at: {
            [Op.ne]: null,
            [Op.lte]: now,
          },
        },
      }
    ).catch((err) => {
      console.warn('Auto-expiry update notice:', err.message);
      return [0];
    });

    if (expiredCount > 0) {
      console.log(`[AUTO-EXPIRY SCHEDULER] ${expiredCount} live session(s) auto-expired at ${now.toISOString()}`);
    }
    return expiredCount;
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
    console.log(`[SESSION SCHEDULER] Auto-expiry runner active (Interval: ${intervalMs / 1000}s)`);
  }
};

module.exports = {
  checkAndExpireSessions,
  startSessionScheduler,
};
