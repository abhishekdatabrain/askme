const { CommissionSetting } = require('../../models');

class CommissionRepository {
  async getActiveSetting() {
    return await CommissionSetting.findOne({
      where: { is_active: true },
      order: [['id', 'DESC']],
    });
  }

  async updateOrCreateSetting({ commissionPercentage, minimumWithdrawalAmount, currency = 'INR' }) {
    const existing = await this.getActiveSetting();
    if (existing) {
      return await existing.update({
        commission_percentage: commissionPercentage,
        minimum_withdrawal_amount: minimumWithdrawalAmount,
        currency,
      });
    }

    return await CommissionSetting.create({
      commission_percentage: commissionPercentage,
      minimum_withdrawal_amount: minimumWithdrawalAmount,
      currency,
      is_active: true,
    });
  }
}

module.exports = new CommissionRepository();
