const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const CreatorSocialLink = sequelize.define(
    "creator_social_links",
    {
        id: {
            type: DataTypes.BIGINT,
            autoIncrement: true,
            primaryKey: true,
        },

        creator_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },

        platform: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },

        profile_url: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
    },
    {
        tableName: "creator_social_links",
        timestamps: true,
        underscored: true,
    }
);

module.exports = CreatorSocialLink;