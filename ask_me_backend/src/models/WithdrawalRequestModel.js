const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const WithdrawalRequest = sequelize.define(
    "withdrawal_requests",
    {
        id: {
            type: DataTypes.BIGINT,
            autoIncrement: true,
            primaryKey: true,
        },

        withdrawal_uuid: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            unique: true,
        },

        creator_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },

        wallet_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },

        bank_account_id: {
            type: DataTypes.BIGINT,
        },

        amount: {
            type: DataTypes.DECIMAL(18, 2),
            allowNull: false,
        },

        processing_fee: {
            type: DataTypes.DECIMAL(18, 2),
            defaultValue: 0,
        },

        net_amount: {
            type: DataTypes.DECIMAL(18, 2),
            allowNull: false,
        },

        status: {
            type: DataTypes.ENUM(
                "pending",
                "approved",
                "processing",
                "completed",
                "rejected",
                "cancelled"
            ),
            defaultValue: "pending",
        },

        rejection_reason: {
            type: DataTypes.TEXT,
        },

        admin_id: {
            type: DataTypes.BIGINT,
        },

        transaction_reference: {
            type: DataTypes.STRING(255),
        },

        requested_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },

        approved_at: {
            type: DataTypes.DATE,
        },

        completed_at: {
            type: DataTypes.DATE,
        },
    },
    {
        tableName: "withdrawal_requests",
        timestamps: true,
        underscored: true,
    }
);

module.exports = WithdrawalRequest;