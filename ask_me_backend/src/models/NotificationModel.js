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
            allowNull: false,
        },

        reference_type: {
            type: DataTypes.STRING(50),
        },

        reference_id: {
            type: DataTypes.BIGINT,
        },

        is_read: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },

        read_at: {
            type: DataTypes.DATE,
        },
    },
    {
        tableName: "notifications",
        timestamps: true,
        underscored: true,
    }
);

module.exports = Notification;