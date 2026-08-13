const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const KycVerification = sequelize.define(
    "kyc_verifications",
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

        full_name: {
            type: DataTypes.STRING(150),
            allowNull: false,
        },

        date_of_birth: {
            type: DataTypes.DATEONLY,
        },

        address: {
            type: DataTypes.TEXT,
        },

        country: {
            type: DataTypes.STRING(100),
        },

        state: {
            type: DataTypes.STRING(100),
        },

        city: {
            type: DataTypes.STRING(100),
        },

        pincode: {
            type: DataTypes.STRING(20),
        },

        pan_number: {
            type: DataTypes.STRING(20),
        },

        status: {
            type: DataTypes.ENUM("pending", "approved", "rejected"),
            defaultValue: "pending",
        },

        rejection_reason: {
            type: DataTypes.TEXT,
        },

        submitted_at: {
            type: DataTypes.DATE,
        },

        reviewed_at: {
            type: DataTypes.DATE,
        },

        reviewed_by: {
            type: DataTypes.BIGINT,
        },
    },
    {
        tableName: "kyc_verifications",
        timestamps: true,
        underscored: true,
    }
);

module.exports = KycVerification;