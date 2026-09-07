const { Op } = require('sequelize');
const User = require('../../models/CreatorsModel');
const DonationSession = require('../../models/DonationSessionModels');
const Donation = require('../../models/DonationModel');
const KycVerification = require('../../models/KycVerificationModel');

/**
 * Global Admin Search across Creators, Live Sessions, Payments, and KYC records.
 */
const globalSearch = async (queryStr) => {
  if (!queryStr || typeof queryStr !== 'string' || !queryStr.trim()) {
    return {
      creators: [],
      liveSessions: [],
      payments: [],
      kyc: [],
    };
  }

  const cleanQuery = queryStr.trim();
  const searchPattern = `%${cleanQuery}%`;

  const [creators, liveSessions, payments, kyc] = await Promise.all([
    // 1. Search Creators
    User.findAll({
      where: {
        role: 'creator',
        [Op.or]: [
          { full_name: { [Op.iLike]: searchPattern } },
          { username: { [Op.iLike]: searchPattern } },
          { email: { [Op.iLike]: searchPattern } },
          { mobile: { [Op.iLike]: searchPattern } },
        ],
      },
      attributes: ['id', 'full_name', 'username', 'email', 'profile_image', 'status'],
      limit: 5,
    }),

    // 2. Search Live Sessions
    DonationSession.findAll({
      where: {
        [Op.or]: [
          { title: { [Op.iLike]: searchPattern } },
          { session_code: { [Op.iLike]: searchPattern } },
          { category: { [Op.iLike]: searchPattern } },
        ],
      },
      attributes: ['id', 'session_code', 'title', 'category', 'status', 'started_at', 'creator_id'],
      limit: 5,
    }),

    // 3. Search Payments
    Donation.findAll({
      where: {
        [Op.or]: [
          { viewer_name: { [Op.iLike]: searchPattern } },
          { viewer_email: { [Op.iLike]: searchPattern } },
          { message: { [Op.iLike]: searchPattern } },
        ],
      },
      attributes: ['id', 'donation_uuid', 'viewer_name', 'viewer_email', 'amount', 'payment_status', 'created_at'],
      limit: 5,
    }),

    // 4. Search KYC Verifications
    KycVerification.findAll({
      where: {
        [Op.or]: [
          { full_name: { [Op.iLike]: searchPattern } },
          { pan_number: { [Op.iLike]: searchPattern } },
        ],
      },
      attributes: ['id', 'creator_id', 'full_name', 'pan_number', 'status', 'submitted_at'],
      limit: 5,
    }),
  ]);

  return {
    creators,
    liveSessions,
    payments,
    kyc,
  };
};

module.exports = {
  globalSearch,
};
