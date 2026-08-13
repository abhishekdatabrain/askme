const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");

const CreatorsModel = require("../models/CreatorsModel");
const CreatorProfileModel = require("../models/CreatorProfileModel");
const CreatorSocialLinkModel = require("../models/CreatorSocialLinkModel");
const WalletModel = require("../models/WalletModel");

let KycVerificationModel;
let KycDocumentModel;
let CreatorBankAccountModel;

try { KycVerificationModel = require('../models/KycVerificationModel'); } catch (e) {}
try { KycDocumentModel = require('../models/KycDocumentModel'); } catch (e) {}
try { CreatorBankAccountModel = require('../models/CreatorBankAccountModel'); } catch (e) {}

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
      fullName,
      full_name,
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

    const creatorName = (fullName || full_name || "").trim();
    const creatorEmail = (email || "").trim().toLowerCase();
    const cleanUsername = (username || "").trim().replace(/^@/, "");
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
      try { await transaction.rollback(); } catch (rErr) {}
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

    // 1. Create or Update KycVerification
    let kycRecord;
    if (KycVerificationModel) {
      const [record] = await KycVerificationModel.findOrCreate({
        where: { creator_id: targetCreatorId },
        defaults: {
          creator_id: targetCreatorId,
          full_name: applicantName,
          date_of_birth: dateOfBirth || date_of_birth || '1995-01-01',
          address: address || 'Main Broadcast Studio',
          country: country || 'India',
          state: state || 'Delhi',
          city: city || 'New Delhi',
          pincode: pincode || '110001',
          pan_number: panNum,
          status: 'pending',
          submitted_at: new Date(),
        },
        transaction,
      });

      await record.update({
        full_name: applicantName,
        date_of_birth: dateOfBirth || date_of_birth || record.date_of_birth,
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
          document_type: documentType || document_type || 'pan_card',
          document_number: documentNumber || document_number || panNum,
          file_url: fileUrl || file_url || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80',
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
            bank_name: bankName || bank_name || 'HDFC Bank',
            account_number: accountNumber || account_number || '50100239481234',
            ifsc_code: ifscCode || ifsc_code || 'HDFC0001234',
            upi_id: upiId || upi_id || 'creator@upi',
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
          documentType: documentType || document_type || 'pan_card',
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
      try { await transaction.rollback(); } catch (e) {}
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

module.exports = {
  registerCreator,
  loginCreator,
  submitKyc,
  getKycStatus,
};