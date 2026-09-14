const { Donation, PaymentTransaction, Creator } = require('../../models');

class PaymentRepository {
  async findAndCountAllPayments({ where = {}, limit = 10, offset = 0, order = [['created_at', 'DESC']] }) {
    return await Donation.findAndCountAll({
      where,
      limit,
      offset,
      order,
      include: [
        {
          model: PaymentTransaction,
          as: 'paymentTransaction',
          required: false,
        },
        {
          model: Creator,
          as: 'creator',
          attributes: ['id', 'full_name', 'username', 'email'],
          required: false,
        },
      ],
      distinct: true,
    });
  }

  async sumSuccessfulDonations() {
    return (await Donation.sum('amount', { where: { payment_status: 'success' } })) || 0;
  }

  async sumDonationsBetween(startDate, endDate, status = 'success') {
    const whereClause = { payment_status: status };
    if (startDate || endDate) {
      whereClause.created_at = {};
      if (startDate) whereClause.created_at[require('sequelize').Op.gte] = startDate;
      if (endDate) whereClause.created_at[require('sequelize').Op.lt] = endDate;
    }
    return (await Donation.sum('amount', { where: whereClause })) || 0;
  }

  async countDonationsBetween(startDate, endDate, status = 'success') {
    const whereClause = { payment_status: status };
    if (startDate || endDate) {
      whereClause.created_at = {};
      if (startDate) whereClause.created_at[require('sequelize').Op.gte] = startDate;
      if (endDate) whereClause.created_at[require('sequelize').Op.lt] = endDate;
    }
    return (await Donation.count({ where: whereClause })) || 0;
  }

  async findHighestDonationsBetween(startDate, endDate, limit = 10) {
    const whereClause = { payment_status: 'success' };
    if (startDate || endDate) {
      whereClause.created_at = {};
      if (startDate) whereClause.created_at[require('sequelize').Op.gte] = startDate;
      if (endDate) whereClause.created_at[require('sequelize').Op.lt] = endDate;
    }
    return await this.findAndCountAllPayments({
      where: whereClause,
      limit,
      offset: 0,
      order: [['amount', 'DESC']],
    });
  }
}

module.exports = new PaymentRepository();
