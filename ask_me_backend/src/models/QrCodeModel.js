const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const QrCode = sequelize.define(
    "qr_codes",
    {
        id: {
            type: DataTypes.BIGINT,
            autoIncrement: true,
            primaryKey: true,
        },

        session_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            unique: true,
        },

        qr_token: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
        },

        payment_url: {
            type: DataTypes.TEXT,
            allowNull: false,
        },

        qr_image_url: {
            type: DataTypes.TEXT,
        },

        status: {
            type: DataTypes.ENUM(
                "active",
                "inactive",
                "expired"
            ),
            defaultValue: "active",
        },

        expires_at: {
            type: DataTypes.DATE,
        },
    },
    {
        tableName: "qr_codes",
        timestamps: true,
        underscored: true,
    }
);

module.exports = QrCode;