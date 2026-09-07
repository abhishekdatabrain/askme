const viewerRepository = require('../repositories/viewerRepository');
const { NotFoundError } = require('../../errors/AppError');
const { parsePagination, buildPaginationMeta } = require('../../utils/pagination');
const { Op } = require('sequelize');

class ViewerAdminService {
  mapViewerRecord(v) {
    const fullName = v.name || 'Viewer User';
    const avatarInitials = fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'VW';

    // Calculate total spent from successful donations
    const donations = v.donations || [];
    const successfulDonations = donations.filter(d => (d.payment_status || '').toLowerCase() === 'success' || (d.payment_status || '').toLowerCase() === 'successful');
    const totalSpent = successfulDonations.reduce((sum, d) => sum + parseFloat(d.amount || 0), 0);
    const totalQuestions = donations.length;

    const vipMemberships = v.vipMemberships || [];
    const activeVipCount = vipMemberships.filter(m => (m.status || '').toLowerCase() === 'active').length;

    const isBlocked = (v.role || '').toLowerCase() === 'blocked';
    const status = isBlocked ? 'Blocked' : 'Active';

    return {
      id: v.id,
      name: fullName,
      email: v.email || 'N/A',
      role: (v.role === 'viewer') ? 'Viewer' : (v.role || 'Viewer'),
      status,
      avatar: avatarInitials,
      regDate: v.created_at ? new Date(v.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      createdAt: v.created_at || new Date().toISOString(),
      totalSpent: parseFloat(totalSpent.toFixed(2)),
      formattedTotalSpent: `₹${totalSpent.toLocaleString()}`,
      totalQuestions,
      vipCount: activeVipCount,
    };
  }

  async getViewers(query) {
    const { page, limit, offset } = parsePagination(query);
    const { search, status } = query;

    const where = {};

    if (search && search.trim()) {
      const q = `%${search.trim()}%`;
      where[Op.or] = [
        { name: { [Op.iLike]: q } },
        { email: { [Op.iLike]: q } },
      ];
    }

    if (status && status.toLowerCase() !== 'all') {
      if (status.toLowerCase() === 'active') {
        where.role = { [Op.in]: ['user', 'viewer'] };
      } else if (status.toLowerCase() === 'blocked') {
        where.role = 'blocked';
      }
    }

    const { count, rows } = await viewerRepository.findAndCountAllViewers({
      where,
      limit,
      offset,
      order: [['id', 'DESC']],
    });

    const paginatedViewers = rows.map((v) => this.mapViewerRecord(v));
    const pagination = buildPaginationMeta(count, page, limit);

    return {
      viewers: paginatedViewers,
      pagination,
      results: paginatedViewers.length,
      totalCount: count,
    };
  }

  async getViewerById(id) {
    const viewerRecord = await viewerRepository.findById(id);
    if (!viewerRecord) {
      throw new NotFoundError('Viewer not found');
    }

    const basicViewer = this.mapViewerRecord(viewerRecord);

    // Map donation / question history
    const donations = (viewerRecord.donations || []).map(d => {
      const item = typeof d.toJSON === 'function' ? d.toJSON() : d;
      const rawDate = item.created_at || item.createdAt || item.paid_at || item.paidAt;
      const formattedDate = rawDate
        ? new Date(rawDate).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
        : 'N/A';

      const creatorObj = item.creator || {};

      return {
        id: item.id,
        uuid: item.donation_uuid,
        amount: parseFloat(item.amount || 0),
        formattedAmount: `₹${parseFloat(item.amount || 0).toLocaleString()}`,
        currency: item.currency || 'INR',
        message: item.message || 'No message attached',
        paymentStatus: (item.payment_status || 'pending').toUpperCase(),
        isVip: Boolean(item.is_vip),
        paidAt: item.paid_at || item.paidAt || rawDate,
        createdAt: item.created_at || item.createdAt || rawDate,
        formattedDate,
        creator: {
          id: creatorObj.id,
          name: creatorObj.full_name || creatorObj.username || 'Creator Host',
          username: creatorObj.username ? `@${creatorObj.username.replace(/^@/, '')}` : '@creator',
          profileImage: creatorObj.profile_image || null,
        },
      };
    });

    // Map VIP memberships
    const vipMemberships = (viewerRecord.vipMemberships || []).map(m => {
      const item = typeof m.toJSON === 'function' ? m.toJSON() : m;
      const rawBillingDate = item.next_billing_date || item.nextBillingDate;
      const formattedNextBillingDate = rawBillingDate
        ? new Date(rawBillingDate).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
        : 'N/A';

      const creatorObj = item.creator || {};

      return {
        id: item.id,
        planName: item.plan_name || 'VIP Membership',
        amount: parseFloat(item.amount || 0),
        status: item.status ? item.status.toUpperCase() : 'ACTIVE',
        nextBillingDate: item.next_billing_date || item.nextBillingDate,
        formattedNextBillingDate,
        createdAt: item.created_at || item.createdAt,
        creator: {
          id: creatorObj.id,
          name: creatorObj.full_name || creatorObj.username || 'Creator Host',
          username: creatorObj.username ? `@${creatorObj.username.replace(/^@/, '')}` : '@creator',
          profileImage: creatorObj.profile_image || null,
        },
      };
    });

    return {
      ...basicViewer,
      donations,
      vipMemberships,
    };
  }

  async toggleBlockViewer(id, adminId) {
    const viewerRecord = await viewerRepository.findById(id);
    if (!viewerRecord) {
      throw new NotFoundError('Viewer not found');
    }

    const currentRole = (viewerRecord.role || '').toLowerCase();
    const newRole = currentRole === 'blocked' ? 'viewer' : 'blocked';

    await viewerRepository.updateRoleOrStatus(id, newRole);
    return { viewerId: id, status: newRole === 'blocked' ? 'Blocked' : 'Active' };
  }
}

module.exports = new ViewerAdminService();
