const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

/**
 * WalletSettlementModel matching "Abhishek".wallet_settlements PostgreSQL table:
 * Stores monthly settlement records for creator wallets with carried-forward balances
 * and single withdrawal restriction per settlement cycle.
 */
const WalletSettlement = sequelize.define(
  "wallet_settlements",
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },

    creator_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },

    wallet_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },

    earning_month: {
      type: DataTypes.STRING(7), // Format: 'YYYY-MM' (e.g. '2026-09')
      allowNull: false,
    },

    settlement_month: {
      type: DataTypes.STRING(7), // Format: 'YYYY-MM' (e.g. '2026-10')
      allowNull: false,
    },

    period_start: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    period_end: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    gross_amount: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
      defaultValue: 0,
    },

    total_earning: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
      defaultValue: 0,
    },

    commission_amount: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
      defaultValue: 0,
    },

    platform_commission: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
      defaultValue: 0,
    },

    net_amount: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
      defaultValue: 0,
    },

    creator_net_amount: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
      defaultValue: 0,
    },

    previous_carried_balance: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
      defaultValue: 0,
    },

    available_amount: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
      defaultValue: 0,
    },

    withdrawn_amount: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
      defaultValue: 0,
    },

    remaining_amount: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
      defaultValue: 0,
    },

    has_withdrawn: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "available",
    },

    settlement_status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "available",
    },

    settled_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },

    reference: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    schema: process.env.SCHEMA || "Abhishek",
    tableName: "wallet_settlements",
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ["creator_id", "settlement_month"],
        name: "wallet_settlements_creator_month_unique",
      },
    ],
  }
);

module.exports = WalletSettlement;
