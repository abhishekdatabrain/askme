const creatorRepository = require('../repositories/creatorRepository');
const donationSessionRepository = require('../repositories/donationSessionRepository');
const paymentRepository = require('../repositories/paymentRepository');
const walletRepository = require('../repositories/walletRepository');
const withdrawalRepository = require('../repositories/withdrawalRepository');
const kycRepository = require('../repositories/kycRepository');
const commissionService = require('./commissionService');
const User = require('../../models/userModel');
const { calculateCommission } = require('../../utils/money');
const { Op } = require('sequelize');

class AdminDashboardService {
  async getOverview() {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalCreators,
      registeredThisWeek,
      activeStreamers,
      paymentDonationsSum,
      walletEarningsSum,
      pendingWithdrawals,
      pendingWithdrawalsAmount,
      pendingKyc,
      totalViewers,
      commissionSettings,
    ] = await Promise.all([
      creatorRepository.count().catch(() => 0),
      creatorRepository.count({ created_at: { [Op.gte]: sevenDaysAgo } }).catch(() => 0),
      donationSessionRepository.countActiveStreamers().catch(() => 0),
      paymentRepository.sumSuccessfulDonations().catch(() => 0),
      walletRepository.sumTotalEarnings().catch(() => 0),
      withdrawalRepository.countPending().catch(() => 0),
      withdrawalRepository.sumPendingAmount().catch(() => 0),
      kycRepository.countPending().catch(() => 0),
      User.count({ where: { role: 'viewer' } }).catch(() => User.count().catch(() => 0)),
      commissionService.getCommissionSettings().catch(() => ({ platformCommissionPercent: 15 })),
    ]);

    const totalDonations = parseFloat(paymentDonationsSum || walletEarningsSum || 0);
    const commRate = parseFloat(commissionSettings.platformCommissionPercent || 15);
    const totalRevenue = calculateCommission(totalDonations, commRate);

    return {
      totalCreators: totalCreators || 0,
      registeredThisWeek: registeredThisWeek || 0,
      activeStreamers: activeStreamers || 0,
      totalDonations: totalDonations || 0,
      totalRevenue: totalRevenue || 0,
      pendingWithdrawals: pendingWithdrawals || 0,
      pendingWithdrawalsAmount: parseFloat(pendingWithdrawalsAmount || 0),
      pendingKyc: pendingKyc || 0,
      totalViewers: totalViewers || 0,
      commissionRate: commRate,
    };
  }
}

module.exports = new AdminDashboardService();
