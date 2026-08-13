const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const StreamPlatform = sequelize.define(
    "stream_platforms",
    {
        id: {
            type: DataTypes.BIGINT,
            autoIncrement: true,
            primaryKey: true,
        },

        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
        },

        logo_url: {
            type: DataTypes.TEXT,
        },

        status: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
    },
    {
        tableName: "stream_platforms",
        timestamps: true,
        underscored: true,
    }
);

module.exports = StreamPlatform;