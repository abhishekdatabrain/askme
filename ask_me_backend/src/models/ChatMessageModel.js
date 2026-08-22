const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ChatMessageModel = sequelize.define(
  "chat_messages",
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    // Live session in which the chat message was sent
    session_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: "donation_sessions",
        key: "id",
      },
    },
    // Creator or viewer
    sender_type: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "viewer",
    },
    // ID of creator or viewer
    sender_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: 0,
    },
    // Display name of sender (optional for quick rendering)
    sender_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    // If this message is related to a donation
    donation_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: "donations",
        key: "id",
      },
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    // Normal chat / donation / reply
    message_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "chat", // 'chat' | 'donation' | 'donation_reply'
    },
    // For moderation
    is_deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "chat_messages",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
    underscored: true,
    indexes: [
      {
        name: "idx_chat_messages_session_id",
        fields: ["session_id"],
      },
      {
        name: "idx_chat_messages_donation_id",
        fields: ["donation_id"],
      },
      {
        name: "idx_chat_messages_created_at",
        fields: ["created_at"],
      },
    ],
  }
);

module.exports = ChatMessageModel;
