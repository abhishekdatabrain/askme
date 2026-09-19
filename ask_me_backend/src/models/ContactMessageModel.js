const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ContactMessage = sequelize.define(
  "contact_messages",
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING(100),
      defaultValue: "Viewer",
    },
    phone: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("unread", "read", "replied", "archived"),
      defaultValue: "unread",
    },
  },
  {
    timestamps: true,
    tableName: "contact_messages",
    underscored: true,
  }
);

module.exports = ContactMessage;
