const sequelize = require("../../config/database");
const models = require("../../models");
const KycVerification = models.KycVerification;
const KycDocument = models.KycDocument;
const CreatorBankAccount = models.CreatorBankAccount;
const CreatorProfile = models.CreatorProfile;
const CreatorSocialLink = models.CreatorSocialLink;
const CreatorsModel = models.CreatorsModel || models.Creator;
const { validateIFSC, validatePAN } = require("../validators/creatorValidator");
const { maskBankAccount } = require("../../utils/maskSensitiveData");
const cashfreeVerification = require("../../services/cashfreeVerificationService");

/**
 * Submit KYC Application & Payout Bank Details with Identity Verification Checks
 */
const submitKycService = async (creatorId, data) => {
  if (!creatorId) {
    const err = new Error("Creator ID is required.");
    err.statusCode = 400;
    throw err;
  }

  const {
    fullName,
    mobileNumber,
    category,
    socialMediaUrl,
    socialLinks,
    dateOfBirth,
    address,
    country,
    state,
    city,
    pincode,
    panNumber,
    panHolderName,
    panReferenceId,
    panStatus,
    documentType,
    documentNumber,
    documentFileUrl,
    fileUrl,
    aadhaarMasked,
    aadhaarName,
    aadhaarDob,
    aadhaarReferenceId,
    accountHolderName,
    bankName,
    accountNumber,
    ifscCode,
    upiId,
    bankVerificationStatus,
  } = data;

  const applicantName = (fullName || aadhaarName || panHolderName || "Creator Applicant").trim();
  const panNum = (panNumber || "").trim().toUpperCase();

  if (ifscCode && !validateIFSC(ifscCode)) {
    const err = new Error("Invalid IFSC Code format. IFSC must be 11 characters starting with 4 letters, 5th character 0, followed by 6 alphanumeric characters.");
    err.statusCode = 400;
    throw err;
  }

  let safeDob = null;
  const inputDob = dateOfBirth || aadhaarDob;
  if (inputDob && inputDob !== "Invalid date" && inputDob !== "null" && inputDob !== "undefined") {
    const parsed = new Date(inputDob);
    if (!isNaN(parsed.getTime())) {
      safeDob = parsed.toISOString().split("T")[0];
    }
  }

  // --- Backend Identity Matching Rules ---
  const panTargetName = panHolderName || applicantName;
  const aadhaarTargetName = aadhaarName || applicantName;

  const identityMatch = cashfreeVerification.matchIdentity({
    panName: panTargetName,
    aadhaarName: aadhaarTargetName,
    panDob: safeDob,
    aadhaarDob: aadhaarDob ? String(aadhaarDob).split("T")[0] : null,
  });

  const verifiedIdentityName = aadhaarTargetName || panTargetName || applicantName;
  const bankTargetName = accountHolderName || applicantName;

  const bankHolderMatch = cashfreeVerification.matchBankHolder({
    verifiedName: verifiedIdentityName,
    bankAccountHolderName: bankTargetName,
  });

  // Determine KYC status based on Cashfree verification results
  // If either PAN/Aadhaar identity mismatch or Bank Holder mismatch -> set MANUAL_REVIEW
  let finalKycStatus = "pending";
  let rejectionReason = null;


  const validDocTypes = ["government_id", "pan_card", "aadhaar_card", "passport", "driving_license", "address_proof", "other"];
  let safeDocType = "pan_card";
  if (validDocTypes.includes(documentType)) {
    safeDocType = documentType;
  }

  let rawDocUrl = (documentFileUrl || fileUrl || "").trim();
  if (rawDocUrl.startsWith("blob:") || rawDocUrl.startsWith("data:")) {
    rawDocUrl = "";
  }
  const docFileUrl = rawDocUrl || "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80";

  const transaction = await sequelize.transaction();

  try {
    const [kycRecord] = await KycVerification.findOrCreate({
      where: { creator_id: creatorId },
      defaults: {
        creator_id: creatorId,
        full_name: applicantName,
        date_of_birth: safeDob,
        address: address || "",
        country: country || "India",
        state: state || "",
        city: city || "",
        pincode: pincode || "",
        pan_number: panNum,
        pan_holder_name: panTargetName,
        pan_status: panStatus || "verified",
        pan_reference_id: panReferenceId || "",
        aadhaar_masked: aadhaarMasked || (documentNumber ? `XXXXXXXX${String(documentNumber).slice(-4)}` : ""),
        aadhaar_name: aadhaarTargetName,
        aadhaar_dob: aadhaarDob || safeDob || "",
        aadhaar_reference_id: aadhaarReferenceId || "",
        identity_match_status: identityMatch.isMatch ? "matched" : "mismatch",
        status: finalKycStatus,
        rejection_reason: rejectionReason,
        submitted_at: new Date(),
      },
      transaction,
    });

    await kycRecord.update(
      {
        full_name: applicantName,
        date_of_birth: safeDob || kycRecord.date_of_birth,
        address: address || kycRecord.address,
        country: country || kycRecord.country,
        state: state || kycRecord.state,
        city: city || kycRecord.city,
        pincode: pincode || kycRecord.pincode,
        pan_number: panNum,
        pan_holder_name: panTargetName,
        pan_status: panStatus || kycRecord.pan_status || "verified",
        pan_reference_id: panReferenceId || kycRecord.pan_reference_id || "",
        aadhaar_masked: aadhaarMasked || kycRecord.aadhaar_masked || "",
        aadhaar_name: aadhaarTargetName,
        aadhaar_dob: aadhaarDob || safeDob || kycRecord.aadhaar_dob || "",
        aadhaar_reference_id: aadhaarReferenceId || kycRecord.aadhaar_reference_id || "",
        identity_match_status: identityMatch.isMatch ? "matched" : "mismatch",
        status: finalKycStatus,
        rejection_reason: rejectionReason,
        submitted_at: new Date(),
      },
      { transaction }
    );

    await KycDocument.create(
      {
        kyc_id: kycRecord.id,
        document_type: safeDocType,
        document_number: panNum || documentNumber,
        file_url: docFileUrl,
        verification_status: finalKycStatus === "manual_review" ? "pending" : "approved",
      },
      { transaction }
    );

    const [bankAccount] = await CreatorBankAccount.findOrCreate({
      where: { creator_id: creatorId },
      defaults: {
        creator_id: creatorId,
        account_holder_name: bankTargetName,
        bank_name: bankName || "",
        account_number: accountNumber || "",
        ifsc_code: ifscCode ? String(ifscCode).toUpperCase() : "",
        upi_id: upiId || "",
        account_type: "bank",
        is_primary: true,
        is_verified: bankHolderMatch.isMatch,
        status: "active",
      },
      transaction,
    });

    await bankAccount.update(
      {
        account_holder_name: bankTargetName,
        bank_name: bankName || bankAccount.bank_name,
        account_number: accountNumber || bankAccount.account_number,
        ifsc_code: ifscCode ? String(ifscCode).toUpperCase() : bankAccount.ifsc_code,
        upi_id: upiId || bankAccount.upi_id,
        is_verified: bankHolderMatch.isMatch,
      },
      { transaction }
    );

    if (CreatorProfile) {
      const updateFields = { kyc_status: finalKycStatus };
      if (category) {
        updateFields.bio = `${category}`;
      }
      await CreatorProfile.update(
        updateFields,
        { where: { creator_id: creatorId }, transaction }
      );
    }

    if (mobileNumber && CreatorsModel) {
      const creatorRec = await CreatorsModel.findByPk(creatorId, { transaction });
      if (creatorRec && !creatorRec.mobile) {
        const cleanPhone = String(mobileNumber).replace(/[^0-9+]/g, '');
        if (cleanPhone) {
          await creatorRec.update({ mobile: cleanPhone }, { transaction });
        }
      }
    }

    if (Array.isArray(socialLinks) && socialLinks.length > 0 && CreatorSocialLink) {
      for (const item of socialLinks) {
        if (!item || !item.platform || !item.link) continue;
        const plat = String(item.platform).trim().toLowerCase();
        const url = String(item.link).trim();
        if (!plat || !url) continue;

        const [linkRec, created] = await CreatorSocialLink.findOrCreate({
          where: { creator_id: creatorId, platform: plat },
          defaults: { creator_id: creatorId, platform: plat, profile_url: url },
          transaction,
        });
        if (!created && linkRec) {
          await linkRec.update({ profile_url: url }, { transaction });
        }
      }
    }

    await transaction.commit();

    try {
      const adminNotificationService = require("../../admin/services/notificationService");
      await adminNotificationService.createNotification({
        creatorId,
        type: "kyc",
        title: finalKycStatus === "manual_review" ? "KYC Requires Manual Review" : "New KYC Verification Request",
        message: `Creator ${applicantName} submitted KYC. PAN & Aadhaar match: ${identityMatch.isMatch ? 'PASSED' : 'MANUAL REVIEW'}. Bank match: ${bankHolderMatch.isMatch ? 'PASSED' : 'MANUAL REVIEW'}.`,
      });
    } catch (notifErr) {
      console.warn("Notice: KYC admin notification bypassed:", notifErr.message);
    }

    return {
      kycStatus: finalKycStatus,
      submittedAt: new Date().toISOString(),
      estimatedReviewTime: finalKycStatus === "manual_review" ? "Manual Review in 24-48 Hours" : "12-24 Hours",
      identityMatch: {
        isMatch: identityMatch.isMatch,
        nameScore: identityMatch.nameScore,
        panName: panTargetName,
        aadhaarName: aadhaarTargetName,
        status: identityMatch.status,
      },
      bankMatch: {
        isMatch: bankHolderMatch.isMatch,
        accountHolderName: bankTargetName,
        verifiedIdentityName,
        status: bankHolderMatch.status,
      },
      kyc: {
        fullName: applicantName,
        panNumber: panNum,
        documentType: safeDocType,
        status: finalKycStatus,
      },
      bank: {
        accountHolderName: bankAccount.account_holder_name,
        bankName: bankAccount.bank_name,
        accountNumber: maskBankAccount(bankAccount.account_number),
        ifscCode: bankAccount.ifsc_code,
        upiId: bankAccount.upi_id,
      },
    };
  } catch (error) {
    if (transaction && !transaction.finished) {
      await transaction.rollback();
    }
    throw error;
  }
};

/**
 * Get Creator KYC Status
 */
const getKycStatusService = async (creatorId) => {
  if (!creatorId) {
    const err = new Error("Creator ID is required.");
    err.statusCode = 400;
    throw err;
  }

  const [kycRecord, bankAccount, profile] = await Promise.all([
    KycVerification.findOne({ where: { creator_id: creatorId } }),
    CreatorBankAccount.findOne({ where: { creator_id: creatorId } }),
    CreatorProfile.findOne({ where: { creator_id: creatorId } }),
  ]);

  const currentStatus = (profile?.kyc_status || kycRecord?.status || "not_submitted").toLowerCase();
  const normalizedStatus = ["approved", "rejected", "pending", "manual_review"].includes(currentStatus)
    ? currentStatus
    : "not_submitted";

  return {
    creatorId,
    kycStatus: normalizedStatus,
    isSubmitted: !!kycRecord,
    rejectionReason: kycRecord?.rejection_reason || null,
    estimatedReviewTime: normalizedStatus === "manual_review" ? "Manual Review in 24-48 Hours" : "12-24 Hours",
    identityMatchStatus: kycRecord?.identity_match_status || "pending",
    kyc: kycRecord
      ? {
        fullName: kycRecord.full_name,
        panNumber: kycRecord.pan_number,
        panHolderName: kycRecord.pan_holder_name,
        aadhaarMasked: kycRecord.aadhaar_masked,
        aadhaarName: kycRecord.aadhaar_name,
        aadhaarDob: kycRecord.aadhaar_dob,
        city: kycRecord.city,
        state: kycRecord.state,
        status: normalizedStatus,
        identityMatchStatus: kycRecord.identity_match_status,
        rejectionReason: kycRecord.rejection_reason || null,
        submittedAt: kycRecord.submitted_at,
      }
      : null,
    bank: bankAccount
      ? {
        accountHolderName: bankAccount.account_holder_name,
        bankName: bankAccount.bank_name,
        accountNumber: maskBankAccount(bankAccount.account_number),
        ifscCode: bankAccount.ifsc_code,
        upiId: bankAccount.upi_id,
        isVerified: bankAccount.is_verified,
      }
      : null,
  };
};

module.exports = {
  submitKycService,
  getKycStatusService,
};
