const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Wallet = sequelize.define(
    "wallets",
    {
        id: {
            type: DataTypes.BIGINT,
            autoIncrement: true,
            primaryKey: true,
        },

        creator_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            unique: true,
        },

        total_earnings: {
            type: DataTypes.DECIMAL(18, 2),
            defaultValue: 0,
        },

        available_balance: {
            type: DataTypes.DECIMAL(18, 2),
            defaultValue: 0,
        },

        pending_balance: {
            type: DataTypes.DECIMAL(18, 2),
            defaultValue: 0,
        },

        withdrawn_amount: {
            type: DataTypes.DECIMAL(18, 2),
            defaultValue: 0,
        },
    },
    {
        tableName: "wallets",
        timestamps: true,
        underscored: true,
    }
);

module.exports = Wallet;