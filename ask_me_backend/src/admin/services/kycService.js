const sequelize = require('../../config/database');
const kycRepository = require('../repositories/kycRepository');
const creatorRepository = require('../repositories/creatorRepository');
const notificationService = require('./notificationService');
const { Admin } = require('../../models');
const { NotFoundError, ValidationError } = require('../../errors/AppError');
const { parsePagination, buildPaginationMeta } = require('../../utils/pagination');
const { maskPan, maskBankAccount } = require('../../utils/maskSensitiveData');
const { KYC_STATUS, CREATOR_ACCOUNT_STATUS } = require('../../constants');
const { Op } = require('sequelize');

class KycService {
  async getKycList(query) {
    const { page, limit, offset } = parsePagination(query);
    const { status, search } = query;

    const where = {};
    if (status && status.toLowerCase() !== 'all') {
      const s = status.toLowerCase();
      if (s === 'pending') where.status = 'pending';
      else if (s === 'approved' || s === 'verified') where.status = 'approved';
      else if (s === 'rejected' || s === 'action_required') where.status = 'rejected';
    }

    if (search && search.trim()) {
      const q = `%${search.trim()}%`;
      where[Op.or] = [
        { full_name: { [Op.iLike]: q } },
        { pan_number: { [Op.iLike]: q } },
      ];
    }

    const { count, rows } = await kycRepository.findAndCountAllKyc({
      where,
      limit,
      offset,
      order: [['id', 'DESC']],
    });

    const kycApplications = rows.map((kyc) => {
      const creator = kyc.creator || {};
      const profile = creator.profile || {};
      const bank = Array.isArray(creator.bankAccounts) && creator.bankAccounts.length > 0 ? creator.bankAccounts[0] : null;
      const document = Array.isArray(kyc.documents) && kyc.documents.length > 0 ? kyc.documents[0] : null;

      const rawStatus = (kyc.status || profile.kyc_status || 'pending').toLowerCase();
      const statusTitle = rawStatus === 'approved' ? 'Approved' : rawStatus === 'rejected' ? 'Rejected' : 'Pending';

      return {
        creatorId: creator.id || kyc.creator_id,
        name: creator.full_name || kyc.full_name || '',
        email: creator.email || '',
        mobileNumber: creator.mobile || '',
        username: creator.username || '',
        country: creator.country || kyc.country || '',
        profileImage: creator.profile_image || '',

        kycId: kyc.id,
        pan: maskPan(kyc.pan_number),
        kycStatus: statusTitle,
        rejectionReason: kyc.rejection_reason || null,
        submittedAt: kyc.submitted_at || kyc.created_at,

        documentId: document?.id || null,
        documentType: document?.document_type || '',
        documentNumber: document?.document_number || '',
        documentUrl: document?.file_url || null,

        bankId: bank?.id || null,
        bankName: bank?.bank_name || '',
        accountNumber: maskBankAccount(bank?.account_number),
        accountHolderName: bank?.account_holder_name || creator.full_name || '',
        ifscCode: bank?.ifsc_code || '',
        upiId: bank?.upi_id || '',

        profileId: profile?.id || null,
        profileKycStatus: profile?.kyc_status || null,
      };
    });

    const pagination = buildPaginationMeta(count, page, limit);

    return {
      kycApplications,
      submissions: kycApplications,
      pagination,
      results: kycApplications.length,
      totalCount: count,
    };
  }

  async approveKyc(creatorOrKycId, adminId, req) {
    let postCommitNotif = null;

    await sequelize.transaction(async (transaction) => {
      let creator = await creatorRepository.findById(creatorOrKycId, { transaction });
      let kycRecord = await kycRepository.findByCreatorId(creatorOrKycId, { transaction, lock: transaction.LOCK.UPDATE });

      if (!creator && kycRecord) {
        creator = await creatorRepository.findById(kycRecord.creator_id, { transaction });
      }

      if (!kycRecord && creator) {
        kycRecord = await kycRepository.findByCreatorId(creator.id, { transaction, lock: transaction.LOCK.UPDATE });
      }

      if (!creator) {
        throw new NotFoundError('Creator not found for KYC approval');
      }

      const creatorId = creator.id;


      if (kycRecord) {
        const kycUpdatePayload = {
          status: KYC_STATUS.APPROVED,
          reviewed_at: new Date(),
        };


        await kycRepository.updateKycStatus(creatorId, kycUpdatePayload, { transaction });

        await kycRepository.updateDocumentsStatus(kycRecord.id, {
          verification_status: KYC_STATUS.APPROVED,
        }, { transaction });
      }

      await kycRepository.updateProfileKyc(creatorId, {
        kyc_status: KYC_STATUS.APPROVED,
        is_payment_enabled: true,
      }, { transaction });

      await kycRepository.updateBankAccountStatus(creatorId, {
        is_verified: true,
        status: 'active',
      }, { transaction });

      await creatorRepository.updateStatus(creatorId, CREATOR_ACCOUNT_STATUS.ACTIVE, { transaction });

      postCommitNotif = {
        creatorId,
        type: 'kyc_approved',
        title: 'KYC Verified & Approved! 🎉',
        message: 'Congratulations! Your identity documents and bank details have been verified and approved.',
      };
    });

    if (postCommitNotif) {
      await notificationService.createNotification(postCommitNotif).catch(() => { });
    }

    return { creatorId: creatorOrKycId, kycStatus: 'Approved' };
  }

  async rejectKyc(creatorOrKycId, adminId, reason, req) {
    const rejectionReason = reason?.trim() || 'Invalid documents or detail mismatch';
    let postCommitNotif = null;

    await sequelize.transaction(async (transaction) => {
      let creator = await creatorRepository.findById(creatorOrKycId, { transaction });
      let kycRecord = await kycRepository.findByCreatorId(creatorOrKycId, { transaction, lock: transaction.LOCK.UPDATE });

      if (!creator && kycRecord) {
        creator = await creatorRepository.findById(kycRecord.creator_id, { transaction });
      }

      if (!kycRecord && creator) {
        kycRecord = await kycRepository.findByCreatorId(creator.id, { transaction, lock: transaction.LOCK.UPDATE });
      }

      if (!creator) {
        throw new NotFoundError('Creator record not found for KYC rejection');
      }

      const creatorId = creator.id;

      if (kycRecord) {
        const kycUpdatePayload = {
          status: KYC_STATUS.REJECTED,
          rejection_reason: rejectionReason,
          reviewed_at: new Date(),
        };


        await kycRepository.updateKycStatus(creatorId, kycUpdatePayload, { transaction });

        await kycRepository.updateDocumentsStatus(kycRecord.id, {
          verification_status: KYC_STATUS.REJECTED,
          rejection_reason: rejectionReason,
        }, { transaction });
      }

      await kycRepository.updateProfileKyc(creatorId, {
        kyc_status: KYC_STATUS.REJECTED,
      }, { transaction });



      postCommitNotif = {
        creatorId,
        type: 'kyc_rejected',
        title: 'KYC Verification Rejected ❌',
        message: `Your KYC verification was rejected. Reason: ${rejectionReason}`,
      };
    });

    if (postCommitNotif) {
      await notificationService.createNotification(postCommitNotif).catch(() => { });
    }

    return { creatorId: creatorOrKycId, kycStatus: 'Rejected', rejectionReason };
  }
}

module.exports = new KycService();
