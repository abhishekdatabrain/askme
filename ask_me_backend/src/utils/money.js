/**
 * Controlled financial decimal utility functions.
 * Avoids JavaScript floating-point representation bugs.
 */

const normalizeMoney = (val) => {
  const num = parseFloat(val || 0);
  if (isNaN(num)) return 0.0;
  return Math.round(num * 100) / 100;
};

const addMoney = (a, b) => {
  return normalizeMoney(normalizeMoney(a) + normalizeMoney(b));
};

const subtractMoney = (a, b) => {
  return normalizeMoney(normalizeMoney(a) - normalizeMoney(b));
};

const calculateCommission = (grossAmount, commissionPercentage) => {
  const gross = normalizeMoney(grossAmount);
  const percent = parseFloat(commissionPercentage || 15);
  return normalizeMoney(gross * (percent / 100));
};

const calculateCreatorShare = (grossAmount, commissionPercentage) => {
  const gross = normalizeMoney(grossAmount);
  const commission = calculateCommission(gross, commissionPercentage);
  return subtractMoney(gross, commission);
};

module.exports = {
  normalizeMoney,
  addMoney,
  subtractMoney,
  calculateCommission,
  calculateCreatorShare,
};
