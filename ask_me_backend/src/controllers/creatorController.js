const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");

const CreatorsModel = require("../models/CreatorsModel");
const CreatorProfileModel = require("../models/CreatorProfileModel");
const CreatorSocialLinkModel = require("../models/CreatorSocialLinkModel");
const WalletModel = require("../models/WalletModel");
const DonationSession = require("../models/DonationSessionModels");
const { getCreatorNetSharePercent } = require("../config/commissionConfig");

let KycVerificationModel;
let KycDocumentModel;
let CreatorBankAccountModel;
let QrCodeModel;
let DonationModel;
let WithdrawalRequestModel;

try { KycVerificationModel = require('../models/KycVerificationModel'); } catch (e) { }
try { KycDocumentModel = require('../models/KycDocumentModel'); } catch (e) { }
try { CreatorBankAccountModel = require('../models/CreatorBankAccountModel'); } catch (e) { }
try { QrCodeModel = require('../models/QrCodeModel'); } catch (e) { }
try { DonationModel = require('../models/DonationModel'); } catch (e) { }
try { WithdrawalRequestModel = require('../models/WithdrawalRequestModel'); } catch (e) { }

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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(creatorEmail)) {
      await transaction.rollback();
      return res.status(400).json({
        status: "fail",
        message: "Please provide a valid email address.",
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
          kyc_status: "pending",
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

    // try {
    //   await WalletModel.create(
    //     {
    //       creator_id: creator.id,
    //       creatorId: creator.id,
    //       total_earnings: 0,
    //       available_balance: 0,
    //       pending_balance: 0,
    //       withdrawn_amount: 0,
    //     },
    //     { transaction }
    //   );
    //   console.log("WALLET CREATED:", creator.id);
    // } catch (err) {
    //   console.warn("Notice saving Wallet:", err.message);
    // }

    await transaction.commit();

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
          kycStatus: "pending",
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
            status: 'active',
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
          { kyc_status: 'pending' },
          { where: { creator_id: targetCreatorId }, transaction }
        );
      } catch (err) {
        console.warn('Notice updating CreatorProfile kyc_status:', err.message);
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
    const creatorId = req.query.creatorId || req.user?.id || req.body?.creatorId || 1;
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
      socialLinks = await CreatorSocialLinkModel.findAll({ where: { creator_id: creatorId } }).catch(() => []);
    }
    if (CreatorBankAccountModel) {
      bankAccount = await CreatorBankAccountModel.findOne({ where: { creator_id: creatorId } }).catch(() => null);
    }

    const socialMap = {};
    socialLinks.forEach(link => {
      if (link.platform) socialMap[link.platform.toLowerCase()] = link.url || link.handle || '';
    });

    return res.status(200).json({
      status: 'success',
      data: {
        creatorId: creator.id,
        fullName: creator.full_name,
        username: `@${creator.username}`,
        email: creator.email,
        mobile: creator.mobile,
        country: creator.country,
        profileImage: creator.profile_image || '',
        bio: profile?.bio || '',
        streamingChannels: {
          platform: profile?.streaming_platform || 'YouTube Live',
          streamUrl: profile?.stream_url || '',
          channelHandle: profile?.channel_handle || `@${creator.username}`,
        },
        socialLinks: {
          youtube: socialMap.youtube || '',
          instagram: socialMap.instagram || '',
          twitter: socialMap.twitter || socialMap.x || '',
          twitch: socialMap.twitch || '',
          discord: socialMap.discord || '',
        },
        paymentInfo: {
          upiId: bankAccount?.upi_id || '',
          bankName: bankAccount?.bank_name || '',
          accountNumber: bankAccount?.account_number || '',
          ifscCode: bankAccount?.ifsc_code || '',
          accountHolderName: bankAccount?.account_holder_name || creator.full_name || '',
        }
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
          defaults: { creator_id: targetId, platform, url }
        });
        await linkRec.update({ url });
      }
    }

    // 4. Update Payment Info / Bank Account
    if (CreatorBankAccountModel && paymentInfo) {
      const [bankRec] = await CreatorBankAccountModel.findOrCreate({
        where: { creator_id: targetId },
        defaults: { creator_id: targetId }
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
      streamUrl
    } = req.body;

    const targetCreatorId = creatorId || req.user?.id || 1;
    const creator = await CreatorsModel.findByPk(targetCreatorId);
    if (!creator) {
      return res.status(404).json({ status: 'fail', message: 'Creator not found' });
    }

    if (!title) {
      return res.status(400).json({ status: 'fail', message: 'Stream Title is required.' });
    }

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
          status: newSession.status,
          startedAt: newSession.started_at,
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
      return {
        id: s.id,
        sessionCode: s.session_code,
        title: s.title,
        category: s.category,
        description: s.description,
        thumbnailUrl: s.thumbnail_url,
        streamUrl: s.stream_url,
        status: s.status,
        startedAt: s.started_at,
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

    // Set target session as active
    await session.update({
      status: 'active',
      started_at: new Date(),
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
      paymentMethod
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

    // Create Donation Record in DB
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
        status: 'success',
        paid_at: new Date(),
      }).catch((e) => {
        console.warn('DonationModel create notice:', e.message);
        return null;
      });
    }

    // Update Session Stats
    if (session) {
      try {
        await session.increment({
          total_donations: 1,
          total_amount: parsedAmount
        });
      } catch (e) { }
    }

    // Update Creator Wallet (Dynamic Net Revenue Share based on Admin Commission Config)
    if (WalletModel) {
      try {
        const netShare = parsedAmount * getCreatorNetSharePercent();
        const [wallet] = await WalletModel.findOrCreate({
          where: { creator_id: targetCreatorId },
          defaults: {
            creator_id: targetCreatorId,
            balance: 0,
            total_earnings: 0,
            available_balance: 0,
            pending_balance: 0,
            withdrawn_amount: 0
          }
        });
        await wallet.increment(['balance', 'total_earnings', 'available_balance'], { by: netShare });
      } catch (e) {
        console.warn('WalletModel increment error:', e.message);
      }
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
        sessionId: targetSessionId,
        creatorId: targetCreatorId,
        amount: parsedAmount,
        paymentMethod: methodLabels[paymentMethod] || 'Instant UPI',
        viewerName: viewerName || 'Anonymous Supporter',
        message: message || '',
        paidAt: new Date(),
      }
    });

  } catch (error) {
    console.error('DONATION PAYMENT PROCESS ERROR:', error);
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
        where: { creator_id: creatorId, status: 'success' },
        order: [['created_at', 'DESC']],
        limit: 5
      });

      alerts = donations.map(d => ({
        id: d.id,
        donationUuid: d.donation_uuid,
        viewerName: d.anonymous ? 'Anonymous Supporter' : (d.viewer_name || 'Supporter'),
        amount: parseFloat(d.amount || 0),
        message: d.message || '',
        paidAt: d.paid_at || d.createdAt,
      }));
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
        status: d.status === 'success' ? 'Successful' : (d.status === 'pending' ? 'Pending' : (d.status === 'refunded' ? 'Refunded' : 'Failed')),
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
    if (WithdrawalRequestModel) {
      withdrawalRecord = await WithdrawalRequestModel.create({
        creator_id: creatorId,
        wallet_id: wallet?.id || 1,
        amount: parsedAmount,
        net_amount: parsedAmount,
        status: 'pending',
        rejection_reason: bankAccountInfo ? `Payout to ${bankAccountInfo}` : 'Bank Transfer Requested'
      }).catch(() => null);
    }

    return res.status(200).json({
      status: 'success',
      message: `Payout withdrawal request of ₹${parsedAmount.toFixed(2)} submitted successfully! Admin will settle to your bank account.`,
      data: {
        withdrawalId: withdrawalRecord?.withdrawal_uuid || `WTH-${Date.now()}`,
        amount: parsedAmount,
        status: 'pending',
        requestedAt: new Date()
      }
    });

  } catch (error) {
    console.error('REQUEST WITHDRAWAL ERROR:', error);
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
};