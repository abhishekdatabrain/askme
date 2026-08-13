const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const PaymentWebhook = sequelize.define(
    "payment_webhooks",
    {
        id: {
            type: DataTypes.BIGINT,
            autoIncrement: true,
            primaryKey: true,
        },

        gateway: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },

        event_type: {
            type: DataTypes.STRING(100),
        },

        gateway_event_id: {
            type: DataTypes.STRING(255),
        },

        payload: {
            type: DataTypes.JSONB,
            allowNull: false,
        },

        signature: {
            type: DataTypes.TEXT,
        },

        processing_status: {
            type: DataTypes.ENUM(
                "pending",
                "processed",
                "failed",
                "ignored"
            ),
            defaultValue: "pending",
        },

        processed_at: {
            type: DataTypes.DATE,
        },

        error_message: {
            type: DataTypes.TEXT,
        },
    },
    {
        tableName: "payment_webhooks",
        timestamps: true,
        underscored: true,
    }
);

module.exports = PaymentWebhook;