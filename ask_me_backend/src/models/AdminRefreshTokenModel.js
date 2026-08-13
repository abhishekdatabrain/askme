const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const AdminRefreshToken = sequelize.define(
    "admin_refresh_tokens",
    {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true,
        },

        admin_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },

        token_hash: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
        },

        expires_at: {
            type: DataTypes.DATE,
            allowNull: false,
        },

        revoked_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        tableName: "admin_refresh_tokens",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: false,
    }
);

module.exports = AdminRefreshToken;