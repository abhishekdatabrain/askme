const { settleMonthService } = require('../admin/services/monthlySettlementService');

/**
 * Monthly Wallet Settlement Cron Scheduler
 * Checks and triggers monthly settlement for previous calendar month safely and idempotently.
 */
const startMonthlySettlementCron = (checkIntervalMs = 86400000) => {
  const runSettlementCheck = async () => {
    try {
      const now = new Date();
      // Calculate previous month string (YYYY-MM)
      const prevMonthDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
      const y = prevMonthDate.getUTCFullYear();
      const m = String(prevMonthDate.getUTCMonth() + 1).padStart(2, '0');
      const targetMonth = `${y}-${m}`;

      console.log(`[Settlement Cron] Running automatic monthly settlement check for month ${targetMonth}...`);
      const result = await settleMonthService({ month: targetMonth });
      console.log(`[Settlement Cron] Completed settlement for ${targetMonth}: ${result.settledCount} settled, ${result.alreadySettledCount} already settled.`);
    } catch (err) {
      console.warn(`[Settlement Cron Notice]: ${err.message}`);
    }
  };

  // Initial check on server start (delayed by 10s to ensure DB sync complete)
  setTimeout(runSettlementCheck, 10000);

  // Periodic interval check (default every 24h)
  const timer = setInterval(runSettlementCheck, checkIntervalMs);
  if (timer.unref) timer.unref();

  return timer;
};

module.exports = {
  startMonthlySettlementCron,
};
