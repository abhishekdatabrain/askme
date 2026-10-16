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
const { sendLoginOtpWhatsApp } = require("../../services/whatsappService");
const { generateAndStoreOtp, verifyStoredOtp } = require("../../utils/whatsappOtpStore");
const { verifyTruecallerToken } = require("../../services/truecallerService");
const { sendWelcomeEmailAsync } = require("../../services/emailService");
const { Op } = require("sequelize");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

// In-memory sliding rate limiter for trial creator demo authentication
const trialCreatorRateLimiter = new Map();
const isTrialCreatorRateLimited = (key) => {
  const now = Date.now();
  const windowMs = 5 * 60 * 1000; // 5 minute window
  const maxAttempts = 15;
  const attempts = trialCreatorRateLimiter.get(key) || [];
  const validAttempts = attempts.filter((t) => now - t < windowMs);
  if (validAttempts.length >= maxAttempts) {
    return true;
  }
  validAttempts.push(now);
  trialCreatorRateLimiter.set(key, validAttempts);
  return false;
};

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
  let rawAvatar = (profileImage || profile_image || "").trim();
  if (rawAvatar.startsWith("blob:") || rawAvatar.startsWith("data:")) {
    rawAvatar = "";
  }
  const avatarUrl = rawAvatar || null;
  const creatorCountry = country || "India";

  if (!creatorName || !creatorEmail || !password) {
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

  // if (cleanUsername.length < 3) {
  //   const err = new Error("Username must be at least 3 characters long.");
  //   err.statusCode = 400;
  //   throw err;
  // }

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

    // const existingUsername = await CreatorsModel.findOne({
    //   where: { username: cleanUsername },
    //   transaction,
    // });
    // if (existingUsername) {
    //   const err = new Error("This username is already taken.");
    //   err.statusCode = 409;
    //   throw err;
    // }

    const hashedPassword = await bcrypt.hash(password, 10);

    const creator = await CreatorsModel.create(
      {
        role: "creator",
        full_name: creatorName,
        // username: cleanUsername,
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
        bio: bio || `${category}`,
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

    // Send FCM Push Notification to active logged-in admins
    try {
      const { sendAdminNotification } = require("../../admin/services/fcmService");
      sendAdminNotification({
        title: "New Creator Registration",
        body: `${creatorName} has registered as a creator.`,
        data: {
          type: "CREATOR_REGISTERED",
          creatorId: String(creator.id),
        },
      });
    } catch (fcmErr) {
      console.warn("FCM push notification dispatch notice:", fcmErr.message);
    }

    sendWelcomeEmailAsync({
      email: creator.email,
      name: creator.full_name,
      role: "creator",
    });

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

  const cleanDigits = loginIdentifier.replace(/\D/g, "");
  const creator = await CreatorsModel.findOne({
    where: {
      [sequelize.Sequelize.Op.or]: [
        { email: loginIdentifier },
        { username: loginIdentifier },
        ...(cleanDigits.length >= 10 ? [
          { mobile: cleanDigits },
          { mobile: `91${cleanDigits.slice(-10)}` },
          { mobile: `+91${cleanDigits.slice(-10)}` },
        ] : []),
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

  if (creator.status === "blocked") {
    const err = new Error("Your creator account has been blocked by administrator. Please contact support.");
    err.statusCode = 403;
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
const googleAuthCreatorService = async ({ idToken, credential, token: bodyToken, email, name, mobile, youtubeChannel, youtubeUrl }) => {
  const incomingToken = idToken || credential || bodyToken;
  let verifiedEmail = (email || "").trim().toLowerCase();
  let verifiedName = (name || "").trim();
  let fetchedYoutubeUrl = (youtubeChannel || youtubeUrl || "").trim();

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

    // Fetch YouTube Channel info using Google OAuth Access Token
    if (!fetchedYoutubeUrl) {
      try {
        const ytRes = await fetch("https://www.googleapis.com/youtube/v3/channels?part=snippet,id&mine=true", {
          headers: { Authorization: `Bearer ${incomingToken}` },
        });
        if (ytRes.ok) {
          const ytData = await ytRes.json();
          if (ytData.items && ytData.items.length > 0) {
            const item = ytData.items[0];
            const customUrl = item.snippet?.customUrl;
            if (customUrl) {
              fetchedYoutubeUrl = `@${customUrl.replace(/^@+/, '')}`;
            } else if (item.id) {
              fetchedYoutubeUrl = `https://youtube.com/channel/${item.id}`;
            } else if (item.snippet?.title) {
              fetchedYoutubeUrl = `@${item.snippet.title.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase()}`;
            }
          }
        }
      } catch (ytErr) {
        console.warn("YouTube channel fetch note:", ytErr.message);
      }
    }
  }

  if (!verifiedEmail) {
    const err = new Error("Google authentication failed. Email address is required.");
    err.statusCode = 400;
    throw err;
  }

  if (!verifiedName) {
    verifiedName = verifiedEmail.split("@")[0];
  }

  // Fallback YouTube channel handle from verified email if not found
  // if (!fetchedYoutubeUrl) {
  //   const defaultHandle = verifiedEmail.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "").toLowerCase();
  //   fetchedYoutubeUrl = `@${defaultHandle}`;
  // }

  let isNewAccount = false;
  let creator = await CreatorsModel.findOne({ where: { email: verifiedEmail } });

  if (!creator) {
    isNewAccount = true;
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
          mobile: mobile,
          password: hashedPassword,
          country: "India",
          status: "pending",
        },
        { transaction }
      );

      await CreatorProfile.create(
        {
          creator_id: creator.id,
          display_name: verifiedName,
          bio: "",
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

      try {
        const adminNotificationService = require("../../admin/services/notificationService");
        await adminNotificationService.createNotification(
          {
            creatorId: creator.id,
            type: "creator_registration",
            title: "New Creator Registered 🚀",
            message: `New Creator ${verifiedName} (${verifiedEmail}) registered on AskMe via Google.`,
          },
          { transaction }
        );
      } catch (notifErr) {
        console.warn("Notice: Google Creator registration admin notification warning:", notifErr.message);
      }

      await transaction.commit();

      // Send FCM Push Notification to active logged-in admins
      try {
        const { sendAdminNotification } = require("../../admin/services/fcmService");
        sendAdminNotification({
          title: "New Creator Registration",
          body: `${verifiedName || creator.full_name} has registered as a creator.`,
          data: {
            type: "CREATOR_REGISTERED",
            creatorId: String(creator.id),
          },
        });
      } catch (fcmErr) {
        console.warn("FCM push notification dispatch notice:", fcmErr.message);
      }

      sendWelcomeEmailAsync({
        email: creator.email,
        name: creator.full_name,
        role: "creator",
      });
    } catch (err) {
      if (transaction && !transaction.finished) await transaction.rollback();
      throw err;
    }
  }

  // Save or update YouTube channel social link in CreatorSocialLink table
  if (fetchedYoutubeUrl && CreatorSocialLink) {
    try {
      const [linkRec, created] = await CreatorSocialLink.findOrCreate({
        where: { creator_id: creator.id, platform: "youtube" },
        defaults: { creator_id: creator.id, platform: "youtube", profile_url: fetchedYoutubeUrl },
      });
      if (!created && linkRec && fetchedYoutubeUrl) {
        await linkRec.update({ profile_url: fetchedYoutubeUrl });
      }
    } catch (socErr) {
      console.warn("Saving Google YouTube social link note:", socErr.message);
    }
  }

  const profile = await CreatorProfile.findOne({ where: { creator_id: creator.id } });
  const rawStatus = (profile?.kyc_status).toLowerCase();
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
      youtubeChannel: fetchedYoutubeUrl,
      kycStatus,
      isNewAccount,
    },
    token: jwtToken,
    isNewAccount,
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
    if (profileImage !== undefined && typeof profileImage === 'string' && !profileImage.trim().startsWith('blob:') && !profileImage.trim().startsWith('data:')) {
      updateData.profile_image = profileImage.trim();
    }
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

    if (paymentInfo && typeof paymentInfo === "object" && (paymentInfo.upiId || paymentInfo.accountNumber)) {
      const existingBank = await CreatorBankAccount.findOne({
        where: { creator_id: creatorId, status: "active" },
      });

      if (existingBank && (existingBank.upi_id || (existingBank.account_number && existingBank.account_number !== "N/A"))) {
        const isUpiChanged = paymentInfo.upiId && paymentInfo.upiId !== existingBank.upi_id;
        const isAccChanged = paymentInfo.accountNumber && paymentInfo.accountNumber !== existingBank.account_number && paymentInfo.accountNumber !== maskBankAccount(existingBank.account_number);

        if (isUpiChanged || isAccChanged) {
          const err = new Error("Account details can be filled once only. In case of changes required, please raise a ticket for support.");
          err.statusCode = 400;
          throw err;
        }
      }

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

      if (!bankRec.upi_id && (!bankRec.account_number || bankRec.account_number === "N/A")) {
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

  const existingBank = await CreatorBankAccount.findOne({
    where: { creator_id: creatorId, status: "active" },
  });
  if (existingBank && (existingBank.upi_id || (existingBank.account_number && existingBank.account_number !== "N/A"))) {
    const err = new Error("Account details can be filled once only. In case of changes required, please raise a ticket for support.");
    err.statusCode = 400;
    throw err;
  }

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

/**
 * Send WhatsApp OTP to Creator
 */
const sendWhatsAppOtpCreatorService = async (data) => {
  const { mobile, phone, type, isRegister } = data || {};
  const rawPhone = mobile || phone;
  const cleanPhone = String(rawPhone || "").replace(/[^0-9]/g, "");

  let tenDigit = cleanPhone;
  if (tenDigit.length === 12 && tenDigit.startsWith("91")) {
    tenDigit = tenDigit.slice(2);
  }

  if (!tenDigit || tenDigit.length < 10) {
    const err = new Error("Please provide a valid 10-digit mobile number.");
    err.statusCode = 400;
    throw err;
  }

  const isRegistrationFlow = type === 'register' || isRegister === true || type !== 'login';

  // Instant Trial Creator Bypass (9999999999)
  if (tenDigit === '9999999999') {
    if (process.env.ENABLE_TRIAL_LOGIN === 'false') {
      const err = new Error("Trial creator login is currently disabled in this environment.");
      err.statusCode = 403;
      throw err;
    }
    const clientIp = data.clientIp || 'trial_creator_client';
    if (isTrialCreatorRateLimited(`send_${clientIp}`)) {
      const err = new Error("Too many trial demo requests. Please wait a few minutes before trying again.");
      err.statusCode = 429;
      throw err;
    }
    return {
      message: "Trial Demo OTP sent! Use code 123456",
      expiresMinutes: 10,
      phone: `91${tenDigit}`,
      debugOtp: "123456",
      isTrial: true,
    };
  }

  // DB Validation: Only check if creator exists during LOGIN flow (skip during registration)
  if (!isRegistrationFlow) {
    const fullPhone = `91${tenDigit}`;

    const creator = await CreatorsModel.findOne({
      where: {
        [Op.or]: [
          { mobile: fullPhone },
          { mobile: tenDigit },
          { mobile: `+91${tenDigit}` },
        ],
      },
    });

    if (!creator) {
      const err = new Error("This mobile number is not registered. Please use a registered number.");
      err.statusCode = 400;
      throw err;
    }
  }

  const { cleanPhone: targetPhone, otp } = generateAndStoreOtp(tenDigit);

  await sendLoginOtpWhatsApp({
    phone: targetPhone,
    otp,
    expiresMinutes: 5,
  });

  console.log(`[WhatsApp OTP Creator] Code ${otp} sent to ${targetPhone} (Flow: ${isRegistrationFlow ? 'register' : 'login'})`);

  return {
    message: "Verification code sent to your WhatsApp number!",
    expiresMinutes: 5,
    phone: targetPhone,
    ...(process.env.NODE_ENV !== "production" ? { debugOtp: otp } : {}),
  };
};

/**
 * Send SMS OTP for Creator via BhashSMS
 */
const sendSmsOtpCreatorService = async (data) => {
  const { sendBhashSms } = require('../../services/bhashSmsService');
  const { phone, mobile, type, isRegister } = data || {};
  const rawPhone = phone || mobile;
  const cleanPhone = String(rawPhone || "").replace(/[^0-9]/g, "");

  if (!cleanPhone) {
    const err = new Error("Mobile number is required.");
    err.statusCode = 400;
    throw err;
  }

  let targetPhone = cleanPhone;
  if (targetPhone.length === 12 && targetPhone.startsWith("91")) {
    targetPhone = targetPhone.slice(2);
  }
  const tenDigit = targetPhone.slice(-10);

  if (tenDigit.length !== 10) {
    const err = new Error("Please provide a valid 10-digit mobile number.");
    err.statusCode = 400;
    throw err;
  }

  const isRegistrationFlow = type === 'register' || isRegister === true || type !== 'login';

  // if (!isRegistrationFlow) {
  //   const fullPhone = `91${tenDigit}`;
  //   const creator = await CreatorsModel.findOne({
  //     where: {
  //       [Op.or]: [
  //         { mobile: fullPhone },
  //         { mobile: tenDigit },
  //         { mobile: `+91${tenDigit}` },
  //       ],
  //     },
  //   });

  //   if (!creator) {
  //     const err = new Error("This mobile number is not registered. Please use a registered number.");
  //     err.statusCode = 400;
  //     throw err;
  //   }
  // }

  // Instant Trial Creator Bypass (9999999999)
  if (tenDigit === '9999999999') {
    if (process.env.ENABLE_TRIAL_LOGIN === 'false') {
      const err = new Error("Trial creator login is currently disabled in this environment.");
      err.statusCode = 403;
      throw err;
    }
    const clientIp = data.clientIp || 'trial_creator_client';
    if (isTrialCreatorRateLimited(`send_${clientIp}`)) {
      const err = new Error("Too many trial demo requests. Please wait a few minutes before trying again.");
      err.statusCode = 429;
      throw err;
    }
    return {
      message: "Trial Demo OTP sent! Use code 123456",
      expiresMinutes: 10,
      phone: `91${tenDigit}`,
      debugOtp: "123456",
      isTrial: true,
    };
  }

  const { cleanPhone: finalPhone, otp } = generateAndStoreOtp(tenDigit);

  await sendBhashSms({
    phone: finalPhone,
    otp,
  });

  console.log(`[SMS OTP Creator] Code ${otp} sent to ${finalPhone} via BhashSMS (Flow: ${isRegistrationFlow ? 'register' : 'login'})`);

  return {
    message: "Verification code sent via SMS to your mobile number!",
    expiresMinutes: 5,
    phone: finalPhone,
    ...(process.env.NODE_ENV !== "production" ? { debugOtp: otp } : {}),
  };
};


/**
 * Verify WhatsApp OTP and Login / Register Creator
 */
const verifyWhatsAppOtpCreatorService = async (data) => {
  const { mobile, phone, otp, type, isRegister, trialSessionId, clientIp } = data || {};
  const rawPhone = mobile || phone;
  const cleanPhone = String(rawPhone || "").replace(/[^0-9]/g, "");

  if (!cleanPhone || !otp) {
    const err = new Error("Mobile number and 6-digit OTP code are required.");
    err.statusCode = 400;
    throw err;
  }

  let targetPhone = cleanPhone;
  if (targetPhone.length === 12 && targetPhone.startsWith("91")) {
    targetPhone = targetPhone.slice(2);
  }
  const tenDigit = targetPhone.slice(-10);

  // --- TRIAL CREATOR DEMO FLOW (9999999999) ---
  if (tenDigit === '9999999999') {
    if (process.env.ENABLE_TRIAL_LOGIN === 'false') {
      const err = new Error("Trial creator login is currently disabled in this environment.");
      err.statusCode = 403;
      throw err;
    }

    const ip = clientIp || 'trial_creator_client';
    if (isTrialCreatorRateLimited(`verify_${ip}`)) {
      const err = new Error("Too many trial authentication attempts. Please wait a few minutes before trying again.");
      err.statusCode = 429;
      throw err;
    }

    // Strict validation of demo OTP 123456
    if (String(otp).trim() !== '123456') {
      isTrialCreatorRateLimited(`verify_fail_${ip}`);
      const err = new Error("Invalid trial demo OTP. Please enter 123456 to continue.");
      err.statusCode = 400;
      throw err;
    }

    // Check whether current trial identity already has a completed profile
    const clientTrialSessionId = trialSessionId || null;
    let existingTrialCreator = null;

    if (clientTrialSessionId) {
      existingTrialCreator = await CreatorsModel.findOne({
        where: {
          trial_session_id: clientTrialSessionId,
          is_trial: true,
        },
      });
    }

    if (existingTrialCreator) {
      // Check trial account expiration support
      if (existingTrialCreator.trial_expires_at && new Date(existingTrialCreator.trial_expires_at) < new Date()) {
        const err = new Error("Your trial creator account has expired. Please register a regular account or contact support.");
        err.statusCode = 403;
        err.code = "TRIAL_EXPIRED";
        throw err;
      }

      // 6. If the same trial identity logs in again, skip the modal and return session
      if (existingTrialCreator.trial_completed && existingTrialCreator.full_name && existingTrialCreator.email) {
        const token = generateToken(existingTrialCreator.id, "creator");
        const profile = await CreatorProfile.findOne({ where: { creator_id: existingTrialCreator.id } });
        return {
          isTrial: true,
          profileCompleted: true,
          token,
          creator: {
            id: existingTrialCreator.id,
            role: "creator",
            fullName: existingTrialCreator.full_name,
            full_name: existingTrialCreator.full_name,
            username: existingTrialCreator.username,
            cleanUsername: existingTrialCreator.username,
            email: existingTrialCreator.email,
            mobile: existingTrialCreator.mobile,
            kycStatus: profile?.kyc_status || "approved",
            status: existingTrialCreator.status || "active",
            is_trial: true,
            account_type: "trial",
            trial_expires_at: existingTrialCreator.trial_expires_at,
            trial_completed: true,
          },
          trialSessionId: existingTrialCreator.trial_session_id,
        };
      }
    }

    // Incomplete profile or new trial creator: Generate unique trial session ID & temporary token
    const newTrialSessionId = clientTrialSessionId || ('trial_creator_sess_' + crypto.randomBytes(16).toString('hex'));
    const trialTempToken = jwt.sign(
      { trialSessionId: newTrialSessionId, isTrial: true, role: 'creator', purpose: 'trial_creator_profile_completion' },
      process.env.JWT_SECRET || 'ask_me_super_secret_jwt_key_2026',
      { expiresIn: '2h' }
    );

    return {
      message: "Trial demo OTP verified. Mandatory profile completion required.",
      isTrial: true,
      profileCompleted: false,
      trialSessionId: newTrialSessionId,
      trialTempToken,
    };
  }
  // --- END TRIAL CREATOR DEMO FLOW (Normal flow below remains 100% UNCHANGED) ---

  const verification = verifyStoredOtp(cleanPhone, otp);
  if (!verification.valid) {
    const err = new Error(verification.message);
    err.statusCode = 400;
    throw err;
  }

  const isRegistrationFlow = type === 'register' || isRegister === true || type !== 'login';

  if (isRegistrationFlow) {
    return {
      message: "Mobile number verified via WhatsApp!",
    };
  }

  const fullPhone = `91${tenDigit}`;

  let creator = await CreatorsModel.findOne({
    where: {
      [Op.or]: [
        { mobile: fullPhone },
        { mobile: tenDigit },
        { mobile: `+91${tenDigit}` },
      ],
    },
  });

  if (!creator) {
    const err = new Error("This mobile number is not registered. Please use a registered number.");
    err.statusCode = 400;
    throw err;
  }

  const token = generateToken(creator.id, "creator");
  const profile = await CreatorProfile.findOne({ where: { creator_id: creator.id } });

  const kycStatus = profile?.kyc_status || "pending";
  const status = creator.status;

  return {
    token,
    creator: {
      id: creator.id,
      role: creator.role || "creator",
      fullName: creator.full_name,
      full_name: creator.full_name,
      username: creator.username,
      cleanUsername: creator.username,
      email: creator.email,
      mobile: creator.mobile,
      kycStatus,
      status,
    },
  };
};

/**
 * Complete Trial Creator Profile Registration
 */
const completeTrialProfileCreatorService = async (data, clientIp = 'trial_creator_client') => {
  const { fullName, email, phone, trialSessionId, trialTempToken } = data || {};

  if (process.env.ENABLE_TRIAL_LOGIN === 'false') {
    const err = new Error("Trial creator registration is currently disabled in this environment.");
    err.statusCode = 403;
    throw err;
  }

  if (isTrialCreatorRateLimited(`complete_${clientIp}`)) {
    const err = new Error("Too many trial profile attempts. Please wait a few minutes before trying again.");
    err.statusCode = 429;
    throw err;
  }

  // 1. Validate all required fields
  const cleanName = String(fullName || "").trim();
  const cleanEmail = String(email || "").trim().toLowerCase();
  const rawPhone = String(phone || "").replace(/[^0-9]/g, "");

  if (!cleanName || cleanName.length < 2) {
    const err = new Error("Full Name is required and must be at least 2 characters.");
    err.statusCode = 400;
    throw err;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!cleanEmail || !emailRegex.test(cleanEmail)) {
    const err = new Error("Please provide a valid Email Address.");
    err.statusCode = 400;
    throw err;
  }

  const tenDigitPhone = rawPhone.slice(-10);
  if (!tenDigitPhone || tenDigitPhone.length !== 10) {
    const err = new Error("Please provide a valid 10-digit mobile phone number.");
    err.statusCode = 400;
    throw err;
  }

  // Requirement 4: never use the shared trial phone number as the unique identity
  if (tenDigitPhone === '9999999999') {
    const err = new Error("Please provide your personal phone number, not the shared trial demo number.");
    err.statusCode = 400;
    throw err;
  }

  // Verify trialTempToken if provided
  let effectiveSessionId = trialSessionId;
  if (trialTempToken) {
    try {
      const decoded = jwt.verify(
        trialTempToken,
        process.env.JWT_SECRET || 'ask_me_super_secret_jwt_key_2026'
      );
      if (decoded.trialSessionId) {
        effectiveSessionId = decoded.trialSessionId;
      }
    } catch (tokenErr) {
      const err = new Error("Invalid or expired trial temporary token. Please verify OTP again.");
      err.statusCode = 401;
      throw err;
    }
  }

  if (!effectiveSessionId) {
    const err = new Error("Missing trial session identity. Please restart trial verification.");
    err.statusCode = 400;
    throw err;
  }

  // Check if a real creator account already exists with this email or phone
  const existingRealCreator = await CreatorsModel.findOne({
    where: {
      [Op.or]: [
        { email: cleanEmail },
        { mobile: tenDigitPhone },
        { mobile: `91${tenDigitPhone}` },
        { mobile: `+91${tenDigitPhone}` },
      ],
      is_trial: false,
    },
  });

  if (existingRealCreator) {
    const err = new Error("An active registered creator account already exists with this email or phone number. Please log in normally.");
    err.statusCode = 409;
    throw err;
  }

  // Find if a trial creator already exists for this session or email
  let trialCreator = await CreatorsModel.findOne({
    where: {
      [Op.or]: [
        { trial_session_id: effectiveSessionId },
        { email: cleanEmail, is_trial: true },
      ],
    },
  });

  if (trialCreator) {
    // Check if expired
    if (trialCreator.trial_expires_at && new Date(trialCreator.trial_expires_at) < new Date()) {
      const err = new Error("Your trial creator account has expired. Please register a regular account or contact support.");
      err.statusCode = 403;
      err.code = "TRIAL_EXPIRED";
      throw err;
    }

    trialCreator.full_name = cleanName;
    trialCreator.email = cleanEmail;
    trialCreator.mobile = tenDigitPhone;
    trialCreator.is_trial = true;
    trialCreator.account_type = "trial";
    trialCreator.trial_session_id = effectiveSessionId;
    trialCreator.trial_completed = true;
    if (!trialCreator.trial_expires_at) {
      trialCreator.trial_expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }
    await trialCreator.save();

    // Ensure CreatorProfile exists
    let profile = await CreatorProfile.findOne({ where: { creator_id: trialCreator.id } });
    if (!profile) {
      profile = await CreatorProfile.create({
        creator_id: trialCreator.id,
        bio: 'Trial Creator Account',
        display_name: cleanName,
        kyc_status: 'approved',
        is_payment_enabled: true,
      });
    } else {
      await profile.update({ display_name: cleanName, kyc_status: 'approved' });
    }

    // Ensure Wallet exists
    let wallet = await Wallet.findOne({ where: { creator_id: trialCreator.id } });
    if (!wallet) {
      await Wallet.create({
        creator_id: trialCreator.id,
        balance: 0.0,
        currency: 'INR',
      });
    }
  } else {
    // Create new trial creator
    const uniqueUsername = `trial_cr_${Math.random().toString(36).substring(2, 7)}_${Date.now().toString(36)}`;
    const randomPassword = 'TrialPass_' + crypto.randomBytes(8).toString('hex');
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    const transaction = await sequelize.transaction();
    try {
      trialCreator = await CreatorsModel.create(
        {
          role: "creator",
          full_name: cleanName,
          username: uniqueUsername,
          email: cleanEmail,
          mobile: tenDigitPhone,
          password: hashedPassword,
          country: "India",
          status: "active",
          is_trial: true,
          account_type: "trial",
          trial_session_id: effectiveSessionId,
          trial_completed: true,
          trial_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
        { transaction }
      );

      await CreatorProfile.create(
        {
          creator_id: trialCreator.id,
          bio: 'Trial Creator Account',
          display_name: cleanName,
          kyc_status: 'approved',
          is_payment_enabled: true,
        },
        { transaction }
      );

      await Wallet.create(
        {
          creator_id: trialCreator.id,
          balance: 0.0,
          currency: 'INR',
        },
        { transaction }
      );

      await transaction.commit();
    } catch (createErr) {
      await transaction.rollback();
      throw createErr;
    }
  }

  const token = generateToken(trialCreator.id, "creator");

  return {
    token,
    creator: {
      id: trialCreator.id,
      role: "creator",
      fullName: trialCreator.full_name,
      full_name: trialCreator.full_name,
      username: trialCreator.username,
      cleanUsername: trialCreator.username,
      email: trialCreator.email,
      mobile: trialCreator.mobile,
      kycStatus: "approved",
      status: trialCreator.status || "active",
      is_trial: true,
      account_type: "trial",
      trial_expires_at: trialCreator.trial_expires_at,
      trial_completed: true,
    },
    trialSessionId: trialCreator.trial_session_id,
  };
};

/**
 * Truecaller 1-Tap Auth for Creator
 */
const truecallerAuthCreatorService = async (data) => {
  const { phone, name, email, payload, signature, accessToken } = data || {};

  const verification = await verifyTruecallerToken({
    phone,
    name,
    email,
    payload,
    signature,
    accessToken,
  });

  if (!verification.success || !verification.phone) {
    const err = new Error(verification.reason || "Truecaller authentication verification failed.");
    err.statusCode = 400;
    throw err;
  }

  const cleanPhone = verification.phone;
  const tenDigit = cleanPhone.slice(-10);
  const displayName = verification.name || `Creator ${tenDigit.slice(-4)}`;
  const creatorEmail = verification.email || `${cleanPhone}@truecaller.creator`;

  let creator = await CreatorsModel.findOne({
    where: {
      [Op.or]: [
        { mobile: cleanPhone },
        { mobile: tenDigit },
        { email: creatorEmail },
        { email: `${cleanPhone}@truecaller.creator` },
        { email: `${tenDigit}@truecaller.creator` },
      ],
    },
  });

  if (!creator) {
    const transaction = await sequelize.transaction();
    try {
      const cleanUsername = `creator_${tenDigit.slice(-6)}_${Math.floor(100 + Math.random() * 900)}`;
      const hashedPassword = await bcrypt.hash(`tc_${Date.now()}_${Math.random()}`, 10);

      creator = await CreatorsModel.create(
        {
          role: "creator",
          full_name: displayName,
          username: cleanUsername,
          email: creatorEmail,
          mobile: cleanPhone,
          password: hashedPassword,
          status: "active",
        },
        { transaction }
      );

      await CreatorProfile.create(
        { creator_id: creator.id, display_name: displayName },
        { transaction }
      );

      await Wallet.create(
        { creator_id: creator.id, balance: 0.0, currency: "INR" },
        { transaction }
      );

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

  const token = generateToken(creator.id, "creator");
  return {
    token,
    creator: {
      id: creator.id,
      full_name: creator.full_name,
      username: creator.username,
      email: creator.email,
      mobile: creator.mobile,
      role: creator.role,
      kycStatus: creator.kycStatus || 'pending',
    },
  };
};

/**
 * Delete Creator Account Service
 */
const deleteCreatorAccountService = async (creatorId) => {
  const creator = await CreatorsModel.findByPk(creatorId);
  if (!creator) {
    const err = new Error("Creator account not found.");
    err.statusCode = 404;
    throw err;
  }

  try {
    await creator.update({ status: 'deleted' });
  } catch (err) {
    console.warn("Could not update creator status to deleted:", err.message);
  }

  await creator.destroy();

  return {
    message: "Creator account deleted successfully.",
  };
};

module.exports = {
  registerCreatorService,
  loginCreatorService,
  googleAuthCreatorService,
  sendWhatsAppOtpCreatorService,
  sendSmsOtpCreatorService,
  verifyWhatsAppOtpCreatorService,
  truecallerAuthCreatorService,
  getCreatorProfileService,
  updateCreatorProfileService,
  getCreatorBankAccountService,
  saveCreatorBankAccountService,
  verifyCreatorUpiService,
  deleteCreatorAccountService,
  completeTrialProfileCreatorService,
};


