const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const CreatorProfileModel = sequelize.define(
    "creator_profiles",
    {
        id: {
            type: DataTypes.BIGINT,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },

        creator_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            unique: true,
        },

        bio: {
            type: DataTypes.TEXT,
            allowNull: true,
        },

        display_name: {
            type: DataTypes.STRING(150),
            allowNull: true,
        },

        timezone: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },

        kyc_status: {
            type: DataTypes.STRING(20),
            allowNull: false,
            defaultValue: "pending",

            validate: {
                isIn: [
                    [
                        "pending",
                        "approved",
                        "rejected",
                    ],
                ],
            },
        },

        streaming_platform: {
            type: DataTypes.STRING(100),
            allowNull: true,
            defaultValue: "YouTube Live",
        },

        stream_url: {
            type: DataTypes.STRING(500),
            allowNull: true,
        },

        channel_handle: {
            type: DataTypes.STRING(150),
            allowNull: true,
        },

        is_payment_enabled: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },

        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },

        updated_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        tableName: "creator_profiles",
        schema: process.env.SCHEMA || "Abhishek",

        timestamps: true,

        createdAt: "created_at",
        updatedAt: "updated_at",

        freezeTableName: true,
    }
);

CreatorProfileModel.sync({ alter: true }).catch((err) => {
    console.warn('CreatorProfileModel sync alter notice:', err.message);
});

module.exports = CreatorProfileModel;