const bcrypt = require("bcryptjs");
const { OAuth2Client } = require("google-auth-library");
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const generateToken = require("../../utils/generateToken");
const sequelize = require("../../config/database");
const models = require("../../models");
const CreatorsModel = models.CreatorsModel || models.Creator || require("../../models/CreatorsModel");
const CreatorProfile = models.CreatorProfile || require("../../models/CreatorProfileModel");
const CreatorSocialLink = models.CreatorSocialLink || require("../../models/CreatorSocialLinkModel");
const CreatorBankAccount = models.CreatorBankAccount || require("../../models/CreatorBankAccountModel");
const Wallet = models.Wallet || require("../../models/WalletModel");
const Notification = models.Notification || require("../../models/NotificationModel");
const { validateEmail, validatePassword, validateIFSC, validateUPI } = require("../validators/creatorValidator");
const { maskBankAccount } = require("../../utils/maskSensitiveData");
const { getIO } = require("../../config/socket");

/**
 * Register a new Creator with atomic transaction
 */
const registerCreatorService = async (data) => {
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
  } = data;

  const fullName = `${firstname || ''} ${lastname || ''}`.trim() || data.fullName || data.full_name;
  const creatorName = (fullName || "").trim();
  const creatorEmail = (email || "").trim().toLowerCase();
  const cleanUsername = (username || "").trim().replace(/^@+/, "");
  const creatorMobile = mobileNumber || mobile || null;
  const avatarUrl = profileImage || profile_image || null;
  const creatorCountry = country || "India";

  if (!creatorName || !cleanUsername || !creatorEmail || !password) {
    const err = new Error("Full name, username, email, and password are required.");
    err.statusCode = 400;
    throw err;
  }

  const passValidation = validatePassword(password);
  if (!passValidation.valid) {
    const err = new Error(passValidation.message);
    err.statusCode = 400;
    throw err;
  }

  if (!validateEmail(creatorEmail)) {
    const err = new Error("Please enter a valid email address format (e.g. user@domain.com).");
    err.statusCode = 400;
    throw err;
  }

  if (cleanUsername.length < 3) {
    const err = new Error("Username must be at least 3 characters long.");
    err.statusCode = 400;
    throw err;
  }

  const transaction = await sequelize.transaction();

  try {
    const existingEmail = await CreatorsModel.findOne({
      where: { email: creatorEmail },
      transaction,
    });
    if (existingEmail) {
      const err = new Error("A creator account with this email already exists.");
      err.statusCode = 409;
      throw err;
    }

    const existingUsername = await CreatorsModel.findOne({
      where: { username: cleanUsername },
      transaction,
    });
    if (existingUsername) {
      const err = new Error("This username is already taken.");
      err.statusCode = 409;
      throw err;
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

    await CreatorProfile.create(
      {
        creator_id: creator.id,
        display_name: creatorName,
        bio: bio || `${category || ""} Creator`,
        kyc_status: "not_submitted",
        is_payment_enabled: false,
      },
      { transaction }
    );

    if (Array.isArray(socialLinks)) {
      for (const item of socialLinks) {
        if (!item) continue;
        let platform = null;
        let profileUrl = null;
        if (typeof item === "object") {
          platform = item.platform || item.platform_name || null;
          profileUrl = item.link || item.profile_url || item.profileUrl || item.url || null;
        } else if (typeof item === "string") {
          platform = "youtube";
          profileUrl = item;
        }
        platform = platform ? String(platform).trim().toLowerCase() : null;
        profileUrl = profileUrl ? String(profileUrl).trim() : null;
        if (platform && profileUrl) {
          await CreatorSocialLink.create(
            {
              creator_id: creator.id,
              platform,
              profile_url: profileUrl,
            },
            { transaction }
          );
        }
      }
    }

    await Wallet.create(
      {
        creator_id: creator.id,
        total_earnings: 0,
        available_balance: 0,
        pending_balance: 0,
        withdrawn_amount: 0,
      },
      { transaction }
    );

    try {
      const User = models.User || require("../../models/userModel");
      let validUserId = null;
      const defaultUser = await User.findOne({ order: [["id", "ASC"]] }, { transaction });
      if (defaultUser) {
        validUserId = defaultUser.id;
      }

      const adminNotificationService = require("../../admin/services/notificationService");
      await adminNotificationService.createNotification(
        {
          creatorId: creator.id,
          userId: validUserId,
          type: "creator_registration",
          title: "New Creator Registered",
          message: `New Creator ${creatorName} (@${cleanUsername}) registered on AskMe.`,
        },
        { transaction }
      );
    } catch (notifErr) {
      console.warn("Notice: Creator registration notification insertion warning:", notifErr.message);
    }

    await transaction.commit();

    const token = generateToken(creator.id, "creator");

    return {
      creator: {
        id: creator.id,
        fullName: creator.full_name,
        username: `@${creator.username}`,
        email: creator.email,
        mobile: creator.mobile,
        country: creator.country,
        status: creator.status,
        kycStatus: "not_submitted",
      },
      token,
    };
  } catch (error) {
    if (transaction && !transaction.finished) {
      await transaction.rollback();
    }
    throw error;
  }
};

/**
 * Creator Login Service
 */
const loginCreatorService = async ({ email, username, password }) => {
  const loginIdentifier = (email || username || "").trim().toLowerCase().replace(/^@/, "");

  if (!loginIdentifier || !password) {
    const err = new Error("Please provide email/username and password.");
    err.statusCode = 400;
    throw err;
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
    const err = new Error("Invalid creator email/username or password.");
    err.statusCode = 401;
    throw err;
  }

  const isMatch = await bcrypt.compare(password, creator.password);
  if (!isMatch) {
    const err = new Error("Invalid creator email/username or password.");
    err.statusCode = 401;
    throw err;
  }

  const profile = await CreatorProfile.findOne({ where: { creator_id: creator.id } });
  const rawStatus = (profile?.kyc_status || "not_submitted").toLowerCase();
  const kycStatus = rawStatus === "approved" ? "approved" : rawStatus === "rejected" ? "rejected" : rawStatus === "pending" ? "pending" : "not_submitted";

  const token = generateToken(creator.id, "creator");

  return {
    creator: {
      id: creator.id,
      fullName: creator.full_name,
      username: `@${creator.username}`,
      email: creator.email,
      mobile: creator.mobile,
      country: creator.country,
      role: "creator",
      status: creator.status,
      kycStatus,
    },
    token,
  };
};

/**
 * Google Auth Creator Service (with Google ID Token Verification)
 */
const googleAuthCreatorService = async ({ idToken, credential, token: bodyToken, email, name }) => {
  const incomingToken = idToken || credential || bodyToken;
  let verifiedEmail = (email || "").trim().toLowerCase();
  let verifiedName = (name || "").trim();

  if (incomingToken) {
    if (process.env.GOOGLE_CLIENT_ID) {
      try {
        const ticket = await googleClient.verifyIdToken({
          idToken: incomingToken,
          audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (payload) {
          verifiedEmail = (payload.email || verifiedEmail).toLowerCase();
          verifiedName = payload.name || verifiedName;
        }
      } catch (tokenErr) {
        console.warn("Google ID Token verification note:", tokenErr.message);
      }
    }

    // If ID Token verification didn't yield an email (e.g. incomingToken is an OAuth access token),
    // query Google's UserInfo API endpoint directly using the incoming access token
    if (!verifiedEmail) {
      try {
        const userinfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${incomingToken}` },
        });
        if (userinfoRes.ok) {
          const googleProfile = await userinfoRes.json();
          if (googleProfile.email) {
            verifiedEmail = googleProfile.email.toLowerCase();
          }
          if (googleProfile.name) {
            verifiedName = googleProfile.name;
          }
        }
      } catch (userinfoErr) {
        console.warn("Google UserInfo API fetch note:", userinfoErr.message);
      }
    }
  }

  if (!verifiedEmail) {
    const err = new Error("Google authentication failed. Email address is required.");
    err.statusCode = 400;
    throw err;
  }

  if (!verifiedName) {
    verifiedName = verifiedEmail.split("@")[0] || "Google Creator";
  }

  let creator = await CreatorsModel.findOne({ where: { email: verifiedEmail } });

  if (!creator) {
    const transaction = await sequelize.transaction();
    try {
      const baseUsername = verifiedEmail.split("@")[0].replace(/[^a-zA-Z0-9]/g, "").toLowerCase() || "creator";
      let cleanUsername = baseUsername;
      let counter = 1;
      while (await CreatorsModel.findOne({ where: { username: cleanUsername }, transaction })) {
        cleanUsername = `${baseUsername}${counter}`;
        counter++;
      }

      const randomPassword = "G_" + Math.random().toString(36).slice(-8) + "!" + Date.now();
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      creator = await CreatorsModel.create(
        {
          role: "creator",
          full_name: verifiedName,
          username: cleanUsername,
          email: verifiedEmail,
          password: hashedPassword,
          country: "India",
          status: "active",
        },
        { transaction }
      );

      await CreatorProfile.create(
        {
          creator_id: creator.id,
          display_name: verifiedName,
          bio: "Tech & Media Creator",
          kyc_status: "not_submitted",
          is_payment_enabled: false,
        },
        { transaction }
      );

      await Wallet.create(
        {
          creator_id: creator.id,
          total_earnings: 0,
          available_balance: 0,
          pending_balance: 0,
          withdrawn_amount: 0,
        },
        { transaction }
      );

      await transaction.commit();
    } catch (err) {
      if (transaction && !transaction.finished) await transaction.rollback();
      throw err;
    }
  }

  const profile = await CreatorProfile.findOne({ where: { creator_id: creator.id } });
  const rawStatus = (profile?.kyc_status || "not_submitted").toLowerCase();
  const kycStatus = rawStatus === "approved" ? "approved" : rawStatus === "rejected" ? "rejected" : rawStatus === "pending" ? "pending" : "not_submitted";

  const jwtToken = generateToken(creator.id, "creator");

  return {
    creator: {
      id: creator.id,
      fullName: creator.full_name,
      username: `@${creator.username}`,
      email: creator.email,
      mobile: creator.mobile,
      country: creator.country,
      role: "creator",
      status: creator.status,
      kycStatus,
    },
    token: jwtToken,
  };
};

/**
 * Get Creator Profile Service
 */
const getCreatorProfileService = async (creatorId) => {
  if (!creatorId) {
    const err = new Error("Creator ID is required.");
    err.statusCode = 400;
    throw err;
  }

  const [creator, profile, socialLinks, bankAccount] = await Promise.all([
    CreatorsModel.findByPk(creatorId, {
      attributes: ["id", "full_name", "username", "email", "mobile", "country", "profile_image", "status"],
    }),
    CreatorProfile.findOne({ where: { creator_id: creatorId } }),
    CreatorSocialLink.findAll({ where: { creator_id: creatorId }, raw: true }),
    CreatorBankAccount.findOne({ where: { creator_id: creatorId }, raw: true }),
  ]);

  if (!creator) {
    const err = new Error("Creator not found");
    err.statusCode = 404;
    throw err;
  }

  const maskedBank = bankAccount
    ? {
      ...bankAccount,
      account_number: maskBankAccount(bankAccount.account_number),
    }
    : null;

  return {
    creator,
    bankAccount: maskedBank,
    socialLinks,
    profile,
  };
};

/**
 * Update Creator Profile Service
 */
const updateCreatorProfileService = async (creatorId, data) => {
  if (!creatorId) {
    const err = new Error("Creator ID is required.");
    err.statusCode = 400;
    throw err;
  }

  const creator = await CreatorsModel.findByPk(creatorId);
  if (!creator) {
    const err = new Error("Creator not found");
    err.statusCode = 404;
    throw err;
  }

  const { fullName, profileImage, bio, country, streamingChannels, socialLinks, paymentInfo } = data;

  if (paymentInfo?.ifscCode && !validateIFSC(paymentInfo.ifscCode)) {
    const err = new Error("Invalid IFSC Code format. IFSC must be 11 characters starting with 4 letters, 5th character 0, followed by 6 alphanumeric characters.");
    err.statusCode = 400;
    throw err;
  }

  const transaction = await sequelize.transaction();
  try {
    const updateData = {};
    if (fullName) updateData.full_name = fullName;
    if (profileImage !== undefined) updateData.profile_image = profileImage;
    if (country) updateData.country = country;

    if (Object.keys(updateData).length > 0) {
      await creator.update(updateData, { transaction });
    }

    const [profileRec] = await CreatorProfile.findOrCreate({
      where: { creator_id: creatorId },
      defaults: { creator_id: creatorId },
      transaction,
    });
    await profileRec.update(
      {
        bio: bio !== undefined ? bio : profileRec.bio,
        streaming_platform: streamingChannels?.platform || profileRec.streaming_platform || "YouTube Live",
        stream_url: streamingChannels?.streamUrl !== undefined ? streamingChannels.streamUrl : profileRec.stream_url,
        channel_handle: streamingChannels?.channelHandle !== undefined ? streamingChannels.channelHandle : profileRec.channel_handle,
      },
      { transaction }
    );

    if (socialLinks && typeof socialLinks === "object") {
      for (const [platform, url] of Object.entries(socialLinks)) {
        if (!url) continue;
        const [linkRec] = await CreatorSocialLink.findOrCreate({
          where: { creator_id: creatorId, platform: platform.toLowerCase() },
          defaults: { creator_id: creatorId, platform: platform.toLowerCase(), profile_url: url },
          transaction,
        });
        await linkRec.update({ profile_url: url }, { transaction });
      }
    }

    if (paymentInfo && typeof paymentInfo === "object") {
      const [bankRec] = await CreatorBankAccount.findOrCreate({
        where: { creator_id: creatorId },
        defaults: {
          creator_id: creatorId,
          account_holder_name: paymentInfo.accountHolderName || fullName || creator.full_name || "Creator",
          account_number: paymentInfo.accountNumber || "N/A",
          bank_name: paymentInfo.bankName || "",
          ifsc_code: paymentInfo.ifscCode ? String(paymentInfo.ifscCode).toUpperCase() : "",
          upi_id: paymentInfo.upiId || "",
          account_type: paymentInfo.upiId ? "upi" : "bank",
          status: "active",
        },
        transaction,
      });
      await bankRec.update(
        {
          upi_id: paymentInfo.upiId !== undefined ? paymentInfo.upiId : bankRec.upi_id,
          bank_name: paymentInfo.bankName !== undefined ? paymentInfo.bankName : bankRec.bank_name,
          account_number: paymentInfo.accountNumber !== undefined ? paymentInfo.accountNumber : bankRec.account_number,
          ifsc_code: paymentInfo.ifscCode !== undefined ? String(paymentInfo.ifscCode).toUpperCase() : bankRec.ifsc_code,
          account_holder_name: paymentInfo.accountHolderName || fullName || creator.full_name,
        },
        { transaction }
      );
    }

    await transaction.commit();

    return {
      id: creator.id,
      fullName: creator.full_name,
      username: `@${creator.username}`,
      email: creator.email,
      profileImage: creator.profile_image,
      country: creator.country,
      bio: bio || "",
      streamingChannels: streamingChannels || {},
      socialLinks: socialLinks || {},
      paymentInfo: paymentInfo || {},
    };
  } catch (err) {
    if (transaction && !transaction.finished) await transaction.rollback();
    throw err;
  }
};

/**
 * Get Creator Bank Account Details
 */
const getCreatorBankAccountService = async (creatorId) => {
  if (!creatorId) {
    const err = new Error("Creator ID is required.");
    err.statusCode = 400;
    throw err;
  }

  const bankAccount = await CreatorBankAccount.findOne({
    where: { creator_id: creatorId, status: "active" },
    order: [["id", "DESC"]],
  });

  const maskedBank = bankAccount
    ? {
      id: bankAccount.id,
      creatorId: bankAccount.creator_id,
      accountHolderName: bankAccount.account_holder_name,
      bankName: bankAccount.bank_name,
      accountNumber: maskBankAccount(bankAccount.account_number),
      ifscCode: bankAccount.ifsc_code,
      upiId: bankAccount.upi_id,
      accountType: bankAccount.account_type,
      isVerified: bankAccount.is_verified,
    }
    : null;

  return maskedBank;
};

/**
 * Save Creator Bank Account Service
 */
const saveCreatorBankAccountService = async (creatorId, data) => {
  if (!creatorId) {
    const err = new Error("Creator ID is required.");
    err.statusCode = 400;
    throw err;
  }

  const { accountHolderName, bankName, accountNumber, ifscCode, upiId, accountType } = data;

  if (!accountHolderName || (!accountNumber && !upiId)) {
    const err = new Error("Please provide Account Holder Name and Bank Account Number or UPI ID.");
    err.statusCode = 400;
    throw err;
  }

  if (ifscCode && !validateIFSC(ifscCode)) {
    const err = new Error("Invalid IFSC Code format. IFSC must be 11 characters starting with 4 letters, 5th character 0, followed by 6 alphanumeric characters.");
    err.statusCode = 400;
    throw err;
  }

  if (upiId) {
    const upiCheck = validateUPI(upiId);
    if (!upiCheck.valid) {
      const err = new Error(upiCheck.message);
      err.statusCode = 400;
      throw err;
    }
  }

  const bankRecord = await CreatorBankAccount.create({
    creator_id: creatorId,
    account_holder_name: accountHolderName,
    bank_name: bankName || "Bank",
    account_number: accountNumber || "N/A",
    ifsc_code: ifscCode ? String(ifscCode).toUpperCase() : "",
    upi_id: upiId || "",
    account_type: accountType || (upiId ? "upi" : "bank"),
    is_primary: true,
    is_verified: true,
    status: "active",
  });

  return {
    id: bankRecord.id,
    creatorId: bankRecord.creator_id,
    accountHolderName: bankRecord.account_holder_name,
    bankName: bankRecord.bank_name,
    accountNumber: maskBankAccount(bankRecord.account_number),
    ifscCode: bankRecord.ifsc_code,
    upiId: bankRecord.upi_id,
  };
};

/**
 * Verify Creator UPI Service
 */
const verifyCreatorUpiService = async (creatorId, upiId) => {
  const upiCheck = validateUPI(upiId);
  if (!upiCheck.valid) {
    const err = new Error(upiCheck.message);
    err.statusCode = 400;
    throw err;
  }

  const cleanUpi = upiCheck.cleanUpi;

  if (creatorId) {
    const existing = await CreatorBankAccount.findOne({
      where: {
        upi_id: cleanUpi,
        creator_id: { [sequelize.Sequelize.Op.ne]: creatorId },
      },
    });
    if (existing) {
      const err = new Error("This UPI ID is already added. Please use another UPI ID.");
      err.statusCode = 409;
      throw err;
    }
  }

  return {
    upiId: cleanUpi,
    verified: true,
  };
};

module.exports = {
  registerCreatorService,
  loginCreatorService,
  googleAuthCreatorService,
  getCreatorProfileService,
  updateCreatorProfileService,
  getCreatorBankAccountService,
  saveCreatorBankAccountService,
  verifyCreatorUpiService,
};
