const commissionRepository = require('../repositories/commissionRepository');
const { getCommissionConfig, updateCommissionConfig, setInMemoryCommission } = require('../../config/commissionConfig');

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
      : (config.platformCommissionPercent !== undefined ? config.platformCommissionPercent : 15);

    const minWithdrawal = dbSetting && dbSetting.minimum_withdrawal_amount !== null && dbSetting.minimum_withdrawal_amount !== undefined
      ? parseFloat(dbSetting.minimum_withdrawal_amount)
      : (config.minWithdrawalLimit || 500);

    setInMemoryCommission({
      platformCommissionPercent: platformPercent,
      minWithdrawalLimit: minWithdrawal,
    });

    return {
      ...config,
      platformCommissionPercent: platformPercent,
      commission_percentage: platformPercent,
      minWithdrawalLimit: minWithdrawal,
      minimum_withdrawal_amount: minWithdrawal,
      dbRecord: dbSetting ? dbSetting.toJSON() : null,
    };
  }

  async updateCommissionSettings(data, adminId, req) {
    const newPercent = data.platformCommissionPercent !== undefined && data.platformCommissionPercent !== null
      ? parseFloat(data.platformCommissionPercent)
      : (data.commission_percentage !== undefined && data.commission_percentage !== null ? parseFloat(data.commission_percentage) : 15);

    const newMinWithdrawal = data.minWithdrawalLimit !== undefined && data.minWithdrawalLimit !== null
      ? parseFloat(data.minWithdrawalLimit)
      : (data.minimum_withdrawal_amount !== undefined && data.minimum_withdrawal_amount !== null ? parseFloat(data.minimum_withdrawal_amount) : 500);

    let updatedDbSetting = null;
    try {
      const dbResult = await commissionRepository.updateOrCreateSetting({
        commissionPercentage: newPercent,
        minimumWithdrawalAmount: newMinWithdrawal,
        currency: data.currency || 'INR',
      });
      updatedDbSetting = dbResult ? dbResult.toJSON() : null;
    } catch (e) {
      console.error('Error updating commission setting in database:', e.message);
    }

    const updatedConfig = updateCommissionConfig({
      ...data,
      platformCommissionPercent: newPercent,
      minWithdrawalLimit: newMinWithdrawal,
    });

    return {
      ...updatedConfig,
      platformCommissionPercent: newPercent,
      commission_percentage: newPercent,
      minWithdrawalLimit: newMinWithdrawal,
      minimum_withdrawal_amount: newMinWithdrawal,
      dbRecord: updatedDbSetting,
    };
  }
}

module.exports = new CommissionService();
