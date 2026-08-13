const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const CommissionSetting = sequelize.define(
    "CommissionSetting",
    {
        id: {
            type: DataTypes.BIGINT,
            autoIncrement: true,
            primaryKey: true,
        },

        commission_percentage: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: false,
            defaultValue: 15,
        },

        minimum_withdrawal_amount: {
            type: DataTypes.DECIMAL(18, 2),
            allowNull: false,
            defaultValue: 100,
        },

        maximum_withdrawal_amount: {
            type: DataTypes.DECIMAL(18, 2),
        },

        currency: {
            type: DataTypes.STRING(10),
            defaultValue: "INR",
        },

        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
    },
    {
        tableName: "commission_settings",
        timestamps: true,
        underscored: true,
    }
);

module.exports = CommissionSetting;