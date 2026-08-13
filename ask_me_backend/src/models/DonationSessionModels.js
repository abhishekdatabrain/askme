const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const DonationSession = sequelize.define(
    "donation_sessions",
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

        platform_id: {
            type: DataTypes.BIGINT,
        },

        session_code: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
        },

        title: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },

        category: {
            type: DataTypes.STRING(100),
        },

        description: {
            type: DataTypes.TEXT,
        },

        thumbnail_url: {
            type: DataTypes.TEXT,
        },

        stream_url: {
            type: DataTypes.TEXT,
        },

        status: {
            type: DataTypes.ENUM(
                "draft",
                "active",
                "closed",
                "disabled"
            ),
            defaultValue: "active",
        },

        started_at: {
            type: DataTypes.DATE,
        },

        ended_at: {
            type: DataTypes.DATE,
        },

        total_donations: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },

        total_amount: {
            type: DataTypes.DECIMAL(18, 2),
            defaultValue: 0,
        },
    },
    {
        tableName: "donation_sessions",
        timestamps: true,
        underscored: true,
    }
);

module.exports = DonationSession;