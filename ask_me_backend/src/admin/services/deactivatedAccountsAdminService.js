const User = require('../../models/userModel');
const CreatorsModel = require('../../models/CreatorsModel');
const { Op } = require('sequelize');

const getDeactivatedAccounts = async ({ page = 1, limit = 10, role = 'all', search = '' } = {}) => {
  const p = Math.max(1, parseInt(page, 10) || 1);
  const l = Math.max(1, parseInt(limit, 10) || 10);
  const cleanSearch = (search || '').trim().toLowerCase();
  const normalizedRole = (role || 'all').trim().toLowerCase();

  let creatorWhere = { is_deleted: true, role: 'creator' };
  let viewerWhere = { is_deleted: true };

  if (cleanSearch) {
    creatorWhere[Op.or] = [
      { full_name: { [Op.iLike]: `%${cleanSearch}%` } },
      { email: { [Op.iLike]: `%${cleanSearch}%` } },
      { username: { [Op.iLike]: `%${cleanSearch}%` } },
    ];
    viewerWhere[Op.or] = [
      { name: { [Op.iLike]: `%${cleanSearch}%` } },
      { email: { [Op.iLike]: `%${cleanSearch}%` } },
    ];
  }

  let items = [];

  if (normalizedRole === 'all' || normalizedRole === 'creator') {
    const creators = await CreatorsModel.findAll({
      where: creatorWhere,
      attributes: [
        'id',
        'full_name',
        'username',
        'email',
        'mobile',
        'role',
        'deleted_at',
        'scheduled_permanent_deletion_at',
        'status',
      ],
      order: [['deleted_at', 'DESC']],
    });
    creators.forEach((c) => {
      const now = new Date();
      const isExpired = c.scheduled_permanent_deletion_at && new Date(c.scheduled_permanent_deletion_at) <= now;
      items.push({
        id: c.id,
        name: c.full_name || `@${c.username}` || 'Creator',
        email: c.email,
        mobile: c.mobile,
        role: 'Creator',
        rawRole: 'creator',
        deactivation_date: c.deleted_at,
        scheduled_permanent_deletion_at: c.scheduled_permanent_deletion_at,
        is_expired: isExpired,
        recovery_status: isExpired ? 'Expired (Pending Deletion)' : 'Deactivated (Recoverable)',
        can_recover: !isExpired,
      });
    });
  }

  if (normalizedRole === 'all' || normalizedRole === 'viewer') {
    const viewers = await User.findAll({
      where: viewerWhere,
      attributes: [
        'id',
        'name',
        'email',
        'phone',
        'role',
        'deleted_at',
        'scheduled_permanent_deletion_at',
      ],
      order: [['deleted_at', 'DESC']],
    });
    viewers.forEach((v) => {
      const now = new Date();
      const isExpired = v.scheduled_permanent_deletion_at && new Date(v.scheduled_permanent_deletion_at) <= now;
      items.push({
        id: v.id,
        name: v.name || 'Viewer',
        email: v.email,
        mobile: v.phone,
        role: 'Viewer',
        rawRole: 'viewer',
        deactivation_date: v.deleted_at,
        scheduled_permanent_deletion_at: v.scheduled_permanent_deletion_at,
        is_expired: isExpired,
        recovery_status: isExpired ? 'Expired (Pending Deletion)' : 'Deactivated (Recoverable)',
        can_recover: !isExpired,
      });
    });
  }

  // Sort combined items by deactivation date descending
  items.sort((a, b) => new Date(b.deactivation_date || 0) - new Date(a.deactivation_date || 0));

  const totalCount = items.length;
  const totalPages = Math.ceil(totalCount / l) || 1;
  const paginatedItems = items.slice((p - 1) * l, p * l);

  return {
    accounts: paginatedItems,
    pagination: {
      currentPage: p,
      totalPages,
      totalCount,
      limit: l,
    },
  };
};

const reactivateAccount = async ({ role, id }) => {
  if (!role || !id) {
    const err = new Error('Account role (creator/viewer) and ID are required.');
    err.statusCode = 400;
    throw err;
  }

  const normalizedRole = String(role).trim().toLowerCase();

  if (normalizedRole === 'creator') {
    const creator = await CreatorsModel.findByPk(id);
    if (!creator) {
      const err = new Error('Creator account not found.');
      err.statusCode = 404;
      throw err;
    }
    creator.is_deleted = false;
    creator.deleted_at = null;
    creator.scheduled_permanent_deletion_at = null;
    creator.status = 'active';
    await creator.save();

    console.log(`[Admin Action] Creator account #${creator.id} (${creator.email}) reactivated by admin.`);

    return {
      message: `Creator account "${creator.full_name || creator.email}" has been reactivated successfully.`,
      account: {
        id: creator.id,
        name: creator.full_name,
        email: creator.email,
        role: 'Creator',
        is_deleted: false,
      },
    };
  } else if (normalizedRole === 'viewer' || normalizedRole === 'user') {
    const user = await User.findByPk(id);
    if (!user) {
      const err = new Error('Viewer account not found.');
      err.statusCode = 404;
      throw err;
    }
    user.is_deleted = false;
    user.deleted_at = null;
    user.scheduled_permanent_deletion_at = null;
    await user.save();

    console.log(`[Admin Action] Viewer account #${user.id} (${user.email}) reactivated by admin.`);

    return {
      message: `Viewer account "${user.name || user.email}" has been reactivated successfully.`,
      account: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: 'Viewer',
        is_deleted: false,
      },
    };
  } else {
    const err = new Error('Invalid account role. Must be either "creator" or "viewer".');
    err.statusCode = 400;
    throw err;
  }
};

module.exports = {
  getDeactivatedAccounts,
  reactivateAccount,
};
