const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Follow = sequelize.define(
  "follows",
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },

    viewer_id: {
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

    creator_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: {
          tableName: "creators",
          schema: process.env.SCHEMA || "Abhishek",
        },
        key: "id",
      },
      onDelete: "CASCADE",
    },

    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    schema: process.env.SCHEMA || "Abhishek",
    tableName: "follows",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
    underscored: true,
    indexes: [
      {
        name: "unique_viewer_creator",
        unique: true,
        fields: ["viewer_id", "creator_id"],
      },
    ],
  }
);

module.exports = Follow;
