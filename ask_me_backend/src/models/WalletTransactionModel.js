const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const WalletTransaction = sequelize.define(
    "wallet_transactions",
    {
        id: {
            type: DataTypes.BIGINT,
            autoIncrement: true,
            primaryKey: true,
        },

        wallet_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },

        creator_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },

        donation_id: {
            type: DataTypes.BIGINT,
        },

        withdrawal_id: {
            type: DataTypes.BIGINT,
        },

        transaction_type: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        direction: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        amount: {
            type: DataTypes.DECIMAL(18, 2),
            allowNull: false,
        },

        balance_before: {
            type: DataTypes.DECIMAL(18, 2),
            allowNull: false,
        },

        balance_after: {
            type: DataTypes.DECIMAL(18, 2),
            allowNull: false,
        },

        description: {
            type: DataTypes.TEXT,
        },

        reference: {
            type: DataTypes.STRING(255),
        },
    },
    {
        tableName: "wallet_transactions",
        timestamps: true,
        updatedAt: false,
        underscored: true,
    }
);

module.exports = WalletTransaction;