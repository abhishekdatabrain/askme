const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const UserFcmToken = sequelize.define(
    "user_fcm_tokens",
    {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true,
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
        tableName: "user_fcm_tokens",
        schema: process.env.SCHEMA || "Abhishek",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
        underscored: true,
    }
);

UserFcmToken.sync({ alter: false }).catch((err) => {
    console.warn("[UserFcmTokenModel] Table sync notice:", err.message);
});

module.exports = UserFcmToken;
