const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Donation = sequelize.define(
    "donations",
    {
        id: {
            type: DataTypes.BIGINT,
            autoIncrement: true,
            primaryKey: true,
        },

        donation_uuid: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            unique: true,
        },

        session_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },

        creator_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },

        viewer_name: {
            type: DataTypes.STRING(150),
        },

        viewer_email: {
            type: DataTypes.STRING(150),
        },

        viewer_mobile: {
            type: DataTypes.STRING(30),
        },

        amount: {
            type: DataTypes.DECIMAL(18, 2),
            allowNull: false,
        },

        currency: {
            type: DataTypes.STRING(10),
            defaultValue: "INR",
        },

        message: {
            type: DataTypes.TEXT,
        },

        anonymous: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },

        payment_status: {
            type: DataTypes.ENUM(
                "pending",
                "success",
                "failed",
                "refunded",
                "cancelled"
            ),
            defaultValue: "pending",
        },
        status: {
            type: DataTypes.STRING(150),
        },
        paid_at: {
            type: DataTypes.DATE,
        },
        is_vip: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
    },
    {
        tableName: "donations",
        timestamps: true,
        underscored: true,
    }
);

module.exports = Donation;