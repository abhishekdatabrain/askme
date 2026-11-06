const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const LegalPolicy = sequelize.define(
  "legal_policies",
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    category: {
      type: DataTypes.STRING(100),
      defaultValue: "Legal",
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    draft_content: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    has_draft: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    status: {
      type: DataTypes.STRING(30), // 'published' | 'draft' | 'archived'
      defaultValue: "published",
    },
    version: {
      type: DataTypes.STRING(50),
      defaultValue: "1.0",
    },
    effective_date: {
      type: DataTypes.DATEONLY,
      defaultValue: DataTypes.NOW,
    },
    meta_title: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    meta_description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    meta_keywords: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    is_consent_required: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    consent_type: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    requires_reconsent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    display_order: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    published_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    published_by: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    created_by: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    updated_by: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
  },
  {
    tableName: "legal_policies",
    schema: process.env.SCHEMA || "Abhishek",
    timestamps: true,
    underscored: true,
    paranoid: true,
    indexes: [
      { fields: ["slug"], unique: true },
      { fields: ["status"] },
      { fields: ["display_order"] },
      { fields: ["deleted_at"] },
    ],
  }
);

// Auto-sync table structure with database schema
LegalPolicy.sync({ alter: true }).catch((err) => {
  console.warn("LegalPolicyModel sync alter notice:", err.message);
});

module.exports = LegalPolicy;
