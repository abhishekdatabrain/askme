const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Notification = sequelize.define(
    "notifications",
    {
        id: {
            type: DataTypes.BIGINT,
            autoIncrement: true,
            primaryKey: true,
        },

        user_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            references: {
                model: {
                    tableName: "users",
                    schema: process.env.SCHEMA || "Abhishek",
                },
                key: "id",
            },
            onDelete: "CASCADE",
        },

        creator_id: {
            type: DataTypes.BIGINT,
            allowNull: true,
            references: {
                model: {
                    tableName: "creators",
                    schema: process.env.SCHEMA || "Abhishek",
                },
                key: "id",
            },
            onDelete: "CASCADE",
        },

        session_id: {
            type: DataTypes.BIGINT,
            allowNull: true,
            references: {
                model: {
                    tableName: "donation_sessions",
                    schema: process.env.SCHEMA || "Abhishek",
                },
                key: "id",
            },
            onDelete: "CASCADE",
        },

        type: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },

        title: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },

        message: {
            type: DataTypes.TEXT,
            allowNull: true,
        },

        is_read: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },

        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        schema: process.env.SCHEMA || "Abhishek",
        tableName: "notifications",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: false,
        underscored: true,
    }
);

module.exports = Notification;