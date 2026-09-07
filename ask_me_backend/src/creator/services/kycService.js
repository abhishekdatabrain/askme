const sequelize = require("../../config/database");
const { KycVerification, KycDocument, CreatorBankAccount, CreatorProfile } = require("../../models");
const { validateIFSC, validatePAN } = require("../validators/creatorValidator");
const { maskBankAccount } = require("../../utils/maskSensitiveData");

/**
 * Submit KYC Application & Payout Bank Details
 */
const submitKycService = async (creatorId, data) => {
  if (!creatorId) {
    const err = new Error("Creator ID is required.");
    err.statusCode = 400;
    throw err;
  }

  const {
    fullName,
    dateOfBirth,
    address,
    country,
    state,
    city,
    pincode,
    panNumber,
    documentType,
    documentNumber,
    fileUrl,
    accountHolderName,
    bankName,
    accountNumber,
    ifscCode,
    upiId,
  } = data;

  const applicantName = (fullName || "Creator Host").trim();
  const panNum = (panNumber || documentNumber).trim().toUpperCase();

  if (ifscCode && !validateIFSC(ifscCode)) {
    const err = new Error("Invalid IFSC Code format. IFSC must be 11 characters starting with 4 letters, 5th character 0, followed by 6 alphanumeric characters.");
    err.statusCode = 400;
    throw err;
  }

  // if (panNumber && !validatePAN(panNumber)) {
  //   const err = new Error("Invalid PAN Number format.");
  //   err.statusCode = 400;
  //   throw err;
  // }

  let safeDob = null;
  if (dateOfBirth && dateOfBirth !== "Invalid date" && dateOfBirth !== "null" && dateOfBirth !== "undefined") {
    const parsed = new Date(dateOfBirth);
    if (!isNaN(parsed.getTime())) {
      safeDob = parsed.toISOString().split("T")[0];
    }
  }

  const validDocTypes = ["government_id", "pan_card", "passport", "driving_license", "address_proof", "other"];
  let safeDocType = "pan_card";
  if (validDocTypes.includes(documentType)) {
    safeDocType = documentType;
  } else if (documentType === "adhar_card" || documentType === "aadhaar") {
    safeDocType = "government_id";
  }

  const docFileUrl = fileUrl || "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80";

  const transaction = await sequelize.transaction();

  try {
    const [kycRecord] = await KycVerification.findOrCreate({
      where: { creator_id: creatorId },
      defaults: {
        creator_id: creatorId,
        full_name: applicantName,
        date_of_birth: safeDob,
        address: address || "",
        country: country || "",
        state: state || "",
        city: city || "",
        pincode: pincode || "",
        pan_number: panNum,
        status: "pending",
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
        status: "pending",
        submitted_at: new Date(),
      },
      { transaction }
    );

    await KycDocument.create(
      {
        kyc_id: kycRecord.id,
        document_type: safeDocType,
        document_number: documentNumber || panNum,
        file_url: docFileUrl,
        verification_status: "pending",
      },
      { transaction }
    );

    const [bankAccount] = await CreatorBankAccount.findOrCreate({
      where: { creator_id: creatorId },
      defaults: {
        creator_id: creatorId,
        account_holder_name: accountHolderName || applicantName,
        bank_name: bankName || "",
        account_number: accountNumber || "",
        ifsc_code: ifscCode ? String(ifscCode).toUpperCase() : "",
        upi_id: upiId || "",
        account_type: "bank",
        is_primary: true,
        status: "active",
      },
      transaction,
    });

    await bankAccount.update(
      {
        account_holder_name: accountHolderName || bankAccount.account_holder_name,
        bank_name: bankName || bankAccount.bank_name,
        account_number: accountNumber || bankAccount.account_number,
        ifsc_code: ifscCode ? String(ifscCode).toUpperCase() : bankAccount.ifsc_code,
        upi_id: upiId || bankAccount.upi_id,
      },
      { transaction }
    );

    await CreatorProfile.update(
      { kyc_status: "pending" },
      { where: { creator_id: creatorId }, transaction }
    );

    await transaction.commit();

    try {
      const adminNotificationService = require("../../admin/services/notificationService");
      await adminNotificationService.createNotification({
        creatorId,
        type: "kyc",
        title: "New KYC Verification Request",
        message: `Creator ${applicantName || 'Host'} submitted KYC & bank details for verification.`,
      });
    } catch (notifErr) {
      console.warn("Notice: KYC admin notification bypassed:", notifErr.message);
    }

    return {
      kycStatus: "pending",
      submittedAt: new Date().toISOString(),
      estimatedReviewTime: "12-24 Hours",
      kyc: {
        fullName: applicantName,
        panNumber: panNum,
        documentType: safeDocType,
        status: "pending",
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
  const normalizedStatus = ["approved", "rejected", "pending"].includes(currentStatus) ? currentStatus : "not_submitted";

  return {
    creatorId,
    kycStatus: normalizedStatus,
    isSubmitted: !!kycRecord,
    rejectionReason: kycRecord?.rejection_reason || null,
    estimatedReviewTime: "12-24 Hours",
    kyc: kycRecord
      ? {
        fullName: kycRecord.full_name,
        panNumber: kycRecord.pan_number,
        city: kycRecord.city,
        state: kycRecord.state,
        status: normalizedStatus,
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
      }
      : null,
  };
};

module.exports = {
  submitKycService,
  getKycStatusService,
};
