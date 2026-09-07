const Admin = require("./AdminModel");
const AdminRefreshToken = require("./AdminRefreshTokenModel");
const Follow = require("./FollowModel");
const Notification = require("./NotificationModel");
const User = require("./userModel");
const Creator = require("./CreatorsModel");
const CreatorProfile = require("./CreatorProfileModel");
const CreatorSocialLink = require("./CreatorSocialLinkModel");
const KycVerification = require("./KycVerificationModel");
const KycDocument = require("./KycDocumentModel");
const CreatorBankAccount = require("./CreatorBankAccountModel");
const Wallet = require("./WalletModel");
const WalletTransaction = require("./WalletTransactionModel");
const DonationSession = require("./DonationSessionModels");
const Donation = require("./DonationModel");
const PaymentTransaction = require("./PaymentTransactionModel");
const WithdrawalRequest = require("./WithdrawalRequestModel");
const CommissionSetting = require("./CommissionSettingModel");
const VipMembership = require("./VipMembershipModel");
const VipPlan = require("./VipPlanModel");
const ChatMessage = require("./ChatMessageModel");
const QrCode = require("./QrCodeModel");
const PaymentWebhook = require("./PaymentWebhookModel");
const WalletSettlement = require("./WalletSettlementModel");

// Admin & Refresh Token
Admin.hasMany(AdminRefreshToken, { foreignKey: "admin_id", as: "refreshTokens" });
AdminRefreshToken.belongsTo(Admin, { foreignKey: "admin_id", as: "admin" });

// Creator & Profile
Creator.hasOne(CreatorProfile, { foreignKey: "creator_id", as: "profile" });
CreatorProfile.belongsTo(Creator, { foreignKey: "creator_id", as: "creator" });

// Creator & Social Links
Creator.hasMany(CreatorSocialLink, { foreignKey: "creator_id", as: "socialLinks" });
CreatorSocialLink.belongsTo(Creator, { foreignKey: "creator_id", as: "creator" });

// Creator & KYC
Creator.hasOne(KycVerification, { foreignKey: "creator_id", as: "kyc" });
KycVerification.belongsTo(Creator, { foreignKey: "creator_id", as: "creator" });

// KYC Verification & KYC Documents
KycVerification.hasMany(KycDocument, { foreignKey: "kyc_id", as: "documents" });
KycDocument.belongsTo(KycVerification, { foreignKey: "kyc_id", as: "kyc" });

// Creator & Bank Accounts
Creator.hasMany(CreatorBankAccount, { foreignKey: "creator_id", as: "bankAccounts" });
CreatorBankAccount.belongsTo(Creator, { foreignKey: "creator_id", as: "creator" });

// Creator & Wallet
Creator.hasOne(Wallet, { foreignKey: "creator_id", as: "wallet" });
Wallet.belongsTo(Creator, { foreignKey: "creator_id", as: "creator" });

// Wallet & Wallet Transactions
Wallet.hasMany(WalletTransaction, { foreignKey: "wallet_id", as: "transactions" });
WalletTransaction.belongsTo(Wallet, { foreignKey: "wallet_id", as: "wallet" });
Creator.hasMany(WalletTransaction, { foreignKey: "creator_id", as: "walletTransactions" });
WalletTransaction.belongsTo(Creator, { foreignKey: "creator_id", as: "creator" });

// Creator & Donation Sessions
Creator.hasMany(DonationSession, { foreignKey: "creator_id", as: "sessions" });
DonationSession.belongsTo(Creator, { foreignKey: "creator_id", as: "creator" });

// Session & QR Code
DonationSession.hasOne(QrCode, { foreignKey: "session_id", as: "qrCode" });
QrCode.belongsTo(DonationSession, { foreignKey: "session_id", as: "session" });

// Creator & Donations
Creator.hasMany(Donation, { foreignKey: "creator_id", as: "donations" });
Donation.belongsTo(Creator, { foreignKey: "creator_id", as: "creator" });

DonationSession.hasMany(Donation, { foreignKey: "session_id", as: "donations" });
Donation.belongsTo(DonationSession, { foreignKey: "session_id", as: "session" });

// Donation & Payment Transactions
Donation.hasOne(PaymentTransaction, { foreignKey: "donation_id", as: "paymentTransaction" });
PaymentTransaction.belongsTo(Donation, { foreignKey: "donation_id", as: "donation" });

// Creator & Withdrawal Requests
Creator.hasMany(WithdrawalRequest, { foreignKey: "creator_id", as: "withdrawals" });
WithdrawalRequest.belongsTo(Creator, { foreignKey: "creator_id", as: "creator" });

Wallet.hasMany(WithdrawalRequest, { foreignKey: "wallet_id", as: "withdrawals" });
WithdrawalRequest.belongsTo(Wallet, { foreignKey: "wallet_id", as: "wallet" });

CreatorBankAccount.hasMany(WithdrawalRequest, { foreignKey: "bank_account_id", as: "withdrawals" });
WithdrawalRequest.belongsTo(CreatorBankAccount, { foreignKey: "bank_account_id", as: "bankAccount" });

// Follow Relationships
User.hasMany(Follow, { foreignKey: "viewer_id", as: "follows" });
Follow.belongsTo(User, { foreignKey: "viewer_id", as: "viewer" });
Creator.hasMany(Follow, { foreignKey: "creator_id", as: "followers" });
Follow.belongsTo(Creator, { foreignKey: "creator_id", as: "creator" });

// Notification Relationships
User.hasMany(Notification, { foreignKey: "user_id", as: "notifications" });
Notification.belongsTo(User, { foreignKey: "user_id", as: "user" });
Creator.hasMany(Notification, { foreignKey: "creator_id", as: "notifications" });
Notification.belongsTo(Creator, { foreignKey: "creator_id", as: "creator" });
DonationSession.hasMany(Notification, { foreignKey: "session_id", as: "notifications" });
Notification.belongsTo(DonationSession, { foreignKey: "session_id", as: "session" });

// VIP Membership Relationships
User.hasMany(VipMembership, { foreignKey: "viewer_id", as: "vipMemberships" });
VipMembership.belongsTo(User, { foreignKey: "viewer_id", as: "viewer" });
Creator.hasMany(VipMembership, { foreignKey: "creator_id", as: "vipMembers" });
VipMembership.belongsTo(Creator, { foreignKey: "creator_id", as: "creator" });

// User & Donation Relationships
User.hasMany(Donation, { foreignKey: "viewer_id", as: "donations" });
Donation.belongsTo(User, { foreignKey: "viewer_id", as: "viewer" });

// Wallet Settlement Relationships
Creator.hasMany(WalletSettlement, { foreignKey: "creator_id", as: "settlements" });
WalletSettlement.belongsTo(Creator, { foreignKey: "creator_id", as: "creator" });
Wallet.hasMany(WalletSettlement, { foreignKey: "wallet_id", as: "settlements" });
WalletSettlement.belongsTo(Wallet, { foreignKey: "wallet_id", as: "wallet" });
WalletSettlement.hasMany(WithdrawalRequest, { foreignKey: "settlement_id", as: "withdrawals" });
WithdrawalRequest.belongsTo(WalletSettlement, { foreignKey: "settlement_id", as: "settlement" });

module.exports = {
  Admin,
  AdminRefreshToken,
  Follow,
  Notification,
  User,
  Creator,
  CreatorsModel: Creator, // Alias for backward compatibility
  CreatorProfile,
  CreatorSocialLink,
  KycVerification,
  KycDocument,
  CreatorBankAccount,
  Wallet,
  WalletTransaction,
  WalletSettlement,
  DonationSession,
  Donation,
  PaymentTransaction,
  PaymentWebhook,
  WithdrawalRequest,
  CommissionSetting,
  VipMembership,
  VipPlan,
  ChatMessage,
  QrCode,
};