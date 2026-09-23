const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const SupportTicket = sequelize.define(
  "support_tickets",
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    ticket_number: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    creator_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    role: {
      type: DataTypes.STRING(100),
      defaultValue: "Streamer",
    },
    category: {
      type: DataTypes.STRING(100),
      defaultValue: "payout_change", // 'payout_change' | 'account_help' | 'general'
    },
    subject: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING(50),
      defaultValue: "unread", // 'unread' | 'under_review' | 'approved' | 'rejected' | 'replied' | 'archived'
    },
    admin_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    tableName: "support_tickets",
    schema: "Abhishek",
    underscored: true,
  }
);

module.exports = SupportTicket;
