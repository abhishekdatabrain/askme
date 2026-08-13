const Admin = require("./AdminModel");
const AdminRefreshToken = require("./AdminRefreshTokenModel");

Admin.hasMany(AdminRefreshToken, {
    foreignKey: "admin_id",
    as: "refreshTokens",
});

AdminRefreshToken.belongsTo(Admin, {
    foreignKey: "admin_id",
    as: "admin",
});

module.exports = {
    Admin,
    AdminRefreshToken,
};