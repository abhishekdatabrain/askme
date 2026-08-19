const sequelize = require('../config/database');
const Admin = require('../models/AdminModel');
const CreatorsModel = require('../models/CreatorsModel');
const CreatorProfileModel = require('../models/CreatorProfileModel');
const CreatorSocialLinkModel = require('../models/CreatorSocialLinkModel');
const WalletModel = require('../models/WalletModel');
const KycVerificationModel = require('../models/KycVerificationModel');
const KycDocumentModel = require('../models/KycDocumentModel');
const CreatorBankAccountModel = require('../models/CreatorBankAccountModel');
const { getCommissionConfig, updateCommissionConfig } = require('../config/commissionConfig');
let DonationSession;
try { DonationSession = require('../models/DonationSessionModels'); } catch (e) {}

// Live Sessions, Payments, Withdrawals & Settings
// let mockLiveSessions = [
//   { id: 'SESS-9081', creator: 'Tech Burner', category: 'Tech Q&A', duration: '01h 24m', viewers: 14200, totalDonations: 48500, qrStatus: 'Active', streamUrl: 'rtmp://live.askme.pro/live/tb_9081' },
//   { id: 'SESS-9082', creator: 'Mortal Gaming', category: 'BGMI Tournament', duration: '02h 10m', viewers: 28900, totalDonations: 89200, qrStatus: 'Active', streamUrl: 'rtmp://live.askme.pro/live/mg_9082' },
//   { id: 'SESS-9083', creator: 'Finance With Sharan', category: 'Tax Saving Tips', duration: '00h 45m', viewers: 8400, totalDonations: 31000, qrStatus: 'Suspended', streamUrl: 'rtmp://live.askme.pro/live/fs_9083' },
// ];

let mockPayments = [
  { id: 'TXN-882190', creator: 'Tech Burner', viewer: 'Rahul Sharma', amount: 500, method: 'UPI (PhonePe)', status: 'Successful', gatewayResponse: 'PAYU_SUCCESS_200', timestamp: '2026-08-12 10:45:12' },
  { id: 'TXN-882191', creator: 'Mortal Gaming', viewer: 'Aman Verma', amount: 1000, method: 'Credit Card (HDFC)', status: 'Successful', gatewayResponse: 'RAZORPAY_CAPTURED', timestamp: '2026-08-12 10:42:05' },
  { id: 'TXN-882192', creator: 'Finance With Sharan', viewer: 'Priya Singh', amount: 250, method: 'UPI (GooglePay)', status: 'Failed', gatewayResponse: 'INSUFFICIENT_FUNDS_402', timestamp: '2026-08-12 10:30:44' },
  { id: 'TXN-882193', creator: 'Mythpat', viewer: 'Rohan Mehta', amount: 1500, method: 'Netbanking (ICICI)', status: 'Refunded', gatewayResponse: 'REFUND_PROCESSED_200', timestamp: '2026-08-12 09:15:20' },
];

let mockWithdrawals = [
  { id: 'WTH-501', creator: 'Tech Burner', amount: 100000, platformCut: 15000, creatorNet: 85000, bankAccount: 'HDFC Bank ****4321', requestedAt: '2026-08-11 18:00', status: 'Pending' },
  { id: 'WTH-502', creator: 'Finance With Sharan', amount: 150000, platformCut: 22500, creatorNet: 127500, bankAccount: 'ICICI Bank ****9876', requestedAt: '2026-08-10 12:30', status: 'Approved' },
  { id: 'WTH-503', creator: 'Mythpat', amount: 50000, platformCut: 7500, creatorNet: 42500, bankAccount: 'SBI Bank ****1122', requestedAt: '2026-08-09 15:45', status: 'Completed' },
];

let mockCommissionSettings = {
  platformCommissionPercent: 15,
  vipCommissionPercent: 10,
  minWithdrawalLimit: 500,
  autoPayoutEnabled: true,
};

let mockPlatformSettings = {
  razorpayKey: 'rzp_live_98123781239123',
  payuMerchantId: 'MERCHANT_ASKME_PRO',
  broadcastMessage: 'Welcome to AskMe PRO Live Streaming Control Room.',
  maintenanceMode: false,
};

let mockNotifications = [
  { id: 1, title: 'KYC Submitted', message: 'New Creator submitted PAN & Bank verification documents.', time: '10 mins ago', isRead: false, type: 'kyc' },
  { id: 2, title: 'Payout Requested', message: 'Creator requested a payout of ₹85,000.', time: '1 hour ago', isRead: false, type: 'payout' },
  { id: 3, title: 'High Donation Volume', message: 'Live session crossed ₹89,000 in viewer payments.', time: '2 hours ago', isRead: true, type: 'system' },
];

/**
 * 1. Admin Dashboard Overview Statistics (Dynamic DB Counts)
 * @route GET /api/admin/dashboard
 */
const getDashboardOverview = async (req, res, next) => {
  try {
    let totalCreators = 0;
    let pendingKycCount = 0;

    try {
      totalCreators = await CreatorsModel.count();
    } catch (e) {
      totalCreators = await Admin.count().catch(() => 0);
    }

    try {
      pendingKycCount = await CreatorProfileModel.count({
        where: { kyc_status: 'pending' }
      });
    } catch (e) {
      try {
        pendingKycCount = await KycVerificationModel.count({
          where: { status: 'pending' }
        });
      } catch (err) { }
    }

    return res.status(200).json({
      status: 'success',
      data: {
        totalCreators: totalCreators || 0,
        activeStreamers: mockLiveSessions.filter(s => s.qrStatus === 'Active').length,
        totalDonations: 1489200,
        totalRevenue: 223380,
        pendingWithdrawals: mockWithdrawals.filter(w => w.status === 'Pending').length,
        pendingKyc: pendingKycCount || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Helper function to map CreatorsModel + profile + wallet + social links into a unified DTO
 */
const mapCreatorRecord = (c, profile, wallet, socialLinks = []) => {
  const rawStatus = (c.status || 'active').toLowerCase();
  const accountStatus = rawStatus === 'blocked' ? 'Blocked' : 'Active';

  const rawKyc = (profile?.kyc_status || 'pending').toLowerCase();
  const kycStatus = rawKyc === 'approved' ? 'Approved' : rawKyc === 'rejected' ? 'Rejected' : 'Pending';

  const fullName = c.full_name || 'Creator Host';
  const avatarInitials = fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'CR';

  const balanceVal = wallet ? parseFloat(wallet.available_balance || wallet.total_earnings || 0) : 0;

  return {
    id: c.id,
    name: fullName,
    username: c.username ? (c.username.startsWith('@') ? c.username : `@${c.username}`) : '@creator',
    email: c.email || 'N/A',
    mobile: c.mobile || 'N/A',
    country: c.country || 'India',
    regDate: c.created_at ? new Date(c.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    kycStatus: kycStatus,
    accountStatus: accountStatus,
    balance: balanceVal,
    avatar: avatarInitials,
    profileImage: c.profile_image || null,
    bio: profile?.bio || '',
    category: 'Technology',
    socialLinks: Array.isArray(socialLinks) ? socialLinks.map(s => ({
      platform: s.platform,
      url: s.profile_url || s.profileUrl,
    })) : [],
  };
};

/**
 * 2. Creator Management Endpoints (DYNAMIC FROM DATABASE)
 * @route GET /api/admin/creators
 */
const getCreators = async (req, res, next) => {
  try {
    const { search, status } = req.query;

    const creators = await CreatorsModel.findAll({
      order: [['id', 'DESC']],
    });

    let formattedList = await Promise.all(
      creators.map(async (c) => {
        let profile = null;
        let wallet = null;
        let socialLinks = [];

        try {
          profile = await CreatorProfileModel.findOne({ where: { creator_id: c.id } });
        } catch (e) { }

        try {
          wallet = await WalletModel.findOne({ where: { creator_id: c.id } });
        } catch (e) { }

        try {
          socialLinks = await CreatorSocialLinkModel.findAll({ where: { creator_id: c.id } });
        } catch (e) { }

        return mapCreatorRecord(c, profile, wallet, socialLinks);
      })
    );

    if (status && status !== 'All') {
      formattedList = formattedList.filter(c => c.accountStatus === status || c.kycStatus === status);
    }
    if (search) {
      const q = search.toLowerCase();
      formattedList = formattedList.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.username.toLowerCase().includes(q)
      );
    }

    return res.status(200).json({
      status: 'success',
      results: formattedList.length,
      data: { creators: formattedList },
    });
  } catch (error) {
    next(error);
  }
};

const getCreatorById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const creatorRecord = await CreatorsModel.findByPk(id);

    if (!creatorRecord) {
      return res.status(404).json({ status: 'fail', message: 'Creator not found' });
    }

    const profile = await CreatorProfileModel.findOne({ where: { creator_id: id } }).catch(() => null);
    const wallet = await WalletModel.findOne({ where: { creator_id: id } }).catch(() => null);
    const socialLinks = await CreatorSocialLinkModel.findAll({ where: { creator_id: id } }).catch(() => []);

    const creator = mapCreatorRecord(creatorRecord, profile, wallet, socialLinks);

    return res.status(200).json({ status: 'success', data: { creator } });
  } catch (error) {
    next(error);
  }
};

const approveCreatorKyc = async (req, res, next) => {
  try {
    const { id } = req.params;

    const creator = await CreatorsModel.findByPk(id);
    if (!creator) {
      return res.status(404).json({ status: 'fail', message: 'Creator not found' });
    }

    try {
      await CreatorProfileModel.update(
        { kyc_status: 'approved', is_payment_enabled: true },
        { where: { creator_id: id } }
      );
    } catch (e) { }

    try {
      await KycVerificationModel.update(
        { status: 'approved', reviewed_at: new Date() },
        { where: { creator_id: id } }
      );
    } catch (e) { }

    await creator.update({ status: 'active' });

    return res.status(200).json({
      status: 'success',
      message: 'Creator KYC Approved successfully.',
      data: { creatorId: id, kycStatus: 'Approved' }
    });
  } catch (error) {
    next(error);
  }
};

const rejectCreatorKyc = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const creator = await CreatorsModel.findByPk(id);
    if (!creator) {
      return res.status(404).json({ status: 'fail', message: 'Creator not found' });
    }

    try {
      await CreatorProfileModel.update(
        { kyc_status: 'rejected' },
        { where: { creator_id: id } }
      );
    } catch (e) { }

    try {
      await KycVerificationModel.update(
        { status: 'rejected', rejection_reason: reason || 'Documents invalid', reviewed_at: new Date() },
        { where: { creator_id: id } }
      );
    } catch (e) { }

    return res.status(200).json({
      status: 'success',
      message: 'Creator KYC Rejected',
      data: { creatorId: id, kycStatus: 'Rejected', rejectionReason: reason }
    });
  } catch (error) {
    next(error);
  }
};

const toggleBlockCreator = async (req, res, next) => {
  try {
    const { id } = req.params;
    const creator = await CreatorsModel.findByPk(id);

    if (!creator) {
      return res.status(404).json({ status: 'fail', message: 'Creator not found' });
    }

    const newStatus = (creator.status || '').toLowerCase() === 'blocked' ? 'active' : 'blocked';
    await creator.update({ status: newStatus });

    return res.status(200).json({
      status: 'success',
      message: `Creator status updated to ${newStatus === 'blocked' ? 'Blocked' : 'Active'}`,
      data: { creatorId: id, status: newStatus }
    });
  } catch (error) {
    next(error);
  }
};

const deleteCreator = async (req, res, next) => {
  try {
    const { id } = req.params;
    await CreatorsModel.destroy({ where: { id } });
    return res.status(200).json({ status: 'success', message: 'Creator deleted successfully from database' });
  } catch (error) {
    next(error);
  }
};

/**
 * 3. Dynamic KYC Queue Management (DYNAMIC FROM DATABASE)
 * @route GET /api/admin/kyc
 */
const getKycList = async (req, res, next) => {
  try {
    // 1. Get ALL creators first
    const creators = await CreatorsModel.findAll({
      order: [['id', 'DESC']],
    });

    // 2. Get related table data
    const [
      kycRecords,
      kycDocuments,
      bankAccounts,
      profiles,
    ] = await Promise.all([
      KycVerificationModel.findAll(),
      KycDocumentModel.findAll(),
      CreatorBankAccountModel.findAll(),
      CreatorProfileModel.findAll(),
    ]);

    // 3. Match KYC with creator_id
    const kycMap = new Map();

    kycRecords.forEach((kyc) => {
      kycMap.set(String(kyc.creator_id), kyc);
    });

    // 4. Match Profile with creator_id
    const profileMap = new Map();

    profiles.forEach((profile) => {
      profileMap.set(String(profile.creator_id), profile);
    });

    // 5. Match Bank Account with creator_id
    const bankMap = new Map();

    bankAccounts.forEach((bank) => {
      bankMap.set(String(bank.creator_id), bank);
    });

    // 6. Match KYC Document with kyc_id
    const documentMap = new Map();

    kycDocuments.forEach((document) => {
      documentMap.set(String(document.kyc_id), document);
    });

    // 7. Main data comes from Creators table
    const kycApplications = creators.map((creator) => {
      const creatorId = String(creator.id);

      // Match creator with KYC
      const kyc = kycMap.get(creatorId) || null;

      // Match creator with Profile
      const profile = profileMap.get(creatorId) || null;

      // Match creator with Bank
      const bank = bankMap.get(creatorId) || null;

      // Match KYC with document
      const document = kyc
        ? documentMap.get(String(kyc.id)) || null
        : null;

      // Status
      const rawStatus = String(
        kyc?.status ||
        profile?.kyc_status ||
        'pending'
      ).toLowerCase();

      let status = 'Pending';

      if (rawStatus === 'approved') {
        status = 'Approved';
      }

      if (rawStatus === 'rejected') {
        status = 'Rejected';
      }

      return {
        // Creators table
        creatorId: creator.id,

        name: creator.full_name || '',

        email: creator.email || '',

        mobileNumber: creator.mobile_number || '',

        username: creator.username || '',

        country: creator.country || '',

        profileImage: creator.profile_image || '',

        // KYC Verification table
        kycId: kyc?.id || null,

        pan: kyc?.pan_number || '',

        kycStatus: status,

        rejectionReason:
          kyc?.rejection_reason || null,

        submittedAt:
          kyc?.submitted_at || null,

        // KYC Document table
        documentId: document?.id || null,

        documentType:
          document?.document_type || '',

        documentNumber:
          document?.document_number || '',

        documentUrl:
          document?.file_url || null,

        // Bank Account table
        bankId: bank?.id || null,

        bankName:
          bank?.bank_name || '',

        accountNumber:
          bank?.account_number || '',

        accountHolderName:
          bank?.account_holder_name ||
          creator.full_name ||
          '',

        ifscCode:
          bank?.ifsc_code || '',

        upiId:
          bank?.upi_id || '',

        // Profile table
        profileId:
          profile?.id || null,

        profileKycStatus:
          profile?.kyc_status || null,
      };
    });

    return res.status(200).json({
      status: 'success',
      results: kycApplications.length,
      data: {
        kycApplications,
      },
    });

  } catch (error) {
    console.error(
      'getKycList Error:',
      error
    );

    next(error);
  }
};

const approveKyc = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    // Find KYC record by KYC ID
    const kycRecord = await KycVerificationModel.findOne({
      where: {
        creator_id: id
      },
      raw: true,
      transaction
    });

    if (!kycRecord) {
      await transaction.rollback();

      return res.status(404).json({
        status: 'error',
        message: 'KYC record not found'
      });
    }

    const creatorId = kycRecord.creator_id;

    // 1. Approve KYC
    await KycVerificationModel.update(
      {
        status: 'approved',
        reviewed_at: new Date()
      },
      {
        where: {
          creator_id: id
        },
        transaction
      }
    );
    // 2. Update Creator Profile
    const [profileUpdated] = await CreatorProfileModel.update(
      {
        kyc_status: 'approved',
        is_payment_enabled: true
      },
      {
        where: {
          creator_id: creatorId
        },
        transaction
      }
    );

    // 3. Verify Bank Account
    const [bankUpdated] = await CreatorBankAccountModel.update(
      {
        is_verified: true,
        status: 'active'
      },
      {
        where: {
          creator_id: creatorId
        },
        transaction
      }
    );

    // 4. Activate Creator
    const [creatorUpdated] = await CreatorsModel.update(
      {
        status: 'active'
      },
      {
        where: {
          id: creatorId
        },
        transaction
      }
    );

    // Commit all changes
    await transaction.commit();

    return res.status(200).json({
      status: 'success',
      message: 'KYC approved successfully',
      data: {
        kycId: id,
        creatorId,
        status: 'approved',
        profileUpdated: profileUpdated > 0,
        bankUpdated: bankUpdated > 0,
        creatorUpdated: creatorUpdated > 0
      }
    });

  } catch (error) {
    // Rollback everything if any query fails
    await transaction.rollback();

    next(error);
  }
};

const rejectKyc = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { reason } = req.body;
    const rejectionReason = reason?.trim() || 'Invalid documents';

    // Find KYC record using creator_id
    const kycRecord = await KycVerificationModel.findOne({
      where: {
        creator_id: id
      },
      transaction
    });

    if (!kycRecord) {
      await transaction.rollback();

      return res.status(404).json({
        status: 'error',
        message: 'KYC record not found for this creator'
      });
    }

    // 1. Reject KYC
    const [kycUpdated] = await KycVerificationModel.update(
      {
        status: 'rejected',
        rejection_reason: rejectionReason,
        reviewed_at: new Date()
      },
      {
        where: {
          creator_id: id
        },
        transaction
      }
    );

    if (kycUpdated === 0) {
      throw new Error('KYC record was not updated');
    }

    // 2. Update Creator Profile
    await CreatorProfileModel.update(
      {
        kyc_status: 'rejected'
      },
      {
        where: {
          creator_id: id
        },
        transaction
      }
    );

    // 3. Commit
    await transaction.commit();

    return res.status(200).json({
      status: 'success',
      message: 'KYC document rejected successfully',
      data: {
        kycId: kycRecord.id,
        creatorId: id,
        status: 'rejected',
        rejectionReason
      }
    });

  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

/**
 * 4. Live Sessions Management
 * @route GET /api/admin/live-sessions
 */
const getLiveSessions = async (req, res, next) => {
  try {
    let sessions = [];
    if (DonationSession) {
      const dbSessions = await DonationSession.findAll({
        order: [['createdAt', 'DESC']],
      });

      for (const s of dbSessions) {
        let creator = null;
        try {
          if (CreatorsModel) {
            creator = await CreatorsModel.findByPk(s.creator_id);
          }
        } catch (e) {}

        const durationMinutes = s.started_at ? Math.max(1, Math.floor((new Date() - new Date(s.started_at)) / (1000 * 60))) : 0;
        const durationFormatted = s.status === 'active' ? `${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60}m` : 'Ended';

        sessions.push({
          id: `SESS-${s.id}`,
          rawId: s.id,
          creator: creator?.full_name || `Creator #${s.creator_id}`,
          category: s.category || s.title || 'Live Stream',
          duration: durationFormatted,
          viewers: Math.floor(Math.random() * 5000 + 500),
          totalDonations: parseFloat(s.total_amount || 0),
          qrStatus: s.status === 'disabled' || s.status === 'suspended' ? 'Suspended' : (s.status === 'active' ? 'Active' : 'Closed'),
          streamUrl: s.stream_url || `http://localhost:3000/pay/${s.session_code}`,
        });
      }
    }

    return res.status(200).json({ status: 'success', data: { sessions } });
  } catch (error) {
    next(error);
  }
};

const disableLiveSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cleanId = String(id).replace(/^SESS-|^SES-/, '');

    if (DonationSession) {
      const session = await DonationSession.findByPk(cleanId);
      if (session) {
        const newStatus = session.status === 'disabled' || session.status === 'suspended' ? 'active' : 'disabled';
        await session.update({ status: newStatus });
        return res.status(200).json({
          status: 'success',
          message: `Session status updated to ${newStatus === 'disabled' ? 'Suspended' : 'Active'}`,
          data: { id, qrStatus: newStatus === 'disabled' ? 'Suspended' : 'Active' }
        });
      }
    }

    return res.status(404).json({ status: 'fail', message: 'Live session not found' });
  } catch (error) {
    next(error);
  }
};

/**
 * 5. Payment Transactions Management
 * @route GET /api/admin/payments
 */
const getPayments = async (req, res, next) => {
  try {
    const { status } = req.query;
    let filtered = [...mockPayments];
    if (status && status !== 'All') {
      filtered = filtered.filter(p => p.status === status);
    }
    return res.status(200).json({ status: 'success', data: { payments: filtered } });
  } catch (error) {
    next(error);
  }
};

/**
 * 6. Dynamic Wallet Management & Ledger
 * @route GET /api/admin/wallets/creators
 */
const getCreatorWallets = async (req, res, next) => {
  try {
    const creators = await CreatorsModel.findAll({ order: [['id', 'DESC']] });

    const wallets = await Promise.all(
      creators.map(async (c) => {
        let wallet = null;
        try {
          wallet = await WalletModel.findOne({ where: { creator_id: c.id } });
        } catch (e) { }

        const gross = wallet ? parseFloat(wallet.total_earnings || 0) : 0;
        const available = wallet ? parseFloat(wallet.available_balance || 0) : 0;

        return {
          creatorId: c.id,
          creatorName: c.full_name || 'Creator',
          email: c.email || 'N/A',
          grossEarnings: gross,
          platformCut15: Math.round(gross * 0.15),
          creatorNet85: Math.round(gross * 0.85),
          availableBalance: available,
        };
      })
    );

    return res.status(200).json({ status: 'success', data: { wallets } });
  } catch (error) {
    next(error);
  }
};

const getCommissionLedger = async (req, res, next) => {
  try {
    let ledger = [];
    if (DonationModel) {
      const donations = await DonationModel.findAll({
        order: [['id', 'DESC']],
        limit: 100
      }).catch(() => []);

      const platformRate = (mockCommissionSettings.platformCommissionPercent || 15) / 100;

      for (const d of donations) {
        let creatorName = 'Creator Host';
        try {
          if (CreatorsModel) {
            const creator = await CreatorsModel.findByPk(d.creator_id);
            if (creator) creatorName = creator.full_name || creator.email;
          }
        } catch (e) {}

        const gross = parseFloat(d.amount || 0);
        const platformCut = Math.round(gross * platformRate);
        const creatorNet = Math.round(gross * (1 - platformRate));

        ledger.push({
          transactionId: d.donation_uuid || `TXN-${d.id}`,
          rawId: d.id,
          creator: creatorName,
          viewerName: d.anonymous ? 'Anonymous Supporter' : (d.viewer_name || 'Anonymous Supporter'),
          amount: gross,
          platformCut15: platformCut,
          creatorNet85: creatorNet,
          timestamp: d.paid_at || d.createdAt,
          status: d.status === 'success' ? 'Successful' : (d.status || 'Successful')
        });
      }
    }

    if (ledger.length === 0) {
      ledger = mockPayments.map(p => ({
        transactionId: p.id,
        creator: p.creator,
        viewerName: p.viewer,
        amount: p.amount,
        platformCut15: Math.round(p.amount * 0.15),
        creatorNet85: Math.round(p.amount * 0.85),
        timestamp: p.timestamp,
        status: p.status
      }));
    }

    return res.status(200).json({ status: 'success', data: { ledger } });
  } catch (error) {
    next(error);
  }
};

/**
 * 7. Withdrawal Payout Management
 * @route GET /api/admin/withdrawals
 */
const getWithdrawals = async (req, res, next) => {
  try {
    return res.status(200).json({ status: 'success', data: { withdrawals: mockWithdrawals } });
  } catch (error) {
    next(error);
  }
};

const approveWithdrawal = async (req, res, next) => {
  try {
    const { id } = req.params;
    const w = mockWithdrawals.find(item => item.id === id);
    if (w) w.status = 'Approved';
    return res.status(200).json({ status: 'success', message: 'Withdrawal Approved', data: { withdrawal: w } });
  } catch (error) {
    next(error);
  }
};

const rejectWithdrawal = async (req, res, next) => {
  try {
    const { id } = req.params;
    const w = mockWithdrawals.find(item => item.id === id);
    if (w) w.status = 'Rejected';
    return res.status(200).json({ status: 'success', message: 'Withdrawal Rejected', data: { withdrawal: w } });
  } catch (error) {
    next(error);
  }
};

const markWithdrawalPaid = async (req, res, next) => {
  try {
    const { id } = req.params;
    const w = mockWithdrawals.find(item => item.id === id);
    if (w) w.status = 'Completed';
    return res.status(200).json({ status: 'success', message: 'Withdrawal marked as Paid', data: { withdrawal: w } });
  } catch (error) {
    next(error);
  }
};

/**
 * 8. Commission Settings
 * @route GET /api/admin/commission
 */
const getCommissionSettings = async (req, res, next) => {
  try {
    const config = getCommissionConfig();
    return res.status(200).json({ status: 'success', data: { commissionSettings: config } });
  } catch (error) {
    next(error);
  }
};

const updateCommissionSettings = async (req, res, next) => {
  try {
    const updated = updateCommissionConfig(req.body);
    return res.status(200).json({ status: 'success', message: 'Commission settings updated successfully', data: { commissionSettings: updated } });
  } catch (error) {
    next(error);
  }
};

/**
 * 9. Reports & Analytics
 * @route GET /api/admin/reports
 */
const getReportsAnalytics = async (req, res, next) => {
  try {
    const totalCreatorsCount = await CreatorsModel.count().catch(() => 0);
    return res.status(200).json({
      status: 'success',
      data: {
        revenueStats: { daily: 48500, weekly: 340000, monthly: 1489200 },
        gatewaySuccessRate: 98.4,
        leaderboard: [],
        totalCreatorsCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 10. Admin Notifications
 * @route GET /api/admin/notifications
 */
const getNotifications = async (req, res, next) => {
  try {
    return res.status(200).json({ status: 'success', data: { notifications: mockNotifications } });
  } catch (error) {
    next(error);
  }
};

const markNotificationsRead = async (req, res, next) => {
  try {
    mockNotifications.forEach(n => (n.isRead = true));
    return res.status(200).json({ status: 'success', message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

/**
 * 11. Platform Operations & Settings
 * @route GET /api/admin/operations
 */
const getPlatformSettings = async (req, res, next) => {
  try {
    return res.status(200).json({ status: 'success', data: { settings: mockPlatformSettings } });
  } catch (error) {
    next(error);
  }
};

const updatePlatformSettings = async (req, res, next) => {
  try {
    const { broadcastMessage, razorpayKey, payuMerchantId, maintenanceMode } = req.body;
    if (broadcastMessage !== undefined) mockPlatformSettings.broadcastMessage = broadcastMessage;
    if (razorpayKey !== undefined) mockPlatformSettings.razorpayKey = razorpayKey;
    if (payuMerchantId !== undefined) mockPlatformSettings.payuMerchantId = payuMerchantId;
    if (maintenanceMode !== undefined) mockPlatformSettings.maintenanceMode = maintenanceMode;

    return res.status(200).json({ status: 'success', message: 'Platform settings updated successfully', data: { settings: mockPlatformSettings } });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin Update / Adjust Creator Wallet Balance & Bonus (Requirement 19)
 * @route PUT /api/admin/wallets/creators/:creatorId
 */
const updateCreatorBalance = async (req, res, next) => {
  try {
    const { creatorId } = req.params;
    const { availableBalance, bonusCredit } = req.body;

    const parsedBalance = parseFloat(availableBalance || 0);
    const parsedBonus = parseFloat(bonusCredit || 0);
    const newTotalBalance = parsedBalance + parsedBonus;

    if (WalletModel) {
      const [wallet] = await WalletModel.findOrCreate({
        where: { creator_id: creatorId },
        defaults: { creator_id: creatorId, balance: newTotalBalance, available_balance: newTotalBalance }
      });

      await wallet.update({
        balance: newTotalBalance,
        available_balance: newTotalBalance,
        total_earnings: wallet.total_earnings < newTotalBalance ? newTotalBalance : wallet.total_earnings,
      });

      return res.status(200).json({
        status: 'success',
        message: `Wallet balance for creator #${creatorId} updated to ₹${newTotalBalance.toFixed(2)}`,
        data: { wallet }
      });
    }

    return res.status(200).json({ status: 'success', message: 'Balance updated successfully' });
  } catch (error) {
    console.error('UPDATE CREATOR BALANCE ERROR:', error);
    next(error);
  }
};

module.exports = {
  getDashboardOverview,
  getCreators,
  getCreatorById,
  approveCreatorKyc,
  rejectCreatorKyc,
  toggleBlockCreator,
  deleteCreator,
  getKycList,
  approveKyc,
  rejectKyc,
  getLiveSessions,
  disableLiveSession,
  getPayments,
  getCreatorWallets,
  getCommissionLedger,
  updateCreatorBalance,
  getWithdrawals,
  approveWithdrawal,
  rejectWithdrawal,
  markWithdrawalPaid,
  getCommissionSettings,
  updateCommissionSettings,
  getReportsAnalytics,
  getNotifications,
  markNotificationsRead,
  getPlatformSettings,
  updatePlatformSettings,
};
