// Global Dynamic Commission & Payout Configuration

let commissionSettings = {
  platformCommissionPercent: 3, // Default 3% platform cut
  vipCommissionPercent: 10,     // Default 10% VIP creator cut
  minWithdrawalLimit: 500,        // Default ₹500 minimum payout threshold
  autoPayoutEnabled: true,
  historyLogs: [
    { id: 'LOG-101', date: '2026-08-15 14:00', title: 'Platform Fee configured', detail: 'Default global commission cut active for all creators.', admin: 'Super Admin' },
    { id: 'LOG-102', date: '2026-08-12 10:30', title: 'Minimum Withdrawal set to ₹500', detail: 'Payout requests enabled for balances above ₹500.', admin: 'Super Admin' }
  ]
};

const getCommissionConfig = () => {
  return commissionSettings;
};

const setInMemoryCommission = (settings) => {
  if (settings.platformCommissionPercent !== undefined && settings.platformCommissionPercent !== null) {
    commissionSettings.platformCommissionPercent = parseFloat(settings.platformCommissionPercent);
  }
  if (settings.vipCommissionPercent !== undefined && settings.vipCommissionPercent !== null) {
    commissionSettings.vipCommissionPercent = parseFloat(settings.vipCommissionPercent);
  }
  if (settings.minWithdrawalLimit !== undefined && settings.minWithdrawalLimit !== null) {
    commissionSettings.minWithdrawalLimit = parseFloat(settings.minWithdrawalLimit);
  }
};

const updateCommissionConfig = (newSettings, adminName = 'Super Admin') => {
  if (newSettings.platformCommissionPercent !== undefined && newSettings.platformCommissionPercent !== null) {
    commissionSettings.platformCommissionPercent = parseFloat(newSettings.platformCommissionPercent);
  }
  if (newSettings.vipCommissionPercent !== undefined && newSettings.vipCommissionPercent !== null) {
    commissionSettings.vipCommissionPercent = parseFloat(newSettings.vipCommissionPercent);
  }
  if (newSettings.minWithdrawalLimit !== undefined && newSettings.minWithdrawalLimit !== null) {
    commissionSettings.minWithdrawalLimit = parseFloat(newSettings.minWithdrawalLimit);
  }

  // Add audit log
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const localDateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

  commissionSettings.historyLogs.unshift({
    id: `LOG-${Date.now().toString().slice(-4)}`,
    date: localDateStr,
    title: `Platform Cut updated to ${commissionSettings.platformCommissionPercent}%`,
    detail: `Minimum withdrawal limit set to ₹${commissionSettings.minWithdrawalLimit}.`,
    admin: adminName
  });

  return commissionSettings;
};

// const getCreatorNetSharePercent = (isVip = false) => {
//   const platformCut = isVip ? commissionSettings.vipCommissionPercent : commissionSettings.platformCommissionPercent;
//   return (100 - platformCut) / 100;
// };
const getCreatorNetSharePercent = (isVip = false, overridePlatformCut = null) => {
  const platformCut = overridePlatformCut !== null && overridePlatformCut !== undefined && !isNaN(Number(overridePlatformCut))
    ? Number(overridePlatformCut)
    : (isVip
        ? commissionSettings.vipCommissionPercent
        : commissionSettings.platformCommissionPercent);

  const gstPercent = 18;
  const gatewayFeePercent = 2;

  // Platform commission
  const platformFee = platformCut;

  // GST on platform commission
  const gstOnPlatformFee = (platformFee * gstPercent) / 100;

  // Payment gateway fee on total transaction
  const gatewayFee = gatewayFeePercent;

  // Creator receives remaining amount
  const creatorShare =
    100 - platformFee - gstOnPlatformFee - gatewayFee;

  return creatorShare / 100;
};

const getPlatformCutPercent = (isVip = false, overridePlatformCut = null) => {
  const platformCut = overridePlatformCut !== null && overridePlatformCut !== undefined && !isNaN(Number(overridePlatformCut))
    ? Number(overridePlatformCut)
    : (isVip
        ? commissionSettings.vipCommissionPercent
        : commissionSettings.platformCommissionPercent);
  return platformCut / 100;
};

module.exports = {
  getCommissionConfig,
  setInMemoryCommission,
  updateCommissionConfig,
  getCreatorNetSharePercent,
  getPlatformCutPercent,
};
