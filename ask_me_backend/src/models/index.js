const Admin = require("./AdminModel");
const AdminRefreshToken = require("./AdminRefreshTokenModel");
const Follow = require("./FollowModel");
const Notification = require("./NotificationModel");
const User = require("./userModel");
const Creator = require("./CreatorsModel");
const DonationSession = require("./DonationSessionModels");
const VipMembership = require("./VipMembershipModel");

Admin.hasMany(AdminRefreshToken, {
    foreignKey: "admin_id",
    as: "refreshTokens",
});

AdminRefreshToken.belongsTo(Admin, {
    foreignKey: "admin_id",
    as: "admin",
});

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

const VipPlan = require("./VipPlanModel");
const CommissionSetting = require("./CommissionSettingModel");

// VIP Membership Relationships
User.hasMany(VipMembership, { foreignKey: "viewer_id", as: "vipMemberships" });
VipMembership.belongsTo(User, { foreignKey: "viewer_id", as: "viewer" });

Creator.hasMany(VipMembership, { foreignKey: "creator_id", as: "vipMembers" });
VipMembership.belongsTo(Creator, { foreignKey: "creator_id", as: "creator" });

module.exports = {
    Admin,
    AdminRefreshToken,
    Follow,
    Notification,
    User,
    Creator,
    DonationSession,
    VipMembership,
    VipPlan,
    CommissionSetting,
};