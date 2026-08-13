const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const PaymentTransaction = sequelize.define(
  "payment_transactions",
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },

    donation_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },

    gateway: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },

    gateway_order_id: {
      type: DataTypes.STRING(255),
    },

    gateway_payment_id: {
      type: DataTypes.STRING(255),
    },

    gateway_transaction_id: {
      type: DataTypes.STRING(255),
    },

    payment_method: {
      type: DataTypes.STRING(50),
    },

    amount: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
    },

    currency: {
      type: DataTypes.STRING(10),
      defaultValue: "INR",
    },

    status: {
      type: DataTypes.ENUM(
        "created",
        "pending",
        "success",
        "failed",
        "refunded"
      ),
      defaultValue: "created",
    },

    gateway_response: {
      type: DataTypes.JSONB,
    },

    paid_at: {
      type: DataTypes.DATE,
    },
  },
  {
    tableName: "payment_transactions",
    timestamps: true,
    underscored: true,
  }
);

module.exports = PaymentTransaction;