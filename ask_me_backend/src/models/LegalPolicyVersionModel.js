const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const LegalPolicyVersion = sequelize.define(
  "legal_policy_versions",
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
    version: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    effective_date: {
      type: DataTypes.DATEONLY,
      defaultValue: DataTypes.NOW,
    },
    changelog: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    is_material_change: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    published_by: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    publisher_name: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    published_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "legal_policy_versions",
    schema: process.env.SCHEMA || "Abhishek",
    timestamps: true,
    underscored: true,
    paranoid: true,
    indexes: [
      { fields: ["policy_id"] },
      { fields: ["policy_id", "version"] },
      { fields: ["published_at"] },
      { fields: ["deleted_at"] },
    ],
  }
);

LegalPolicyVersion.sync({ alter: true }).catch((err) => {
  console.warn("LegalPolicyVersionModel sync alter notice:", err.message);
});

module.exports = LegalPolicyVersion;
