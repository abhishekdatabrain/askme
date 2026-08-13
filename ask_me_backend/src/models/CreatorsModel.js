const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const User = sequelize.define(
    "creators",
    {
        id: {
            type: DataTypes.BIGINT,
            autoIncrement: true,
            primaryKey: true,
        },

        role: {
            type: DataTypes.ENUM("creator", "admin"),
            defaultValue: "creator",
            allowNull: false,
        },

        full_name: {
            type: DataTypes.STRING(150),
            allowNull: false,
        },

        username: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
        },

        email: {
            type: DataTypes.STRING(150),
            allowNull: false,
            unique: true,
        },

        mobile: {
            type: DataTypes.STRING(20),
            unique: true,
        },

        password: {
            type: DataTypes.TEXT,
            allowNull: false,
        },

        profile_image: {
            type: DataTypes.TEXT,
        },

        country: {
            type: DataTypes.STRING(100),
        },

        status: {
            type: DataTypes.ENUM(
                "pending",
                "active",
                "blocked",
                "suspended",
                "deleted"
            ),
            defaultValue: "pending",
        },

        email_verified_at: {
            type: DataTypes.DATE,
        },

        mobile_verified_at: {
            type: DataTypes.DATE,
        },

        last_login_at: {
            type: DataTypes.DATE,
        },
    },
    {
        tableName: "creators",
        timestamps: true,
        underscored: true,
    }
);

module.exports = User;