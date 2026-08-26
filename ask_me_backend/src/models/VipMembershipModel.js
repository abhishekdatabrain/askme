const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

/**
 * VipMembershipModel matching "Abhishek".vip_memberships PostgreSQL table:
 * 
 * CREATE TABLE "Abhishek".vip_memberships (
 *   id bigserial NOT NULL,
 *   viewer_id int8 NOT NULL,
 *   creator_id int8 NOT NULL,
 *   plan_name varchar(100) DEFAULT 'VIP Membership' NOT NULL,
 *   amount numeric(10, 2) DEFAULT 999.00 NOT NULL,
 *   status varchar(20) DEFAULT 'active' NOT NULL,
 *   transaction_id varchar(100),
 *   next_billing_date date,
 *   created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
 *   CONSTRAINT vip_memberships_pkey PRIMARY KEY (id),
 *   CONSTRAINT fk_vip_viewer FOREIGN KEY (viewer_id) REFERENCES "Abhishek".users(id) ON DELETE CASCADE,
 *   CONSTRAINT fk_vip_creator FOREIGN KEY (creator_id) REFERENCES "Abhishek".creators(id) ON DELETE CASCADE
 * );
 */
const VipMembership = sequelize.define(
  "vip_memberships",
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

    plan_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: "VIP Membership",
    },

    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 999.00,
    },

    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "active",
    },

    transaction_id: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    next_billing_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },

    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    schema: process.env.SCHEMA || "Abhishek",
    tableName: "vip_memberships",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
    underscored: true,
  }
);

module.exports = VipMembership;
