const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const CreatorBankAccount = sequelize.define(
  "creator_bank_accounts",
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

    account_holder_name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },

    bank_name: {
      type: DataTypes.STRING(150),
    },

    account_number: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    ifsc_code: {
      type: DataTypes.STRING(20),
    },

    upi_id: {
      type: DataTypes.STRING(150),
    },

    account_type: {
      type: DataTypes.STRING(50),
      defaultValue: "bank",
    },

    is_primary: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    status: {
      type: DataTypes.STRING(50),
      defaultValue: "active",
    },
  },
  {
    tableName: "creator_bank_accounts",
    timestamps: true,
    underscored: true,
  }
);

CreatorBankAccount.sync({ alter: true }).catch((err) => {
    console.warn('CreatorBankAccountModel sync alter notice:', err.message);
});

module.exports = CreatorBankAccount;