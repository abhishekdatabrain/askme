const commissionRepository = require('../repositories/commissionRepository');
const { getCommissionConfig, updateCommissionConfig } = require('../../config/commissionConfig');

class CommissionService {
  async getCommissionSettings() {
    let dbSetting = null;
    try {
      dbSetting = await commissionRepository.getActiveSetting();
    } catch (e) {
      // Fallback
    }

    const config = getCommissionConfig();
    const platformPercent = dbSetting && dbSetting.commission_percentage !== null && dbSetting.commission_percentage !== undefined
      ? parseFloat(dbSetting.commission_percentage)
      : (config.platformCommissionPercent || 15);

    const minWithdrawal = dbSetting && dbSetting.minimum_withdrawal_amount !== null && dbSetting.minimum_withdrawal_amount !== undefined
      ? parseFloat(dbSetting.minimum_withdrawal_amount)
      : (config.minWithdrawalLimit || 500);

    return {
      ...config,
      platformCommissionPercent: platformPercent,
      minWithdrawalLimit: minWithdrawal,
      dbRecord: dbSetting ? dbSetting.toJSON() : null,
    };
  }

  async updateCommissionSettings(data, adminId, req) {
    const newPercent = data.platformCommissionPercent !== undefined
      ? parseFloat(data.platformCommissionPercent)
      : (data.commission_percentage !== undefined ? parseFloat(data.commission_percentage) : 15);

    const newMinWithdrawal = data.minWithdrawalLimit !== undefined
      ? parseFloat(data.minWithdrawalLimit)
      : (data.minimum_withdrawal_amount !== undefined ? parseFloat(data.minimum_withdrawal_amount) : 500);

    let updatedDbSetting = null;
    try {
      const dbResult = await commissionRepository.updateOrCreateSetting({
        commissionPercentage: newPercent,
        minimumWithdrawalAmount: newMinWithdrawal,
        currency: data.currency || 'INR',
      });
      updatedDbSetting = dbResult ? dbResult.toJSON() : null;
    } catch (e) {
      // Ignore DB notice
    }

    const updatedConfig = updateCommissionConfig({
      ...data,
      platformCommissionPercent: newPercent,
      minWithdrawalLimit: newMinWithdrawal,
    });

    return {
      ...updatedConfig,
      platformCommissionPercent: newPercent,
      minWithdrawalLimit: newMinWithdrawal,
      dbRecord: updatedDbSetting,
    };
  }
}

module.exports = new CommissionService();
