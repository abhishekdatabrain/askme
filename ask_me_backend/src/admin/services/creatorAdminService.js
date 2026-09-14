const creatorRepository = require('../repositories/creatorRepository');
const { NotFoundError } = require('../../errors/AppError');
const { parsePagination, buildPaginationMeta } = require('../../utils/pagination');
const { CREATOR_ACCOUNT_STATUS, KYC_STATUS } = require('../../constants');
const { Op } = require('sequelize');

class CreatorAdminService {
  mapCreatorRecord(c) {
    const rawStatus = (c.status || 'active').toLowerCase();
    const accountStatus = rawStatus === 'blocked' ? 'Blocked' : 'Active';

    const rawKyc = (c.profile?.kyc_status || 'pending').toLowerCase();
    const kycStatus = rawKyc === 'approved' ? 'Approved' : rawKyc === 'rejected' ? 'Rejected' : 'Pending';

    const fullName = c.full_name || '';
    const avatarInitials = fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'CR';

    const walletObj = c.wallet || {};
    const totalEarnings = parseFloat(walletObj.total_earnings || walletObj.totalEarnings || 0);
    const availableBal = parseFloat(walletObj.available_balance || walletObj.availableBalance || 0);
    const pendingBal = parseFloat(walletObj.pending_balance || walletObj.pendingBalance || 0);
    const withdrawnAmt = parseFloat(walletObj.withdrawn_amount || walletObj.withdrawnAmount || 0);

    const balanceVal = totalEarnings > 0 ? totalEarnings : (availableBal + pendingBal);

    const rawDate = c.createdAt || c.created_at;
    const formattedDate = rawDate ? new Date(rawDate).toISOString().split('T')[0] : 'N/A';

    return {
      id: c.id,
      name: fullName,
      username: c.username ? (c.username.startsWith('@') ? c.username : `@${c.username}`) : '@creator',
      email: c.email || 'N/A',
      mobile: c.mobile || 'N/A',
      country: c.country || 'India',
      regDate: formattedDate,
      createdAt: rawDate || formattedDate,
      created_at: rawDate || formattedDate,
      kycStatus,
      accountStatus,
      balance: balanceVal,
      walletBalance: balanceVal,
      totalRevenue: totalEarnings,
      availableBalance: availableBal,
      pendingBalance: pendingBal,
      withdrawnAmount: withdrawnAmt,
      avatar: avatarInitials,
      profileImage: c.profile_image || null,
      bio: c.profile?.bio || '',
      category: c.profile?.category || 'Technology',
      socialLinks: Array.isArray(c.socialLinks)
        ? c.socialLinks.map((s) => ({
          platform: s.platform,
          url: s.profile_url,
        }))
        : [],
    };
  }

  async getCreators(query) {
    const { page, limit, offset } = parsePagination(query);
    const { search, status } = query;

    const where = {};
    if (status && status.toLowerCase() !== 'all' && status.toLowerCase() !== 'creators_all') {
      const s = status.toLowerCase();
      if (s === 'active' || s === 'creators_active') where.status = 'active';
      else if (s === 'blocked' || s === 'creators_blocked') where.status = 'blocked';
    }

    if (search && search.trim()) {
      const q = `%${search.trim()}%`;
      where[Op.or] = [
        { full_name: { [Op.iLike]: q } },
        { email: { [Op.iLike]: q } },
        { username: { [Op.iLike]: q } },
      ];
    }

    const { count, rows } = await creatorRepository.findAndCountAllCreators({
      where,
      limit,
      offset,
      order: [['id', 'DESC']],
    });

    const paginatedCreators = rows.map((c) => this.mapCreatorRecord(c));
    const pagination = buildPaginationMeta(count, page, limit);

    return {
      creators: paginatedCreators,
      pagination,
      results: paginatedCreators.length,
      totalCount: count,
    };
  }

  async getCreatorById(id) {
    const creatorRecord = await creatorRepository.findById(id);
    if (!creatorRecord) {
      throw new NotFoundError('Creator not found');
    }
    return this.mapCreatorRecord(creatorRecord);
  }

  async toggleBlockCreator(id, adminId, req) {
    const creator = await creatorRepository.findById(id);
    if (!creator) {
      throw new NotFoundError('Creator not found');
    }

    const currentStatus = (creator.status || '').toLowerCase();
    const newStatus = currentStatus === CREATOR_ACCOUNT_STATUS.BLOCKED
      ? CREATOR_ACCOUNT_STATUS.ACTIVE
      : CREATOR_ACCOUNT_STATUS.BLOCKED;

    await creatorRepository.updateStatus(id, newStatus);

    try {
      const notificationService = require('./notificationService');
      if (newStatus === CREATOR_ACCOUNT_STATUS.BLOCKED) {
        await notificationService.createNotification({
          creatorId: id,
          type: 'account_blocked',
          title: 'Account Status Blocked 🚫',
          message: 'Your creator account has been blocked by the admin. Please contact support if you believe this is an error.',
        });
      } else if (newStatus === CREATOR_ACCOUNT_STATUS.ACTIVE) {
        await notificationService.createNotification({
          creatorId: id,
          type: 'account_unblocked',
          title: 'Account Status Active ✅',
          message: 'Your creator account has been unblocked by the admin.',
        });
      }
    } catch (e) {
      console.warn('Block/Unblock creator notification notice:', e.message);
    }

    return { creatorId: id, status: newStatus };
  }

  async deleteCreator(id, adminId, req) {
    const creator = await creatorRepository.findById(id);
    if (!creator) {
      throw new NotFoundError('Creator not found');
    }

    await creatorRepository.updateStatus(id, CREATOR_ACCOUNT_STATUS.DELETED);
    return { creatorId: id, status: CREATOR_ACCOUNT_STATUS.DELETED };
  }
}

module.exports = new CreatorAdminService();
