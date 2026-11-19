const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');
const { sequelize } = require('../config/db');
const User = require('../models/userModel');
const CreatorsModel = require('../models/CreatorsModel');
const models = require('../models');

/**
 * Permanently delete an expired Viewer record and clean up associated data.
 * Safely handles audit retention and dependent tables within an atomic transaction.
 */
const permanentlyDeleteViewerRecord = async (userId) => {
  let transaction = null;
  let avatarPath = null;

  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return { success: false, reason: 'User not found' };
    }

    // Safety checks: Must be deactivated viewer with expired retention
    if (!user.is_deleted) {
      return { success: false, reason: 'Account is not marked as deleted' };
    }
    if (user.role !== 'viewer') {
      return { success: false, reason: 'Cannot permanently delete non-viewer account via viewer routine' };
    }
    if (!user.scheduled_permanent_deletion_at || new Date(user.scheduled_permanent_deletion_at) > new Date()) {
      return { success: false, reason: '2-year retention period has not yet expired' };
    }

    avatarPath = user.avatar;

    const {
      Donation,
      VipMembership,
      Follow,
      Notification,
      UserFcmToken,
      UserPolicyConsent,
      SupportTicket,
    } = models;

    transaction = await sequelize.transaction();

    // 1. Anonymize financial donation records (preserve tax and audit history)
    if (Donation) {
      await Donation.update(
        {
          viewer_id: null,
          supporter_name: 'Former Viewer (Account Deactivated)',
          supporter_email: null,
          supporter_mobile: null,
        },
        { where: { viewer_id: userId }, transaction }
      );
    }

    // 2. Delete non-audit relationships
    if (VipMembership) {
      await VipMembership.destroy({ where: { viewer_id: userId }, transaction });
    }
    if (Follow) {
      await Follow.destroy({ where: { viewer_id: userId }, transaction });
    }
    if (Notification) {
      await Notification.destroy({ where: { user_id: userId }, transaction });
    }
    if (UserFcmToken) {
      await UserFcmToken.destroy({ where: { user_id: userId }, transaction });
    }
    if (UserPolicyConsent) {
      await UserPolicyConsent.destroy({ where: { user_id: userId }, transaction });
    }

    // 3. Anonymize support tickets
    if (SupportTicket) {
      await SupportTicket.update(
        {
          user_id: null,
          name: 'Deleted Viewer',
          email: `deleted_viewer_${userId}@ask-me.live`,
          phone: null,
        },
        { where: { user_id: userId }, transaction }
      );
    }

    // 4. Delete the User record
    await user.destroy({ transaction });

    await transaction.commit();
    transaction = null;

    // 5. Post-Commit: Cleanup avatar file from disk safely
    if (avatarPath && typeof avatarPath === 'string' && avatarPath.includes('/uploads/profiles/')) {
      try {
        const filename = path.basename(avatarPath);
        const fullFilePath = path.resolve(__dirname, '../../uploads/profiles', filename);
        if (fs.existsSync(fullFilePath)) {
          fs.unlinkSync(fullFilePath);
        }
      } catch (fileErr) {
        console.warn(`[Permanent Deletion Scheduler] Viewer avatar cleanup notice:`, fileErr.message);
      }
    }

    return { success: true };
  } catch (error) {
    if (transaction) {
      try {
        await transaction.rollback();
      } catch (rbErr) {}
    }
    console.error(`[Permanent Deletion Scheduler Error] Failed to delete viewer #${userId}:`, error.message);
    throw error;
  }
};

/**
 * Permanently delete or anonymize an expired Creator record and clean up associated data.
 * Safely handles audit retention, wallet safety, and dependent tables within an atomic transaction.
 */
const permanentlyDeleteCreatorRecord = async (creatorId) => {
  let transaction = null;
  const filesToDelete = [];

  try {
    const creator = await CreatorsModel.findByPk(creatorId);
    if (!creator) {
      return { success: false, reason: 'Creator not found' };
    }

    // Safety checks: Never delete admin accounts and must have expired retention
    if (creator.role !== 'creator') {
      return { success: false, reason: 'Forbidden. Non-creator accounts cannot be deleted here.' };
    }
    if (!creator.is_deleted) {
      return { success: false, reason: 'Account is not marked as deleted' };
    }
    if (!creator.scheduled_permanent_deletion_at || new Date(creator.scheduled_permanent_deletion_at) > new Date()) {
      return { success: false, reason: '2-year retention period has not yet expired' };
    }

    const {
      Wallet: WalletModel,
      WithdrawalRequest: WithdrawalRequestModel,
      DonationSession: DonationSessionModel,
      Donation: DonationModel,
      WalletTransaction: WalletTransactionModel,
      KycVerification: KycVerificationModel,
      KycDocument: KycDocumentModel,
      Follow: FollowModel,
      Notification: NotificationModel,
      VipMembership: VipMembershipModel,
      VipPlan: VipPlanModel,
      SupportTicket: SupportTicketModel,
      UserPolicyConsent: UserPolicyConsentModel,
      QrCode: QrCodeModel,
      CreatorProfile,
      CreatorSocialLink,
      CreatorBankAccount,
    } = models;

    // Check financial records count to preserve audit trail
    let hasFinancialRecords = false;
    try {
      const [donationCount, txCount, withdrawalCount] = await Promise.all([
        DonationModel ? DonationModel.count({ where: { creator_id: creator.id } }) : 0,
        WalletTransactionModel ? WalletTransactionModel.count({ where: { creator_id: creator.id } }) : 0,
        WithdrawalRequestModel ? WithdrawalRequestModel.count({ where: { creator_id: creator.id } }) : 0,
      ]);
      hasFinancialRecords = donationCount > 0 || txCount > 0 || withdrawalCount > 0;
    } catch (checkErr) {
      console.warn('[Permanent Deletion Scheduler] Check financial count notice:', checkErr.message);
    }

    // Collect image paths for post-commit disk deletion
    if (creator.profile_image) filesToDelete.push(creator.profile_image);

    if (CreatorProfile) {
      const profile = await CreatorProfile.findOne({ where: { creator_id: creator.id } });
      if (profile) {
        if (profile.profile_image) filesToDelete.push(profile.profile_image);
        if (profile.banner_image) filesToDelete.push(profile.banner_image);
      }
    }

    if (KycVerificationModel && KycDocumentModel) {
      try {
        const kyc = await KycVerificationModel.findOne({ where: { creator_id: creator.id } });
        if (kyc) {
          const docs = await KycDocumentModel.findAll({ where: { kyc_id: kyc.id } });
          docs.forEach((d) => {
            if (d.file_url) filesToDelete.push(d.file_url);
          });
        }
      } catch (kycErr) {}
    }

    transaction = await sequelize.transaction();

    // 1. Delete notifications & follows
    if (NotificationModel) {
      await NotificationModel.destroy({ where: { creator_id: creator.id }, transaction });
    }
    if (FollowModel) {
      await FollowModel.destroy({ where: { creator_id: creator.id }, transaction });
    }

    // 2. Delete VIP memberships & plans
    if (VipMembershipModel) {
      await VipMembershipModel.destroy({ where: { creator_id: creator.id }, transaction });
    }
    if (VipPlanModel) {
      await VipPlanModel.destroy({ where: { creator_id: creator.id }, transaction });
    }

    // 3. Delete social links
    if (CreatorSocialLink) {
      await CreatorSocialLink.destroy({ where: { creator_id: creator.id }, transaction });
    }

    // 4. Handle bank accounts: anonymize if financial audit records exist, otherwise delete
    if (CreatorBankAccount) {
      if (hasFinancialRecords) {
        await CreatorBankAccount.update(
          {
            account_holder_name: 'Deleted Creator',
            account_number: 'XXXX0000',
            ifsc_code: 'XXXX0000000',
            upi_id: null,
            is_primary: false,
            is_verified: false,
          },
          { where: { creator_id: creator.id }, transaction }
        );
      } else {
        await CreatorBankAccount.destroy({ where: { creator_id: creator.id }, transaction });
      }
    }

    // 5. Delete KYC records
    if (KycVerificationModel) {
      const kyc = await KycVerificationModel.findOne({ where: { creator_id: creator.id }, transaction });
      if (kyc) {
        if (KycDocumentModel) {
          await KycDocumentModel.destroy({ where: { kyc_id: kyc.id }, transaction });
        }
        await KycVerificationModel.destroy({ where: { id: kyc.id }, transaction });
      }
    }

    // 6. Delete User Policy Consents
    if (UserPolicyConsentModel) {
      await UserPolicyConsentModel.destroy({
        where: {
          [Op.or]: [
            { creator_id: creator.id },
            { identifier: creator.email || `creator_${creator.id}` },
          ],
        },
        transaction,
      });
    }

    // 7. Anonymize support tickets
    if (SupportTicketModel) {
      await SupportTicketModel.update(
        {
          creator_id: null,
          name: 'Deleted Creator',
          email: `deleted_creator_${creator.id}@ask-me.live`,
          phone: null,
        },
        { where: { creator_id: creator.id }, transaction }
      );
    }

    // 8. Delete sessions & QR codes
    if (DonationSessionModel) {
      const sessions = await DonationSessionModel.findAll({
        where: { creator_id: creator.id },
        attributes: ['id'],
        transaction,
      });
      const sessionIds = sessions.map((s) => s.id);
      if (sessionIds.length > 0 && QrCodeModel) {
        await QrCodeModel.destroy({
          where: { session_id: { [Op.in]: sessionIds } },
          transaction,
        });
      }

      if (hasFinancialRecords) {
        await DonationSessionModel.update(
          {
            status: 'closed',
            title: 'Closed Session',
            description: 'Closed Session',
            stream_url: null,
            overlay_url: null,
          },
          { where: { creator_id: creator.id }, transaction }
        );
      } else {
        await DonationSessionModel.destroy({ where: { creator_id: creator.id }, transaction });
      }
    }

    // 9. Delete creator profile
    if (CreatorProfile) {
      await CreatorProfile.destroy({ where: { creator_id: creator.id }, transaction });
    }

    // 10. Handle Wallet
    if (WalletModel) {
      const wallet = await WalletModel.findOne({ where: { creator_id: creator.id }, transaction });
      if (wallet) {
        if (hasFinancialRecords) {
          await wallet.update({ balance: 0.0, status: 'inactive' }, { transaction });
        } else {
          await wallet.destroy({ transaction });
        }
      }
    }

    // 11. Final Creator Record Handling: Anonymize or Destroy
    if (hasFinancialRecords) {
      const timestamp = Date.now();
      await creator.update(
        {
          full_name: 'Deleted Creator',
          username: null,
          email: `deleted_creator_${creator.id}_${timestamp}@ask-me.live`,
          mobile: null,
          password: `DELETED_ACCOUNT_${timestamp}`,
          profile_image: null,
          country: null,
          status: 'deleted',
          account_type: 'deleted',
          is_trial: false,
          trial_session_id: null,
          trial_expires_at: null,
          trial_completed: false,
        },
        { transaction }
      );
    } else {
      await creator.destroy({ transaction });
    }

    await transaction.commit();
    transaction = null;

    // 12. Post-Commit: Cleanup media files from disk
    for (const filePath of filesToDelete) {
      try {
        if (
          filePath &&
          typeof filePath === 'string' &&
          !filePath.startsWith('http') &&
          !filePath.startsWith('data:') &&
          !filePath.startsWith('blob:')
        ) {
          const candidatePaths = [
            path.isAbsolute(filePath) ? filePath : null,
            path.join(__dirname, '../../../', filePath.replace(/^\/+/, '')),
            path.join(process.cwd(), filePath.replace(/^\/+/, '')),
            path.join(process.cwd(), 'ask_me_backend', filePath.replace(/^\/+/, '')),
          ].filter(Boolean);

          for (const p of candidatePaths) {
            if (fs.existsSync(p)) {
              fs.unlinkSync(p);
              break;
            }
          }
        }
      } catch (fileErr) {
        console.warn(`[Permanent Deletion Scheduler] File unlink notice:`, fileErr.message);
      }
    }

    return { success: true };
  } catch (error) {
    if (transaction) {
      try {
        await transaction.rollback();
      } catch (rbErr) {}
    }
    console.error(`[Permanent Deletion Scheduler Error] Failed to delete creator #${creatorId}:`, error.message);
    throw error;
  }
};

let isJobRunning = false;

/**
 * Daily Background Permanent Deletion Job
 * Finds accounts where is_deleted = true AND scheduled_permanent_deletion_at <= NOW()
 * and executes idempotent permanent deletion/anonymization.
 */
const runDailyPermanentDeletionJob = async () => {
  if (isJobRunning) {
    console.log('[Account Deletion Scheduler] A previous job is still running. Skipping execution.');
    return;
  }

  isJobRunning = true;
  const now = new Date();
  console.log(`[Account Deletion Scheduler] Running daily check at ${now.toISOString()}...`);

  let processedViewers = 0;
  let processedCreators = 0;
  let errorCount = 0;

  try {
    // 1. Find Viewers eligible for permanent deletion
    const expiredViewers = await User.findAll({
      where: {
        is_deleted: true,
        scheduled_permanent_deletion_at: { [Op.lte]: now },
      },
      limit: 100,
    });

    for (const viewer of expiredViewers) {
      try {
        await permanentlyDeleteViewerRecord(viewer.id);
        processedViewers++;
        console.log(`[Account Deletion Scheduler] ✓ Successfully permanently deleted Viewer #${viewer.id} (${viewer.email})`);
      } catch (err) {
        errorCount++;
        console.error(`[Account Deletion Scheduler] ✗ Failed to permanently delete Viewer #${viewer.id}:`, err.message);
      }
    }

    // 2. Find Creators eligible for permanent deletion (role must be creator, never admin)
    const expiredCreators = await CreatorsModel.findAll({
      where: {
        is_deleted: true,
        role: 'creator',
        scheduled_permanent_deletion_at: { [Op.lte]: now },
      },
      limit: 100,
    });

    for (const creator of expiredCreators) {
      try {
        await permanentlyDeleteCreatorRecord(creator.id);
        processedCreators++;
        console.log(`[Account Deletion Scheduler] ✓ Successfully permanently processed Creator #${creator.id} (${creator.email})`);
      } catch (err) {
        errorCount++;
        console.error(`[Account Deletion Scheduler] ✗ Failed to permanently delete Creator #${creator.id}:`, err.message);
      }
    }

    console.log(
      `[Account Deletion Scheduler] Finished daily run: ${processedViewers} viewer(s) and ${processedCreators} creator(s) processed. Errors: ${errorCount}`
    );
  } catch (globalErr) {
    console.error('[Account Deletion Scheduler] Global execution error:', globalErr.message);
  } finally {
    isJobRunning = false;
  }

  return { processedViewers, processedCreators, errorCount };
};

/**
 * Initializes the background scheduler (default: checks every 24 hours).
 */
const startAccountDeletionScheduler = (checkIntervalMs = 86400000) => {
  // Delayed initial run (15 seconds) to allow server boot and DB sync to complete
  setTimeout(runDailyPermanentDeletionJob, 15000);

  // Set recurring daily interval
  const timer = setInterval(runDailyPermanentDeletionJob, checkIntervalMs);
  if (timer.unref) timer.unref();

  console.log(`[Account Deletion Scheduler] Background scheduler initialized (Interval: ${checkIntervalMs / 1000}s).`);
  return timer;
};

module.exports = {
  permanentlyDeleteViewerRecord,
  permanentlyDeleteCreatorRecord,
  runDailyPermanentDeletionJob,
  startAccountDeletionScheduler,
};
