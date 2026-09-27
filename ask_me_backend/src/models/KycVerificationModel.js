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

        pan_holder_name: {
            type: DataTypes.STRING(150),
        },

        pan_status: {
            type: DataTypes.STRING(50),
        },

        pan_reference_id: {
            type: DataTypes.STRING(100),
        },

        aadhaar_masked: {
            type: DataTypes.STRING(20),
        },

        aadhaar_name: {
            type: DataTypes.STRING(150),
        },

        aadhaar_dob: {
            type: DataTypes.STRING(50),
        },

        aadhaar_reference_id: {
            type: DataTypes.STRING(100),
        },

        identity_match_status: {
            type: DataTypes.STRING(50),
            defaultValue: "pending",
        },

        status: {
            type: DataTypes.STRING(50),
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

KycVerification.sync({ alter: true }).catch((err) => {
    console.warn('KycVerificationModel sync alter notice:', err.message);
});

module.exports = KycVerification;