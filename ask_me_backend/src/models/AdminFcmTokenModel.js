const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const AdminFcmToken = sequelize.define(
    "admin_fcm_tokens",
    {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true,
        },
        admin_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            references: {
                model: {
                    tableName: "admins",
                    schema: process.env.SCHEMA || "Abhishek",
                },
                key: "id",
            },
            onDelete: "CASCADE",
        },
        fcm_token: {
            type: DataTypes.TEXT,
            allowNull: false,
            unique: true,
        },
        device_info: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
    },
    {
        tableName: "admin_fcm_tokens",
        schema: process.env.SCHEMA || "Abhishek",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
        underscored: true,
    }
);

// Auto-sync table structure cleanly on load
AdminFcmToken.sync({ alter: false }).catch((err) => {
    console.warn("[AdminFcmTokenModel] Table sync notice:", err.message);
});

module.exports = AdminFcmToken;
