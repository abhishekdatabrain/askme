const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const UserPolicyConsent = sequelize.define(
  "user_policy_consents",
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    policy_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    policy_version_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    policy_version: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    creator_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    identifier: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    ip_address: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    consent_type: {
      type: DataTypes.STRING(100),
      defaultValue: "terms_agreement",
    },
    consented: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    consented_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    withdrawn_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "user_policy_consents",
    schema: process.env.SCHEMA || "Abhishek",
    timestamps: true,
    underscored: true,
    paranoid: true,
    indexes: [
      { fields: ["policy_id"] },
      { fields: ["user_id"] },
      { fields: ["creator_id"] },
      { fields: ["identifier"] },
      { fields: ["consent_type"] },
      { fields: ["consented_at"] },
      { fields: ["deleted_at"] },
    ],
  }
);

UserPolicyConsent.sync({ alter: true }).catch((err) => {
  console.warn("UserPolicyConsentModel sync alter notice:", err.message);
});

module.exports = UserPolicyConsent;
