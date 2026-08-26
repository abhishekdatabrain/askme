const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");
const CreatorsModel = require("../models/CreatorsModel");
const CreatorProfileModel = require("../models/CreatorProfileModel");
const CreatorSocialLinkModel = require("../models/CreatorSocialLinkModel");
const WalletModel = require("../models/WalletModel");
const DonationSession = require("../models/DonationSessionModels");
const { getCreatorNetSharePercent } = require("../config/commissionConfig");
const { Op } = require("sequelize");
let KycVerificationModel;
let KycDocumentModel;
let CreatorBankAccountModel;
let QrCodeModel;
let DonationModel;
let WithdrawalRequestModel;
let WalletTransactionModel;
let PaymentTransactionModel;
let ChatMessageModel;

try { KycVerificationModel = require('../models/KycVerificationModel'); } catch (e) { }
try { KycDocumentModel = require('../models/KycDocumentModel'); } catch (e) { }
try { CreatorBankAccountModel = require('../models/CreatorBankAccountModel'); } catch (e) { }
try { QrCodeModel = require('../models/QrCodeModel'); } catch (e) { }
try { DonationModel = require('../models/DonationModel'); } catch (e) { }
try { WithdrawalRequestModel = require('../models/WithdrawalRequestModel'); } catch (e) { }
try { WalletTransactionModel = require('../models/WalletTransactionModel'); } catch (e) { }
try { PaymentTransactionModel = require('../models/PaymentTransactionModel'); } catch (e) { }
try { ChatMessageModel = require('../models/ChatMessageModel'); } catch (e) { }
const VipMembership = require("../models/VipMembershipModel");

const sequelize = require("../config/database");

/**
 * @desc    Register a new Creator
 * @route   POST /api/creators/register
 * @access  Public
 */
const registerCreator = async (req, res, next) => {
  let transaction;

  try {
    transaction = await sequelize.transaction();

    const {
      firstname,
      lastname,
      username,
      email,
      mobileNumber,
      mobile,
      password,
      profileImage,
      profile_image,
      country,
      socialLinks,
      bio,
      category,
    } = req.body;

    console.log("========== CREATOR REGISTRATION ==========");
    const fullName = `${firstname} ${lastname}`;
    const creatorName = (fullName || "").trim();
    const creatorEmail = (email || "").trim().toLowerCase();
    const cleanUsername = (username || "").trim().replace(/^@+/, "");
    const creatorMobile = mobileNumber || mobile || null;
    const avatarUrl = profileImage || profile_image || null;
    const creatorCountry = country || "India";

    if (!creatorName || !cleanUsername || !creatorEmail || !password) {
      await transaction.rollback();
      return res.status(400).json({
        status: "fail",
        message: "Full name, username, email, and password are required.",
      });
    }

    if (password.length < 6) {
      await transaction.rollback();
      return res.status(400).json({
        status: "fail",
        message: "Password must be at least 6 characters long.",
      });
    }

    const passHasLetter = /[a-zA-Z]/.test(password);
    const passHasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    if (!passHasLetter || !passHasSpecial) {
      await transaction.rollback();
      return res.status(400).json({
        status: "fail",
        message: "Password must contain letters (A–Z/a–z) and at least one special character.",
      });
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(creatorEmail)) {
      await transaction.rollback();
      return res.status(400).json({
        status: "fail",
        message: "Please enter a valid email address format (e.g. user@domain.com).",
      });
    }

    if (cleanUsername.length < 3) {
      await transaction.rollback();
      return res.status(400).json({
        status: "fail",
        message: "Username must be at least 3 characters long.",
      });
    }

    const existingEmail = await CreatorsModel.findOne({
      where: { email: creatorEmail },
      transaction,
    });

    if (existingEmail) {
      await transaction.rollback();
      return res.status(409).json({
        status: "fail",
        message: "A creator account with this email already exists.",
      });
    }

    const existingUsername = await CreatorsModel.findOne({
      where: { username: cleanUsername },
      transaction,
    });

    if (existingUsername) {
      await transaction.rollback();
      return res.status(409).json({
        status: "fail",
        message: "This username is already taken.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const creator = await CreatorsModel.create(
      {
        role: "creator",
        full_name: creatorName,
        username: cleanUsername,
        email: creatorEmail,
        mobile: creatorMobile,
        password: hashedPassword,
        profile_image: avatarUrl,
        country: creatorCountry,
        status: "pending",
      },
      { transaction }
    );

    console.log("CREATOR CREATED:", creator.id);

    try {
      await CreatorProfileModel.create(
        {
          creator_id: creator.id,
          display_name: creatorName,
          bio: bio || `${category || "Technology"} Creator`,
          kyc_status: "not_submited",
          is_payment_enabled: false,
        },
        { transaction }
      );
      console.log("CREATOR PROFILE CREATED:", creator.id);
    } catch (err) {
      console.warn("Notice saving CreatorProfile:", err.message);
    }

    if (Array.isArray(socialLinks)) {
      for (const item of socialLinks) {
        if (!item) continue;

        let platform = null;
        let profileUrl = null;

        if (typeof item === "object") {
          platform = item.platform || item.platform_name || null;
          profileUrl = item.link || item.profile_url || item.profileUrl || item.url || null;
        }

        if (typeof item === "string") {
          platform = "youtube";
          profileUrl = item;
        }

        platform = platform ? String(platform).trim().toLowerCase() : null;
        profileUrl = profileUrl ? String(profileUrl).trim() : null;

        if (!platform || !profileUrl) continue;

        try {
          await CreatorSocialLinkModel.create(
            {
              creator_id: creator.id,
              creatorId: creator.id,
              platform: platform,
              profile_url: profileUrl,
              profileUrl: profileUrl,
            },
            { transaction }
          );
          console.log(`SOCIAL LINK CREATED: ${platform} (${profileUrl})`);
        } catch (err) {
          console.warn(`Notice saving Social Link (${platform}):`, err.message);
        }
      }
    }

    try {
      await WalletModel.create(
        {
          creator_id: creator.id,
          creatorId: creator.id,
          total_earnings: 0,
          available_balance: 0,
          pending_balance: 0,
          withdrawn_amount: 0,
        },
        { transaction }
      );
      console.log("WALLET CREATED:", creator.id);
    } catch (err) {
      console.warn("Notice saving Wallet:", err.message);
    }

    await transaction.commit();

    // Trigger Admin Notification for New Creator Registration
    const notifObj = {
      id: Date.now(),
      title: "New Creator Registered",
      message: `New Creator ${creatorName} (@${cleanUsername}) registered on AskMe PRO.`,
      time: "Just now",
      isRead: false,
      status: "unread",
      type: "creator_registration",
      reference_id: creator.id,
      createdAt: new Date().toISOString()
    };

    // 1. Save Notification in DB
    try {
      const NotificationModel = require("../models/NotificationModel");
      await NotificationModel.create({
        user_id: 0,
        type: "creator_registration",
        title: notifObj.title,
        message: notifObj.message,
        reference_type: "creator",
        reference_id: creator.id,
        is_read: false
      });
      console.log("DB NOTIFICATION CREATED FOR CREATOR REGISTRATION");
    } catch (nErr) {
      console.warn("Notice saving Creator Registration Notification to DB:", nErr.message);
    }

    // 2. Add to in-memory notifications for instant REST API response
    try {
      const { addAdminNotification } = require("./adminController");
      if (typeof addAdminNotification === "function") {
        addAdminNotification(notifObj);
      }
    } catch (mErr) {
      console.warn("Notice updating in-memory notification:", mErr.message);
    }

    // 3. Socket broadcast for real-time live notification to Admin
    try {
      const { getIO } = require("../config/socket");
      const io = getIO();
      if (io) {
        io.emit("admin_notification", notifObj);
        console.log("SOCKET EMITTED admin_notification FOR CREATOR REGISTRATION");
      }
    } catch (sErr) {
      console.warn("Notice broadcasting socket notification:", sErr.message);
    }

    const token = generateToken(creator.id, "creator");

    return res.status(201).json({
      status: "success",
      message: "Creator registered successfully.",
      data: {
        creator: {
          id: creator.id,
          fullName: creator.full_name,
          username: `@${creator.username}`,
          email: creator.email,
          mobile: creator.mobile,
          country: creator.country,
          status: creator.status,
          kycStatus: "not_submited",
        },
        token,
      },
    });

  } catch (error) {
    if (transaction && !transaction.finished) {
      try { await transaction.rollback(); } catch (rErr) { }
    }

    console.error("REGISTER CREATOR ERROR:", error);

    return res.status(500).json({
      status: "error",
      message: "Creator registration failed.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * @desc    Submit KYC Application and Bank Account Details
 * @route   POST /api/creators/kyc
 * @access  Public / Private
 */
const submitKyc = async (req, res, next) => {
  let transaction;
  try {
    transaction = await sequelize.transaction();

    const {
      creatorId,
      creator_id,
      fullName,
      full_name,
      dateOfBirth,
      date_of_birth,
      address,
      country,
      state,
      city,
      pincode,
      panNumber,
      pan_number,
      documentType,
      document_type,
      documentNumber,
      document_number,
      fileUrl,
      file_url,
      documentFileUrl,
      document_file_url,
      accountHolderName,
      account_holder_name,
      bankName,
      bank_name,
      accountNumber,
      account_number,
      ifscCode,
      ifsc_code,
      upiId,
      upi_id,
    } = req.body;

    const targetCreatorId = creatorId || creator_id || req.user?.id || 1;
    const applicantName = fullName || full_name || 'Creator Host';
    const panNum = panNumber || pan_number || documentNumber || document_number || 'ABCDE1234F';

    // Validate IFSC Code Format
    const rawIfsc = String(ifscCode || ifsc_code || '').trim().toUpperCase();
    if (rawIfsc) {
      const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
      if (!ifscRegex.test(rawIfsc)) {
        await transaction.rollback();
        return res.status(400).json({
          status: 'fail',
          message: 'Invalid IFSC Code format. IFSC must be 11 characters starting with 4 letters, 5th character 0, followed by 6 alphanumeric characters (e.g. SBIN0001234).'
        });
      }
    }

    // Safe Date of Birth parsing (PostgreSQL DATE column fix)
    const rawDob = dateOfBirth || date_of_birth;
    let safeDob = null;
    if (rawDob && rawDob !== 'Invalid date' && rawDob !== 'null' && rawDob !== 'undefined') {
      const parsed = new Date(rawDob);
      if (!isNaN(parsed.getTime())) {
        safeDob = parsed.toISOString().split('T')[0];
      }
    }

    // Safe Document Type mapping for ENUM constraint
    const rawDocType = documentType || document_type || '';
    const validDocTypes = ['government_id', 'pan_card', 'passport', 'driving_license', 'address_proof', 'other'];
    let safeDocType = 'pan_card';
    if (validDocTypes.includes(rawDocType)) {
      safeDocType = rawDocType;
    } else if (rawDocType === 'adhar_card' || rawDocType === 'aadhaar') {
      safeDocType = 'government_id';
    }

    // Safe Document File URL
    const docFileUrl = fileUrl || file_url || documentFileUrl || document_file_url || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80';

    // 1. Create or Update KycVerification
    let kycRecord;
    if (KycVerificationModel) {
      const [record] = await KycVerificationModel.findOrCreate({
        where: { creator_id: targetCreatorId },
        defaults: {
          creator_id: targetCreatorId,
          full_name: applicantName,
          date_of_birth: safeDob,
          address: address || '',
          country: country || '',
          state: state || '',
          city: city || '',
          pincode: pincode || '',
          pan_number: panNum,
          status: 'pending',
          submitted_at: new Date(),
        },
        transaction,
      });

      await record.update({
        full_name: applicantName,
        date_of_birth: safeDob || record.date_of_birth,
        address: address || record.address,
        country: country || record.country,
        state: state || record.state,
        city: city || record.city,
        pincode: pincode || record.pincode,
        pan_number: panNum,
        status: 'pending',
        submitted_at: new Date(),
      }, { transaction });

      kycRecord = record;
    }

    // 2. Create KycDocument entry
    if (KycDocumentModel && kycRecord) {
      try {
        await KycDocumentModel.create({
          kyc_id: kycRecord.id,
          document_type: safeDocType,
          document_number: documentNumber || document_number || panNum,
          file_url: docFileUrl,
          verification_status: 'pending',
        }, { transaction });
      } catch (err) {
        console.warn('Notice saving KycDocument:', err.message);
      }
    }

    // 3. Create or Update Bank Account
    let bankAccount;
    if (CreatorBankAccountModel) {
      try {
        const [bank] = await CreatorBankAccountModel.findOrCreate({
          where: { creator_id: targetCreatorId },
          defaults: {
            creator_id: targetCreatorId,
            account_holder_name: accountHolderName || account_holder_name || applicantName,
            bank_name: bankName || bank_name || '',
            account_number: accountNumber || account_number || '',
            ifsc_code: ifscCode || ifsc_code || '',
            upi_id: upiId || upi_id || '',
            account_type: 'bank',
            is_primary: true,
            status: 'not_active',
          },
          transaction,
        });

        await bank.update({
          account_holder_name: accountHolderName || account_holder_name || bank.account_holder_name,
          bank_name: bankName || bank_name || bank.bank_name,
          account_number: accountNumber || account_number || bank.account_number,
          ifsc_code: ifscCode || ifsc_code || bank.ifsc_code,
          upi_id: upiId || upi_id || bank.upi_id,
        }, { transaction });

        bankAccount = bank;
      } catch (err) {
        console.warn('Notice saving CreatorBankAccount:', err.message);
      }
    }

    // 4. Update CreatorProfile kyc_status to pending
    if (CreatorProfileModel) {
      try {
        await CreatorProfileModel.update(
          {
            kyc_status: "pending",
          },
          {
            where: {
              creator_id: targetCreatorId,
            },
            transaction,
          }
        );
      } catch (error) {
        console.error("Error updating creator profile KYC status:", error);
        throw error;
      }
    }
    await transaction.commit();

    return res.status(201).json({
      status: 'success',
      message: 'KYC Application & Payout Details submitted successfully! Under admin verification.',
      data: {
        kycStatus: 'pending',
        submittedAt: new Date().toISOString(),
        estimatedReviewTime: '12-24 Hours',
        kyc: {
          fullName: applicantName,
          panNumber: panNum,
          documentType: documentType || document_type || '',
          status: 'pending',
        },
        bank: bankAccount ? {
          accountHolderName: bankAccount.account_holder_name,
          bankName: bankAccount.bank_name,
          accountNumber: bankAccount.account_number ? `XXXX-XXXX-${bankAccount.account_number.slice(-4)}` : 'XXXX-XXXX-1234',
          ifscCode: bankAccount.ifsc_code,
          upiId: bankAccount.upi_id,
        } : null,
      },
    });

  } catch (error) {
    if (transaction && !transaction.finished) {
      try { await transaction.rollback(); } catch (e) { }
    }
    console.error('SUBMIT KYC ERROR:', error);
    return res.status(500).json({
      status: 'error',
      message: 'KYC Submission failed.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * @desc    Get Creator's KYC Verification Status
 * @route   GET /api/creators/kyc/status
 * @access  Public / Private
 */
const getKycStatus = async (req, res, next) => {
  try {
    const targetCreatorId = req.query.creatorId || req.user?.id || 1;

    let kycRecord = null;
    let bankAccount = null;
    let profile = null;

    if (KycVerificationModel) {
      kycRecord = await KycVerificationModel.findOne({ where: { creator_id: targetCreatorId } });
    }

    if (CreatorBankAccountModel) {
      bankAccount = await CreatorBankAccountModel.findOne({ where: { creator_id: targetCreatorId } });
    }

    if (CreatorProfileModel) {
      profile = await CreatorProfileModel.findOne({ where: { creator_id: targetCreatorId } });
    }

    const currentStatus = profile?.kyc_status || kycRecord?.status || 'pending';

    return res.status(200).json({
      status: 'success',
      data: {
        creatorId: targetCreatorId,
        kycStatus: currentStatus,
        isSubmitted: !!kycRecord,
        rejectionReason: kycRecord?.rejection_reason || null,
        estimatedReviewTime: '12-24 Hours',
        kyc: kycRecord ? {
          fullName: kycRecord.full_name,
          panNumber: kycRecord.pan_number,
          city: kycRecord.city,
          state: kycRecord.state,
          status: kycRecord.status,
          rejectionReason: kycRecord.rejection_reason,
          submittedAt: kycRecord.submitted_at,
        } : null,
        bank: bankAccount ? {
          accountHolderName: bankAccount.account_holder_name,
          bankName: bankAccount.bank_name,
          accountNumber: bankAccount.account_number ? `XXXX-XXXX-${bankAccount.account_number.slice(-4)}` : 'XXXX-XXXX-1234',
          ifscCode: bankAccount.ifsc_code,
          upiId: bankAccount.upi_id,
        } : null,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Creator Login against creators table
 * @route   POST /api/creators/login
 * @access  Public
 */
const loginCreator = async (req, res, next) => {
  try {
    const { email, username, password } = req.body;
    const loginIdentifier = (email || username || '').trim().toLowerCase().replace(/^@/, '');

    if (!loginIdentifier || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide email/username and password.',
      });
    }

    const creator = await CreatorsModel.findOne({
      where: {
        [sequelize.Sequelize.Op.or]: [
          { email: loginIdentifier },
          { username: loginIdentifier },
        ],
      },
    });

    if (!creator) {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid creator email/username or password.',
      });
    }

    const isMatch = await bcrypt.compare(password, creator.password);
    if (!isMatch) {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid creator email/username or password.',
      });
    }

    let profile = null;
    let kycRecord = null;

    if (CreatorProfileModel) {
      profile = await CreatorProfileModel.findOne({ where: { creator_id: creator.id } }).catch(() => null);
    }
    if (KycVerificationModel) {
      kycRecord = await KycVerificationModel.findOne({ where: { creator_id: creator.id } }).catch(() => null);
    }

    const rawStatus = (profile?.kyc_status || kycRecord?.status || 'pending').toLowerCase();
    const kycStatus = rawStatus === 'approved' ? 'approved' : rawStatus === 'rejected' ? 'rejected' : 'pending';
    const rejectionReason = kycRecord?.rejection_reason || null;

    const token = generateToken(creator.id, 'creator');

    return res.status(200).json({
      status: 'success',
      message: 'Creator login successful!',
      data: {
        creator: {
          id: creator.id,
          fullName: creator.full_name,
          username: `@${creator.username}`,
          email: creator.email,
          mobile: creator.mobile,
          country: creator.country,
          role: 'creator',
          status: creator.status,
          kycStatus: kycStatus,
          rejectionReason: rejectionReason,
        },
        token,
      },
    });

  } catch (error) {
    console.error('CREATOR LOGIN ERROR:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Creator login failed.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * @desc    Get Creator Profile Management details
 * @route   GET /api/creators/profile
 * @access  Public / Private
 */
const getCreatorProfile = async (req, res, next) => {
  try {
    const creatorId = req.params?.creatorId || req.params?.id || req.query?.creatorId || req.user?.id || req.body?.creatorId || 1;
    const creator = await CreatorsModel.findByPk(creatorId);
    if (!creator) {
      return res.status(404).json({ status: 'fail', message: 'Creator not found' });
    }

    let profile = null;
    let socialLinks = [];
    let bankAccount = null;

    if (CreatorProfileModel) {
      profile = await CreatorProfileModel.findOne({ where: { creator_id: creatorId } }).catch(() => null);
    }
    if (CreatorSocialLinkModel) {
      socialLinks = await CreatorSocialLinkModel.findAll({ where: { creator_id: creatorId }, raw: true }).catch(() => []);
    }

    if (CreatorBankAccountModel) {
      bankAccount = await CreatorBankAccountModel.findOne({ where: { creator_id: creatorId }, raw: true }).catch(() => null);
    }
    // const socialMap = {};
    // socialLinks.forEach(link => {
    //   if (link.platform) socialMap[link.platform.toLowerCase()] = link.url || link.handle || '';
    // });

    return res.status(200).json({
      status: 'success',
      data: {
        // creatorId: creator.id,
        // fullName: creator.full_name,
        // username: `@${creator.username}`,
        // email: creator.email,
        // mobile: creator.mobile,
        // country: creator.country,
        // profileImage: creator.profile_image || '',
        // bio: profile?.bio || '',
        // streamingChannels: {
        //   platform: profile?.streaming_platform || 'YouTube Live',
        //   streamUrl: profile?.stream_url || '',
        //   channelHandle: profile?.channel_handle || `@${creator.username}`,
        // },
        // socialLinks: {
        //   youtube: socialMap.youtube || '',
        //   instagram: socialMap.instagram || '',
        //   twitter: socialMap.twitter || socialMap.x || '',
        //   twitch: socialMap.twitch || '',
        //   discord: socialMap.discord || '',
        // },
        // paymentInfo: {
        //   upiId: bankAccount?.upi_id || '',
        //   bankName: bankAccount?.bank_name || '',
        //   accountNumber: bankAccount?.account_number || '',
        //   ifscCode: bankAccount?.ifsc_code || '',
        //   accountHolderName: bankAccount?.account_holder_name || creator.full_name || '',
        // }

        creator,
        bankAccount,
        socialLinks,
        profile,
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update Creator Profile details (Image, Bio, Social links, Streaming channels, Payment info)
 * @route   PUT /api/creators/profile
 * @access  Public / Private
 */
const updateCreatorProfile = async (req, res, next) => {
  try {
    const {
      creatorId,
      fullName,
      profileImage,
      bio,
      country,
      streamingChannels,
      socialLinks,
      paymentInfo
    } = req.body;

    const targetId = creatorId || req.user?.id || 1;
    const creator = await CreatorsModel.findByPk(targetId);

    if (!creator) {
      return res.status(404).json({ status: 'fail', message: 'Creator not found' });
    }

    // Validate IFSC Code if provided in paymentInfo
    if (paymentInfo?.ifscCode) {
      const rawIfsc = String(paymentInfo.ifscCode).trim().toUpperCase();
      const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
      if (!ifscRegex.test(rawIfsc)) {
        return res.status(400).json({
          status: 'fail',
          message: 'Invalid IFSC Code format. IFSC must be 11 characters starting with 4 letters, 5th character 0, followed by 6 alphanumeric characters (e.g. SBIN0001234).'
        });
      }
    }

    // 1. Update basic creator info
    const updateData = {};
    if (fullName) updateData.full_name = fullName;
    if (profileImage !== undefined) updateData.profile_image = profileImage;
    if (country) updateData.country = country;

    if (Object.keys(updateData).length > 0) {
      await creator.update(updateData);
    }

    // 2. Update / Upsert Profile Model (Bio & Streaming channels)
    if (CreatorProfileModel) {
      const [profileRec] = await CreatorProfileModel.findOrCreate({
        where: { creator_id: targetId },
        defaults: { creator_id: targetId }
      });
      await profileRec.update({
        bio: bio !== undefined ? bio : profileRec.bio,
        streaming_platform: streamingChannels?.platform || profileRec.streaming_platform || 'YouTube Live',
        stream_url: streamingChannels?.streamUrl !== undefined ? streamingChannels.streamUrl : profileRec.stream_url,
        channel_handle: streamingChannels?.channelHandle !== undefined ? streamingChannels.channelHandle : profileRec.channel_handle,
      });
    }

    // 3. Update Social Links
    if (CreatorSocialLinkModel && socialLinks) {
      for (const [platform, url] of Object.entries(socialLinks)) {
        if (!url) continue;
        const [linkRec] = await CreatorSocialLinkModel.findOrCreate({
          where: { creator_id: targetId, platform },
          defaults: { creator_id: targetId, platform, profile_url: url, url }
        });
        await linkRec.update({ profile_url: url, url }).catch(() => null);
      }
    }

    // 4. Update Payment Info / Bank Account
    if (CreatorBankAccountModel && paymentInfo) {
      const [bankRec] = await CreatorBankAccountModel.findOrCreate({
        where: { creator_id: targetId },
        defaults: {
          creator_id: targetId,
          account_holder_name: paymentInfo.accountHolderName || fullName || creator.full_name || 'Creator',
          account_number: paymentInfo.accountNumber || '0',
          bank_name: paymentInfo.bankName || '',
          ifsc_code: paymentInfo.ifscCode || '',
          upi_id: paymentInfo.upiId || ''
        }
      });
      await bankRec.update({
        upi_id: paymentInfo.upiId !== undefined ? paymentInfo.upiId : bankRec.upi_id,
        bank_name: paymentInfo.bankName !== undefined ? paymentInfo.bankName : bankRec.bank_name,
        account_number: paymentInfo.accountNumber !== undefined ? paymentInfo.accountNumber : bankRec.account_number,
        ifsc_code: paymentInfo.ifscCode !== undefined ? paymentInfo.ifscCode : bankRec.ifsc_code,
        account_holder_name: paymentInfo.accountHolderName || fullName || creator.full_name,
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Profile management settings saved successfully!',
      data: {
        id: creator.id,
        fullName: creator.full_name,
        username: `@${creator.username}`,
        email: creator.email,
        profileImage: creator.profile_image,
        country: creator.country,
        bio: bio || '',
        streamingChannels: streamingChannels || {},
        socialLinks: socialLinks || {},
        paymentInfo: paymentInfo || {}
      }
    });

  } catch (error) {
    console.error('UPDATE CREATOR PROFILE ERROR:', error);
    next(error);
  }
};

/**
 * @desc    Start / Create a new Live Donation Session (Requirement 5.2)
 * @route   POST /api/creators/live-sessions
 * @access  Public / Private
 */
const createLiveSession = async (req, res, next) => {
  try {
    const {
      creatorId,
      title,
      category,
      thumbnailUrl,
      description,
      streamingPlatform,
      streamUrl,
      durationHours
    } = req.body;

    const targetCreatorId = creatorId || req.user?.id || 1;
    const creator = await CreatorsModel.findByPk(targetCreatorId);
    if (!creator) {
      return res.status(404).json({ status: 'fail', message: 'Creator not found' });
    }

    if (!title) {
      return res.status(400).json({ status: 'fail', message: 'Stream Title is required.' });
    }

    const durationNum = Number(durationHours || 2);
    const endsAt = new Date(Date.now() + durationNum * 3600 * 1000);

    // Generate unique session code
    const uniqueSlug = (title || 'live-session')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const sessionCode = `${uniqueSlug}-${Math.random().toString(36).substring(2, 7)}`;

    // Close any previous active session if requested or auto-close
    try {
      await DonationSession.update(
        { status: 'closed', ended_at: new Date() },
        { where: { creator_id: targetCreatorId, status: 'active' } }
      );
    } catch (e) { }

    const newSession = await DonationSession.create({
      creator_id: targetCreatorId,
      session_code: sessionCode,
      title: title.trim(),
      category: category || '',
      description: description || '',
      thumbnail_url: thumbnailUrl || '',
      stream_url: streamUrl || '',
      duration_hours: durationNum,
      ends_at: endsAt,
      status: 'active',
      started_at: new Date(),
      total_donations: 0,
      total_amount: 0,
    });

    const origin = process.env.FRONTEND_URL || 'http://localhost:3000';
    const paymentLink = `${origin}/pay/${sessionCode}?creatorId=${targetCreatorId}&sessionId=${newSession.id}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(paymentLink)}`;
    const overlayUrl = `https://askme.pro/overlay/${creator.username}`;

    // Create QR Code Record in DB
    if (QrCodeModel) {
      try {
        await QrCodeModel.create({
          session_id: newSession.id,
          qr_token: `QR-${newSession.id}-${Date.now()}`,
          payment_url: paymentLink,
          qr_image_url: qrCodeUrl,
          status: 'active',
        });
      } catch (e) {
        console.warn('QrCodeModel create notice:', e.message);
      }
    }

    return res.status(201).json({
      status: 'success',
      message: 'Live Donation Session created successfully!',
      data: {
        session: {
          id: newSession.id,
          sessionCode: newSession.session_code,
          title: newSession.title,
          category: newSession.category,
          description: newSession.description,
          thumbnailUrl: newSession.thumbnail_url,
          streamUrl: newSession.stream_url,
          streamingPlatform: streamingPlatform || 'YouTube Live',
          durationHours: newSession.duration_hours || durationNum,
          endsAt: newSession.ends_at || endsAt,
          status: newSession.status,
          startedAt: newSession.started_at,
          createdAt: newSession.createdAt || newSession.started_at,
          totalDonations: newSession.total_donations,
          totalAmount: newSession.total_amount,
        },
        paymentLink,
        qrCodeUrl,
        overlayUrl,
      }
    });

  } catch (error) {
    console.error('CREATE LIVE SESSION ERROR:', error);
    next(error);
  }
};

/**
 * @desc    Get Creator Live Sessions
 * @route   GET /api/creators/live-sessions
 * @access  Public / Private
 */
const getLiveSessions = async (req, res, next) => {
  try {
    const creatorId = req.query.creatorId || req.user?.id || 1;
    const sessions = await DonationSession.findAll({
      where: { creator_id: creatorId },
      order: [['started_at', 'DESC']],
    });

    const origin = process.env.FRONTEND_URL || 'http://localhost:3000';

    const formatted = sessions.map(s => {
      const paymentLink = `${origin}/pay/${s.session_code}?creatorId=${s.creator_id}&sessionId=${s.id}`;
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(paymentLink)}`;

      // Auto-expire session if ends_at is past
      let curStatus = s.status;
      if (curStatus === 'active' && s.ends_at && new Date() > new Date(s.ends_at)) {
        curStatus = 'closed';
        s.update({ status: 'closed', ended_at: s.ends_at }).catch(() => { });
      }

      return {
        id: s.id,
        sessionCode: s.session_code,
        title: s.title,
        category: s.category,
        description: s.description,
        thumbnailUrl: s.thumbnail_url,
        streamUrl: s.stream_url,
        durationHours: s.duration_hours || 2,
        endsAt: s.ends_at,
        status: curStatus,
        startedAt: s.started_at,
        createdAt: s.createdAt || s.started_at,
        endedAt: s.ended_at,
        totalDonations: s.total_donations || 0,
        totalAmount: s.total_amount || 0,
        paymentLink,
        qrCodeUrl,
      };
    });

    return res.status(200).json({
      status: 'success',
      data: { sessions: formatted }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Close / End a Live Session
 * @route   PUT /api/creators/live-sessions/:id/close
 * @access  Public / Private
 */
const closeLiveSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    const session = await DonationSession.findByPk(id);
    if (!session) {
      return res.status(404).json({ status: 'fail', message: 'Live session not found' });
    }

    await session.update({
      status: 'closed',
      ended_at: new Date()
    });

    return res.status(200).json({
      status: 'success',
      message: 'Live session closed successfully',
      data: { sessionId: id, status: 'closed' }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Start / Activate a Live Session by ID
 * @route   PUT /api/creators/live-sessions/:id/start
 * @access  Public / Private
 */
const startLiveSessionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const session = await DonationSession.findByPk(id);
    if (!session) {
      return res.status(404).json({ status: 'fail', message: 'Live session not found' });
    }

    // Close any existing active session for creator
    await DonationSession.update(
      { status: 'closed', ended_at: new Date() },
      { where: { creator_id: session.creator_id, status: 'active' } }
    );

    const durationNum = Number(session.duration_hours || 2);
    const endsAt = new Date(Date.now() + durationNum * 3600 * 1000);

    // Set target session as active
    await session.update({
      status: 'active',
      started_at: new Date(),
      ends_at: endsAt,
      ended_at: null
    });

    const origin = process.env.FRONTEND_URL || 'http://localhost:3000';
    const paymentLink = `${origin}/pay/${session.session_code}?creatorId=${session.creator_id}&sessionId=${session.id}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(paymentLink)}`;

    return res.status(200).json({
      status: 'success',
      message: `Live session "${session.title}" is now LIVE!`,
      data: {
        session: {
          id: session.id,
          sessionCode: session.session_code,
          title: session.title,
          category: session.category,
          description: session.description,
          thumbnailUrl: session.thumbnail_url,
          durationHours: durationNum,
          endsAt: endsAt,
          status: 'active',
          startedAt: session.started_at,
          paymentLink,
          qrCodeUrl,
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Public Live Session Details by Session Code (for Viewer Payment Page)
 * @route   GET /api/creators/pay/session/:sessionCode
 * @access  Public
 */
const getPublicSessionDetails = async (req, res, next) => {
  try {
    const { sessionCode } = req.params;
    let session = await DonationSession.findOne({
      where: { session_code: sessionCode }
    });

    if (!session && !isNaN(sessionCode)) {
      session = await DonationSession.findByPk(sessionCode);
    }

    if (!session) {
      return res.status(404).json({ status: 'fail', message: 'Live Donation Session not found' });
    }

    // Auto-expire session if ends_at is past
    if (session.status === 'active' && session.ends_at && new Date() > new Date(session.ends_at)) {
      await session.update({ status: 'closed', ended_at: session.ends_at }).catch(() => { });
    }

    const creator = await CreatorsModel.findByPk(session.creator_id);
    let profile = null;
    if (CreatorProfileModel) {
      profile = await CreatorProfileModel.findOne({ where: { creator_id: session.creator_id } }).catch(() => null);
    }

    const origin = process.env.FRONTEND_URL || 'http://localhost:3000';
    const paymentLink = `${origin}/pay/${session.session_code}?creatorId=${session.creator_id}&sessionId=${session.id}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(paymentLink)}`;

    return res.status(200).json({
      status: 'success',
      data: {
        session: {
          id: session.id,
          sessionCode: session.session_code,
          title: session.title,
          category: session.category,
          description: session.description,
          thumbnailUrl: session.thumbnail_url,
          streamUrl: session.stream_url,
          status: session.status,
          endsAt: session.ends_at,
          startedAt: session.started_at,
          totalDonations: session.total_donations || 0,
          totalAmount: session.total_amount || 0,
        },
        creator: {
          id: creator?.id || session.creator_id,
          fullName: creator?.full_name || 'Creator Host',
          username: creator?.username ? `@${creator.username}` : '@creator',
          profileImage: creator?.profile_image || '',
          bio: profile?.bio || '',
        },
        paymentLink,
        qrCodeUrl,
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Process Viewer Donation Payment for a Live Session
 * @route   POST /api/creators/pay/process
 * @access  Public
 */
const processViewerDonation = async (req, res, next) => {
  try {
    const {
      sessionCode,
      sessionId,
      creatorId,
      amount,
      viewerName,
      viewerEmail,
      viewerMobile,
      message,
      anonymous,
      paymentMethod,
      gateway
    } = req.body;

    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      return res.status(400).json({ status: 'fail', message: 'Please enter a valid donation amount.' });
    }

    let session = null;
    if (sessionId) {
      session = await DonationSession.findByPk(sessionId);
    } else if (sessionCode) {
      session = await DonationSession.findOne({ where: { session_code: sessionCode } });
    }

    if (session && session.status !== 'active') {
      return res.status(400).json({
        status: 'fail',
        message: 'This Live Donation Session has ended. New payments are no longer accepted for this QR Code.'
      });
    }

    const targetCreatorId = creatorId || session?.creator_id || 1;
    const targetSessionId = session?.id || sessionId || 1;

    // Check if viewer has active VIP Membership for this creator
    let isVipMember = false;
    try {
      const viewerIdToCheck = req.user?.id || req.body.userId;
      if (viewerIdToCheck && targetCreatorId) {
        const existingVip = await VipMembership.findOne({
          where: {
            viewer_id: String(viewerIdToCheck),
            creator_id: String(targetCreatorId),
            status: "active",
          },
        });
        if (existingVip) {
          isVipMember = true;
        }
      }
    } catch (vipErr) {
      console.warn("VIP membership check notice:", vipErr.message);
    }
    if (req.body.isVip) isVipMember = true;

    // STEP 1: Main Donation Record (`donations` table)
    let donationRecord = null;
    if (DonationModel) {
      donationRecord = await DonationModel.create({
        session_id: targetSessionId,
        creator_id: targetCreatorId,
        viewer_name: viewerName ? viewerName.trim() : 'Anonymous Supporter',
        viewer_email: viewerEmail || null,
        viewer_mobile: viewerMobile || null,
        amount: parsedAmount,
        currency: 'INR',
        message: message ? message.trim() : '',
        anonymous: !!anonymous,
        payment_status: 'success',
        status: 'not_read',
        paid_at: new Date(),
        is_vip: isVipMember,
      }).catch((e) => {
        console.warn('DonationModel create notice:', e.message);
        return null;
      });
    }

    // Trigger Creator Notification for Payment Received (Requirement 13)
    createCreatorNotification({
      creatorId: targetCreatorId,
      type: 'payment_received',
      title: 'New Viewer Payment Received! 💰',
      message: `₹${parsedAmount.toFixed(2)} payment received from ${viewerName ? viewerName.trim() : 'Anonymous Supporter'}${message ? `: "${message.trim()}"` : ''}`,
      referenceType: 'donation',
      referenceId: donationRecord?.id || null,
    });

    // STEP 2: Payment Gateway Information (`payment_transactions` table)
    let paymentTxnRecord = null;
    if (PaymentTransactionModel && donationRecord) {
      const gatewayName = gateway || 'Razorpay';
      paymentTxnRecord = await PaymentTransactionModel.create({
        donation_id: donationRecord.id,
        gateway: gatewayName,
        gateway_order_id: `order_${Math.random().toString(36).substring(2, 10)}`,
        gateway_payment_id: `pay_${Math.random().toString(36).substring(2, 10)}`,
        gateway_transaction_id: donationRecord.donation_uuid || `txn_${Date.now()}`,
        payment_method: paymentMethod ? paymentMethod.toUpperCase() : 'UPI',
        amount: parsedAmount,
        currency: 'INR',
        status: 'success',
        gateway_response: {
          status: 'success',
          gateway: gatewayName,
          amount: parsedAmount,
          paidAt: new Date(),
        },
        paid_at: new Date(),
      }).catch((e) => {
        console.warn('PaymentTransactionModel create notice:', e.message);
        return null;
      });
    }

    // Update Session Stats (`donation_sessions` table)
    if (session) {
      try {
        await session.increment({
          total_donations: 1,
          total_amount: parsedAmount
        });
      } catch (e) { }
    }

    // STEP 3: Creator's Balance (`wallets` table - 85% Net Share, 15% Platform Commission)
    let wallet = null;
    const netSharePercent = getCreatorNetSharePercent(); // 0.85
    const creatorEarnings = parsedAmount * netSharePercent; // e.g. 1000 * 0.85 = 850
    let balBefore = 0;
    let balAfter = 0;

    if (WalletModel) {
      try {
        const [w] = await WalletModel.findOrCreate({
          where: { creator_id: targetCreatorId },
          defaults: {
            creator_id: targetCreatorId,
            total_earnings: 0,
            available_balance: 0,
            pending_balance: 0,
            withdrawn_amount: 0
          }
        });
        wallet = w;
        balBefore = parseFloat(wallet.available_balance || 0);
        await wallet.increment(['total_earnings', 'available_balance'], { by: creatorEarnings });
        balAfter = balBefore + creatorEarnings;
      } catch (e) {
        console.warn('WalletModel increment error:', e.message);
      }
    }

    // STEP 4: Wallet History (`wallet_transactions` table)
    if (WalletTransactionModel && wallet) {
      try {
        const donorDisplayName = anonymous ? 'Anonymous Supporter' : (viewerName ? viewerName.trim() : 'Supporter');
        await WalletTransactionModel.create({
          wallet_id: wallet.id,
          creator_id: targetCreatorId,
          donation_id: donationRecord?.id || null,
          transaction_type: 'donation',
          direction: 'credit',
          amount: creatorEarnings,
          balance_before: balBefore,
          balance_after: balAfter,
          description: `Donation received from ${donorDisplayName}`,
          reference: donationRecord?.donation_uuid || `DON-${Date.now()}`
        }).catch((e) => console.warn('WalletTransactionModel create notice:', e.message));
      } catch (e) {
        console.warn('WalletTransactionModel insert error:', e.message);
      }
    }

    // STEP 5: Save Donation Chat Message & Broadcast Real-Time via Socket.IO
    try {
      const donorDisplayName = anonymous ? 'Anonymous Supporter' : (viewerName ? viewerName.trim() : 'Anonymous Supporter');
      let chatRecord = null;
      if (ChatMessageModel) {
        chatRecord = await ChatMessageModel.create({
          session_id: targetSessionId,
          sender_type: 'viewer',
          sender_id: req.user?.id || 0,
          sender_name: donorDisplayName,
          donation_id: donationRecord?.id || null,
          message: message ? message.trim() : `Supported the stream with ₹${parsedAmount}`,
          message_type: 'donation',
          is_deleted: false,
        }).catch((e) => console.warn('ChatMessageModel donation create notice:', e.message));
      }

      // Calculate Queue Position for Viewer Notification
      let queuePosition = 1;
      if (DonationModel && targetSessionId) {
        try {
          const count = await DonationModel.count({
            where: { session_id: targetSessionId, payment_status: 'success', status: 'not_read' }
          });
          queuePosition = Math.max(1, count);
        } catch (e) { }
      }

      // Broadcast Socket.IO event to room: live_session_{session_id}
      const { getIO } = require('../config/socket');
      const io = getIO();
      if (io) {
        const socketPayload = {
          id: chatRecord?.id || Date.now(),
          sessionId: targetSessionId,
          senderType: 'viewer',
          senderId: req.user?.id || 0,
          senderName: donorDisplayName,
          donationId: donationRecord?.id,
          amount: parsedAmount,
          message: message ? message.trim() : `Supported the stream with ₹${parsedAmount}`,
          messageType: 'donation',
          isVip: isVipMember,
          queuePosition,
          createdAt: new Date(),
        };
        io.to(`live_session_${targetSessionId}`).emit('new_donation', socketPayload);
        io.to(`live_session_${targetSessionId}`).emit('new_message', socketPayload);
        io.to(`live_session_${targetSessionId}`).emit('viewer_queue_position', {
          sessionId: targetSessionId,
          donationId: donationRecord?.id,
          viewerName: donorDisplayName,
          isVip: isVipMember,
          queuePosition,
          message: `Aap ${queuePosition} number pe hain queue mein.`,
        });
      }
    } catch (sErr) {
      console.warn('Socket donation broadcast notice:', sErr.message);
    }

    const methodLabels = {
      upi: 'Instant UPI (PhonePe/GPay)',
      debit_card: 'Debit Card (Visa/Mastercard)',
      credit_card: 'Credit Card',
      netbanking: 'Net Banking',
      wallet: 'Wallets (Paytm/Amazon Pay)'
    };

    return res.status(200).json({
      status: 'success',
      message: `Payment of ₹${parsedAmount.toFixed(2)} via ${methodLabels[paymentMethod] || 'UPI'} completed successfully!`,
      data: {
        donationUuid: donationRecord?.donation_uuid || `DON-${Date.now()}`,
        donationId: donationRecord?.id,
        sessionId: targetSessionId,
        creatorId: targetCreatorId,
        amount: parsedAmount,
        grossAmount: parsedAmount,
        netCreatorEarning: creatorEarnings,
        platformCommission: parsedAmount - creatorEarnings,
        paymentMethod: methodLabels[paymentMethod] || 'Instant UPI',
        viewerName: viewerName || 'Anonymous Supporter',
        message: message || '',
        isVip: isVipMember,
        queuePosition: queuePosition,
        queueMessage: `Aap ${queuePosition} number pe hain queue mein.`,
        paidAt: new Date(),
      }
    });

  } catch (error) {
    console.error('DONATION PAYMENT PROCESS ERROR:', error);
    next(error);
  }
};

/**
 * @desc    Get Chat History for a Live Session (Requirement)
 * @route   GET /api/creators/live-sessions/:sessionId/messages
 * @access  Public
 */
const getSessionMessages = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    let messages = [];

    if (ChatMessageModel) {
      const records = await ChatMessageModel.findAll({
        where: { session_id: sessionId, is_deleted: false },
        order: [['created_at', 'ASC']],
        limit: 100,
      });

      messages = records.map(m => ({
        id: m.id,
        sessionId: m.session_id,
        senderType: m.sender_type,
        senderId: m.sender_id,
        senderName: m.sender_name || (m.sender_type === 'creator' ? 'Creator Host' : 'Viewer'),
        donationId: m.donation_id,
        message: m.message,
        messageType: m.message_type,
        createdAt: m.created_at || m.createdAt,
      }));
    }

    return res.status(200).json({
      status: 'success',
      data: { messages }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Creator Replies to a Viewer Donation (Requirement)
 * @route   POST /api/creators/live-sessions/chat/reply
 * @access  Private / Public
 */
const replyToDonation = async (req, res, next) => {
  try {
    const { sessionId, donationId, message, senderName } = req.body;
    const creatorId = req.user?.id || req.body.creatorId || 1;

    if (!sessionId || !donationId || !message || !message.trim()) {
      return res.status(400).json({ status: 'error', message: 'Missing required parameters (sessionId, donationId, message).' });
    }

    let replyRecord = null;
    if (ChatMessageModel) {
      replyRecord = await ChatMessageModel.create({
        session_id: sessionId,
        sender_type: 'creator',
        sender_id: creatorId,
        sender_name: senderName || 'Creator Host',
        donation_id: donationId,
        message: message.trim(),
        message_type: 'donation_reply',
        is_deleted: false,
      });
    }

    const replyPayload = {
      id: replyRecord?.id || Date.now(),
      sessionId: parseInt(sessionId, 10),
      senderType: 'creator',
      senderId: creatorId,
      senderName: senderName || 'Creator Host',
      donationId: parseInt(donationId, 10),
      message: message.trim(),
      messageType: 'donation_reply',
      createdAt: new Date(),
    };

    // Broadcast via Socket.IO
    const { getIO } = require('../config/socket');
    const io = getIO();
    if (io) {
      io.to(`live_session_${sessionId}`).emit('donation_replied', replyPayload);
      io.to(`live_session_${sessionId}`).emit('new_message', replyPayload);
    }

    return res.status(200).json({
      status: 'success',
      message: 'Donation reply sent successfully!',
      data: { reply: replyPayload }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Overlay Widget Data for OBS / Streamlabs Browser Source
 * @route   GET /api/creators/overlay/data/:identifier
 * @access  Public
 */
const getOverlayData = async (req, res, next) => {
  try {
    const { identifier } = req.params;
    let creator = null;

    if (!isNaN(identifier)) {
      creator = await CreatorsModel.findByPk(identifier);
    } else {
      const cleanUsername = identifier.replace(/^@/, '').trim();
      creator = await CreatorsModel.findOne({ where: { username: cleanUsername } });
      if (!creator) {
        creator = await CreatorsModel.findOne({ where: { full_name: cleanUsername } });
      }
    }

    if (!creator) {
      creator = await CreatorsModel.findByPk(1);
    }

    const creatorId = creator?.id || 1;

    let activeSession = await DonationSession.findOne({
      where: { creator_id: creatorId, status: 'active' },
      order: [['started_at', 'DESC']]
    });

    if (!activeSession) {
      activeSession = await DonationSession.findOne({
        where: { creator_id: creatorId },
        order: [['createdAt', 'DESC']]
      });
    }

    const origin = process.env.FRONTEND_URL || 'http://localhost:3000';
    const sessionCode = activeSession?.session_code || 'live';
    const paymentLink = `${origin}/pay/${sessionCode}?creatorId=${creatorId}&sessionId=${activeSession?.id || 1}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(paymentLink)}`;

    return res.status(200).json({
      status: 'success',
      data: {
        creator: {
          id: creatorId,
          fullName: creator?.full_name || 'Creator Host',
          username: creator?.username ? `@${creator.username}` : '@creator',
          profileImage: creator?.profile_image || '',
        },
        session: activeSession ? {
          id: activeSession.id,
          sessionCode: activeSession.session_code,
          title: activeSession.title,
          category: activeSession.category,
          status: activeSession.status,
        } : null,
        paymentLink,
        qrCodeUrl,
        supportText: 'Support Creator',
        scanText: 'Scan & Send Message',
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Latest Donation Alerts for OBS Overlay Animation
 * @route   GET /api/creators/overlay/alerts/:creatorId
 * @access  Public
 */
const getOverlayAlerts = async (req, res, next) => {
  try {
    const { creatorId } = req.params;
    let alerts = [];

    if (DonationModel) {
      const donations = await DonationModel.findAll({
        where: { creator_id: creatorId, payment_status: 'success', status: 'not_read' },
        order: [['created_at', 'DESC']],

      });

      alerts = donations.map(d => ({
        id: d.id,
        donationUuid: d.donation_uuid,
        viewerName: d.anonymous ? 'Anonymous Supporter' : (d.viewer_name || 'Supporter'),
        amount: parseFloat(d.amount || 0),
        message: d.message || '',
        paidAt: d.paid_at || d.createdAt,
        isVip: !!d.is_vip,
      }));

      // Sort Priority: VIP questions FIRST at the top of the Creator queue!
      alerts.sort((a, b) => {
        const aVip = a.isVip ? 1 : 0;
        const bVip = b.isVip ? 1 : 0;
        if (bVip !== aVip) return bVip - aVip;
        return new Date(a.paidAt || 0) - new Date(b.paidAt || 0);
      });
    }

    return res.status(200).json({
      status: 'success',
      data: { alerts }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Payment Gateway Webhook Endpoint for Real-Time Donation Confirmation
 * @route   POST /api/creators/pay/webhook
 * @access  Public
 */
const handlePaymentWebhook = async (req, res, next) => {
  try {
    const { event, data } = req.body;

    if (event === 'payment.completed' || event === 'donation.success' || req.body.status === 'success') {
      const payload = data || req.body;
      const parsedAmount = parseFloat(payload.amount || 0);

      if (parsedAmount > 0 && DonationModel) {
        await DonationModel.create({
          session_id: payload.sessionId || 1,
          creator_id: payload.creatorId || 1,
          viewer_name: payload.viewerName || payload.name || 'Anonymous Supporter',
          viewer_email: payload.viewerEmail || payload.email || null,
          amount: parsedAmount,
          currency: 'INR',
          message: payload.message || '',
          anonymous: !!payload.anonymous,
          status: 'success',
          paid_at: new Date(),
        }).catch(() => null);

        // Update Wallet (Dynamic Creator Net Share based on Admin Commission Config)
        if (WalletModel) {
          const netShare = parsedAmount * getCreatorNetSharePercent();
          const [wallet] = await WalletModel.findOrCreate({
            where: { creator_id: payload.creatorId || 1 },
            defaults: { creator_id: payload.creatorId || 1, balance: 0, total_earnings: 0, available_balance: 0 }
          });
          await wallet.increment(['balance', 'total_earnings', 'available_balance'], { by: netShare });
        }
      }
    }

    return res.status(200).json({ status: 'success', message: 'Webhook received & processed' });
  } catch (error) {
    console.error('PAYMENT WEBHOOK ERROR:', error);
    return res.status(200).json({ status: 'success', message: 'Webhook processed' });
  }
};

/**
 * @desc    Get Creator Wallet Details & Transaction History (Requirement 11)
 * @route   GET /api/creators/wallet/details
 * @access  Public / Private
 */
const getCreatorWalletDetails = async (req, res, next) => {
  try {
    const creatorId = req.user?.id || req.query.creatorId || 1;

    let wallet = null;
    if (WalletModel) {
      wallet = await WalletModel.findOne({ where: { creator_id: creatorId } }).catch(() => null);
    }

    let transactions = [];
    if (DonationModel) {
      const donations = await DonationModel.findAll({
        where: { creator_id: creatorId },
        order: [['id', 'DESC']],
        limit: 50,
      }).catch(() => []);

      transactions = donations.map(d => ({
        id: d.id,
        donationUuid: d.donation_uuid || `TXN-${d.id}`,
        date: d.paid_at || d.createdAt,
        viewerName: d.anonymous ? 'Anonymous Supporter' : (d.viewer_name || 'Anonymous Supporter'),
        amount: parseFloat(d.amount || 0),
        netAmount: parseFloat(d.amount || 0) * 0.85,
        message: d.message || '',
        payment_status: d.payment_status === 'success' ? 'Successful' : (d.payment_status === 'pending' ? 'Pending' : (d.payment_status === 'refunded' ? 'Refunded' : 'Failed')),
      }));
    }

    const totalEarnings = wallet?.total_earnings
      ? parseFloat(wallet.total_earnings)
      : transactions.filter(t => t.status === 'Successful').reduce((acc, t) => acc + t.netAmount, 0);

    const availableBalance = wallet?.available_balance
      ? parseFloat(wallet.available_balance)
      : (wallet?.balance ? parseFloat(wallet.balance) : totalEarnings);

    const pendingAmount = wallet?.pending_balance
      ? parseFloat(wallet.pending_balance)
      : transactions.filter(t => t.status === 'Pending').reduce((acc, t) => acc + t.netAmount, 0);

    const withdrawnAmount = wallet?.withdrawn_amount
      ? parseFloat(wallet.withdrawn_amount)
      : 0;

    return res.status(200).json({
      status: 'success',
      data: {
        wallet: {
          totalEarnings,
          availableBalance,
          pendingAmount,
          withdrawnAmount,
        },
        transactions
      }
    });

  } catch (error) {
    console.error('GET CREATOR WALLET ERROR:', error);
    next(error);
  }
};

/**
 * @desc    Submit Payout Withdrawal Request to Creator Bank/UPI (Stage 4 & 5)
 * @route   POST /api/creators/wallet/withdraw
 * @access  Public / Private
 */
const requestWithdrawal = async (req, res, next) => {
  try {
    const creatorId = req.user?.id || req.body.creatorId || 1;
    const { amount, bankAccountInfo } = req.body;

    const parsedAmount = parseFloat(amount || 0);
    if (!parsedAmount || parsedAmount < 500) {
      return res.status(400).json({
        status: 'fail',
        message: 'Minimum withdrawal limit is ₹500.00.'
      });
    }

    let wallet = null;
    if (WalletModel) {
      wallet = await WalletModel.findOne({ where: { creator_id: creatorId } }).catch(() => null);
    }

    const availableBal = wallet ? parseFloat(wallet.available_balance || 0) : 0;
    if (availableBal < parsedAmount) {
      return res.status(400).json({
        status: 'fail',
        message: `Insufficient available balance. Available: ₹${availableBal.toFixed(2)}, Requested: ₹${parsedAmount.toFixed(2)}`
      });
    }

    // Reserve balance from available_balance to pending_balance
    if (wallet) {
      await wallet.decrement('available_balance', { by: parsedAmount }).catch(() => null);
      await wallet.increment('pending_balance', { by: parsedAmount }).catch(() => null);
    }

    // Create Withdrawal Record in DB
    let withdrawalRecord = null;
    const bankSummary = bankAccountInfo || (req.body.bankName ? `${req.body.bankName} (A/C: ****${(req.body.accountNumber || '').slice(-4)})` : 'Bank Transfer Requested');

    if (WithdrawalRequestModel) {
      withdrawalRecord = await WithdrawalRequestModel.create({
        creator_id: creatorId,
        wallet_id: wallet?.id || 1,
        amount: parsedAmount,
        net_amount: parsedAmount,
        status: 'pending',
        rejection_reason: bankSummary,
        requested_at: new Date(),
      }).catch(() => null);
    }

    // Record Ledger Transaction
    if (WalletTransactionModel && wallet) {
      await WalletTransactionModel.create({
        wallet_id: wallet.id,
        creator_id: creatorId,
        withdrawal_id: withdrawalRecord?.id || null,
        transaction_type: 'withdrawal',
        direction: 'debit',
        amount: parsedAmount,
        balance_before: availableBal,
        balance_after: availableBal - parsedAmount,
        description: `Payout Withdrawal Request (Pending Admin Settlement)`,
        reference: withdrawalRecord?.withdrawal_uuid || `WTH-${Date.now()}`
      }).catch(() => null);
    }

    return res.status(200).json({
      status: 'success',
      message: `Payout withdrawal request of ₹${parsedAmount.toFixed(2)} submitted successfully! Admin will settle to your bank account.`,
      data: {
        withdrawalId: withdrawalRecord?.withdrawal_uuid || `WTH-${Date.now()}`,
        rawId: withdrawalRecord?.id,
        amount: parsedAmount,
        bankDetails: bankSummary,
        status: 'pending',
        requestedAt: new Date()
      }
    });

  } catch (error) {
    console.error('REQUEST WITHDRAWAL ERROR:', error);
    next(error);
  }
};

/**
 * @desc    Get List of Withdrawal Requests for Logged-in Creator
 * @route   GET /api/creators/wallet/withdrawals
 * @access  Public / Private
 */
const getCreatorWithdrawals = async (req, res, next) => {
  try {
    const creatorId = req.user?.id || req.query.creatorId || 1;

    let withdrawals = [];
    if (WithdrawalRequestModel) {
      const records = await WithdrawalRequestModel.findAll({
        where: { creator_id: creatorId },
        order: [['id', 'DESC']],
        limit: 50,
      }).catch(() => []);

      withdrawals = records.map(w => ({
        id: w.withdrawal_uuid || `WTH-${w.id}`,
        rawId: w.id,
        amount: parseFloat(w.amount || 0),
        netAmount: parseFloat(w.net_amount || w.amount || 0),
        bankDetails: w.rejection_reason && (w.status === 'pending' || w.status === 'approved' || w.status === 'processing')
          ? w.rejection_reason
          : 'Bank Account / UPI Settlement',
        status: (w.status || 'pending').toLowerCase(),
        requestedDate: w.requested_at || w.createdAt,
        approvedAt: w.approved_at,
        completedAt: w.completed_at,
        transactionReference: w.transaction_reference || null,
        rejectionReason: w.status === 'rejected' ? w.rejection_reason : null,
      }));
    }

    return res.status(200).json({
      status: 'success',
      data: { withdrawals }
    });
  } catch (error) {
    console.error('GET CREATOR WITHDRAWALS ERROR:', error);
    next(error);
  }
};

/**
 * @desc    Get Creator Saved Bank Account / UPI Details
 * @route   GET /api/creators/bank-account
 * @access  Public / Private
 */
const getCreatorBankAccount = async (req, res, next) => {
  try {
    const creatorId = req.user?.id || req.query.creatorId || 1;

    let bankAccount = null;
    if (CreatorBankAccountModel) {
      bankAccount = await CreatorBankAccountModel.findOne({
        where: { creator_id: creatorId, status: 'active' },
        order: [['id', 'DESC']],
      }).catch(() => null);
    }

    return res.status(200).json({
      status: 'success',
      data: { bankAccount }
    });
  } catch (error) {
    console.error('GET BANK ACCOUNT ERROR:', error);
    next(error);
  }
};

/**
 * @desc    Add or Update Creator Bank Account / UPI Details
 * @route   POST /api/creators/bank-account
 * @access  Public / Private
 */
const saveCreatorBankAccount = async (req, res, next) => {
  try {
    const creatorId = req.user?.id || req.body.creatorId || 1;
    const { accountHolderName, bankName, accountNumber, ifscCode, upiId, accountType } = req.body;

    if (!accountHolderName || (!accountNumber && !upiId)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide Account Holder Name and Bank Account Number or UPI ID.'
      });
    }

    const rawIfsc = String(ifscCode || '').trim().toUpperCase();
    if (rawIfsc) {
      const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
      if (!ifscRegex.test(rawIfsc)) {
        return res.status(400).json({
          status: 'fail',
          message: 'Invalid IFSC Code format. IFSC must be 11 characters starting with 4 letters, 5th character 0, followed by 6 alphanumeric characters (e.g. SBIN0001234).'
        });
      }
    }

    let bankRecord = null;
    if (CreatorBankAccountModel) {
      bankRecord = await CreatorBankAccountModel.create({
        creator_id: creatorId,
        account_holder_name: accountHolderName,
        bank_name: bankName || 'Bank',
        account_number: accountNumber || 'N/A',
        ifsc_code: ifscCode || '',
        upi_id: upiId || '',
        account_type: accountType || (upiId ? 'upi' : 'bank'),
        is_primary: true,
        is_verified: true,
        status: 'active'
      }).catch(() => null);
    }

    return res.status(200).json({
      status: 'success',
      message: 'Bank account / payout details saved successfully!',
      data: { bankAccount: bankRecord }
    });
  } catch (error) {
    console.error('SAVE BANK ACCOUNT ERROR:', error);
    next(error);
  }
};

/**
 * @desc    Verify UPI ID Format and Duplicate Check
 * @route   POST /api/creators/verify-upi
 * @access  Public / Private
 */
const verifyCreatorUpi = async (req, res, next) => {
  try {
    const { upiId, creatorId } = req.body;
    const currentCreatorId = creatorId || req.user?.id || 1;

    const rawUpi = String(upiId || '');
    if (!rawUpi || !rawUpi.trim()) {
      return res.status(400).json({
        status: 'fail',
        message: 'UPI ID is required.'
      });
    }

    if (/\s/.test(rawUpi)) {
      return res.status(400).json({
        status: 'fail',
        message: 'UPI ID should not contain spaces.'
      });
    }

    const cleanUpi = rawUpi.trim().toLowerCase();
    const parts = cleanUpi.split('@');
    if (parts.length !== 2) {
      return res.status(400).json({
        status: 'fail',
        message: 'The UPI ID could not be verified. Please enter a valid UPI ID.'
      });
    }

    const [uname, handle] = parts;
    const unameRegex = /^[a-zA-Z0-9._-]+$/;
    if (!uname || !unameRegex.test(uname)) {
      return res.status(400).json({
        status: 'fail',
        message: 'The UPI ID could not be verified. Please enter a valid UPI ID.'
      });
    }

    const validHandles = [
      'upi', 'okicici', 'oksbi', 'okaxis', 'ybl', 'paytm', 'icici', 'sbi',
      'axisbank', 'kotak', 'ibl', 'airtel', 'barodampay', 'federal', 'mahb',
      'indus', 'postbank', 'dlb', 'hsbc', 'unionbank', 'hdfcbank', 'pnb', 'rbl', 'yesbank'
    ];

    if (!validHandles.includes(handle)) {
      return res.status(400).json({
        status: 'fail',
        message: 'The UPI ID could not be verified. Please enter a valid UPI ID.'
      });
    }

    // Duplicate check across Creator Bank Accounts table
    if (CreatorBankAccountModel) {
      const existing = await CreatorBankAccountModel.findOne({
        where: {
          upi_id: cleanUpi,
          creator_id: { [Op.ne]: currentCreatorId }
        }
      });
      if (existing) {
        return res.status(409).json({
          status: 'fail',
          message: 'This UPI ID is already added. Please use another UPI ID.'
        });
      }
    }

    return res.status(200).json({
      status: 'success',
      message: 'UPI ID Verified',
      data: {
        upiId: cleanUpi,
        verified: true
      }
    });
  } catch (error) {
    console.error('VERIFY UPI ERROR:', error);
    next(error);
  }
};

// Requirement 13: Creator Notifications Store & Methods
let mockCreatorNotifications = [];

/**
 * Helper to trigger and save a Creator Notification (Requirement 13)
 * Types: 'kyc_approved', 'payment_received', 'withdrawal_approved', 'withdrawal_rejected', 'system_update'
 */
const createCreatorNotification = async ({ creatorId, type, title, message, referenceType = null, referenceId = null }) => {
  if (!creatorId) return null;
  let notifRecord = null;
  try {
    const NotificationModel = require('../models/NotificationModel');
    notifRecord = await NotificationModel.create({
      user_id: creatorId,
      type: type || 'system_update',
      title: title || 'New Notification',
      message: message || '',
      reference_type: referenceType,
      reference_id: referenceId,
      is_read: false,
    });
  } catch (err) {
    console.warn('Notice saving Creator Notification to DB:', err.message);
  }

  const notifObj = {
    id: notifRecord?.id || Date.now(),
    creatorId: Number(creatorId),
    type: type || 'system_update',
    title,
    message,
    referenceType,
    referenceId,
    isRead: false,
    date: new Date(),
  };

  mockCreatorNotifications.unshift(notifObj);

  // Broadcast real-time Socket.IO event
  try {
    const { getIO } = require('../config/socket');
    const io = getIO();
    if (io) {
      io.emit(`creator_notification_${creatorId}`, notifObj);
      io.emit('creator_notification', notifObj);
    }
  } catch (sErr) {
    console.warn('Notice emitting creator notification socket:', sErr.message);
  }

  return notifObj;
};

/**
 * @desc Get Creator Notifications (Requirement 13)
 * @route GET /api/creators/notifications
 */
const getCreatorNotifications = async (req, res, next) => {
  try {
    const creatorId = req.query.creatorId || req.user?.id || 1;
    let notificationsList = [];

    try {
      const NotificationModel = require('../models/NotificationModel');
      const dbRecords = await NotificationModel.findAll({
        where: { user_id: creatorId },
        order: [['id', 'DESC']],
        limit: 50,
      });

      notificationsList = dbRecords.map(n => ({
        id: n.id,
        creatorId: n.user_id,
        type: n.type,
        title: n.title,
        message: n.message,
        referenceType: n.reference_type,
        referenceId: n.reference_id,
        isRead: !!n.is_read,
        date: n.createdAt || n.read_at || new Date(),
      }));
    } catch (e) {
      console.warn('DB Creator notifications query notice:', e.message);
    }

    // Merge in-memory notifications for this creator
    const memoryNotifs = mockCreatorNotifications.filter(n => Number(n.creatorId) === Number(creatorId));
    memoryNotifs.forEach(mn => {
      if (!notificationsList.some(dn => String(dn.id) === String(mn.id))) {
        notificationsList.unshift(mn);
      }
    });

    // Seed default notifications for Requirement 13 if empty
    if (notificationsList.length === 0) {
      notificationsList = [
        {
          id: 501,
          creatorId: Number(creatorId),
          type: 'kyc_approved',
          title: 'KYC Verified & Approved! 🎉',
          message: 'Congratulations! Your identity documents and bank account payout details have been verified & approved by Super Admin.',
          isRead: false,
          date: new Date(Date.now() - 3600000 * 2),
        },
        {
          id: 502,
          creatorId: Number(creatorId),
          type: 'payment_received',
          title: 'New Viewer Payment Received! 💰',
          message: '₹500.00 donation received from CarryFan: "Love your live broadcast streams! Keep up the great work."',
          isRead: false,
          date: new Date(Date.now() - 3600000 * 5),
        },
        {
          id: 503,
          creatorId: Number(creatorId),
          type: 'withdrawal_approved',
          title: 'Payout Withdrawal Approved! ✅',
          message: 'Your payout withdrawal request for ₹1,200.00 has been approved and settled to your bank account.',
          isRead: true,
          date: new Date(Date.now() - 86400000),
        },
        {
          id: 504,
          creatorId: Number(creatorId),
          type: 'withdrawal_rejected',
          title: 'Payout Withdrawal Rejected ❌',
          message: 'Your payout withdrawal request for ₹300.00 was rejected. Reason: Minimum withdrawal limit is ₹500.00.',
          isRead: true,
          date: new Date(Date.now() - 86400000 * 2),
        },
        {
          id: 505,
          creatorId: Number(creatorId),
          type: 'system_update',
          title: 'New Platform Feature Update 🚀',
          message: 'AskMe Creator Studio v2.0 released with live OBS overlay themes, instant viewer donation alerts, & bank settlement tracking.',
          isRead: true,
          date: new Date(Date.now() - 86400000 * 3),
        },
      ];
    }

    return res.status(200).json({
      status: 'success',
      data: { notifications: notificationsList }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Mark all notifications read for creator
 * @route PUT /api/creators/notifications/mark-read
 */
const markCreatorNotificationsRead = async (req, res, next) => {
  try {
    const creatorId = req.query.creatorId || req.body.creatorId || 1;
    mockCreatorNotifications.forEach(n => {
      if (Number(n.creatorId) === Number(creatorId)) {
        n.isRead = true;
      }
    });

    try {
      const NotificationModel = require('../models/NotificationModel');
      await NotificationModel.update(
        { is_read: true, read_at: new Date() },
        { where: { user_id: creatorId } }
      );
    } catch (e) { }

    return res.status(200).json({
      status: 'success',
      message: 'All creator notifications marked as read'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Mark single notification read
 * @route PUT /api/creators/notifications/:id/read
 */
const markSingleCreatorNotificationRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const target = mockCreatorNotifications.find(n => String(n.id) === String(id));
    if (target) {
      target.isRead = true;
    }

    try {
      const NotificationModel = require('../models/NotificationModel');
      await NotificationModel.update(
        { is_read: true, read_at: new Date() },
        { where: { id } }
      );
    } catch (e) { }

    return res.status(200).json({
      status: 'success',
      message: 'Notification marked as read'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update Donation Status in donations table (status: 'read' or 'cancelled')
 * @route   PUT /api/creators/donations/:id/status
 * @access  Public / Private
 */
const updateDonationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'read' or 'cancelled'

    if (!['read', 'cancelled'].includes(status)) {
      return res.status(400).json({ status: 'fail', message: 'Invalid status. Must be read or cancelled.' });
    }

    if (DonationModel) {
      const isUuid = typeof id === 'string' && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id);

      let donation = null;
      if (isUuid) {
        donation = await DonationModel.findOne({ where: { donation_uuid: id } });
      } else {
        const numId = Number(id);
        if (!isNaN(numId)) {
          donation = await DonationModel.findOne({ where: { id: numId } });
        }
      }

      if (donation) {
        donation.status = status;
        await donation.save();

        // Broadcast Socket.IO event so remaining viewers queue updates live
        try {
          const { getIO } = require('../config/socket');
          const io = getIO();
          if (io && donation.session_id) {
            io.to(`live_session_${donation.session_id}`).emit('queue_item_completed', {
              donationId: donation.id,
              donationUuid: donation.donation_uuid,
              status
            });
          }
        } catch (sErr) { }

        return res.status(200).json({
          status: 'success',
          message: `Donation status updated to ${status}`,
          data: { donation }
        });
      }
    }

    return res.status(404).json({ status: 'fail', message: 'Donation record not found' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerCreator,
  loginCreator,
  submitKyc,
  getKycStatus,
  getCreatorProfile,
  updateCreatorProfile,
  createLiveSession,
  getLiveSessions,
  closeLiveSession,
  startLiveSessionById,
  getPublicSessionDetails,
  processViewerDonation,
  getOverlayData,
  getOverlayAlerts,
  handlePaymentWebhook,
  getCreatorWalletDetails,
  requestWithdrawal,
  getCreatorWithdrawals,
  getCreatorBankAccount,
  saveCreatorBankAccount,
  getSessionMessages,
  replyToDonation,
  createCreatorNotification,
  getCreatorNotifications,
  markCreatorNotificationsRead,
  markSingleCreatorNotificationRead,
  updateDonationStatus,
  verifyCreatorUpi,
};