const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

/**
 * VipPlanModel matching "Abhishek".vip_plans PostgreSQL table:
 * 
 * CREATE TABLE "Abhishek".vip_plans (
 *   id bigserial NOT NULL,
 *   name varchar(100) NOT NULL,
 *   price numeric(10, 2) DEFAULT 999.00 NOT NULL,
 *   interval varchar(20) DEFAULT 'Monthly' NOT NULL,
 *   perks text,
 *   status varchar(20) DEFAULT 'Active' NOT NULL,
 *   badge_color varchar(50) DEFAULT 'bg-[#FFD60A]',
 *   created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
 *   CONSTRAINT vip_plans_pkey PRIMARY KEY (id)
 * );
 */
const VipPlan = sequelize.define(
  "vip_plans",
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },

    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 999.00,
    },

    interval: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "Monthly",
    },

    perks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "Active",
    },

    badge_color: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: "bg-[#FFD60A]",
    },

    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    schema: process.env.SCHEMA || "Abhishek",
    tableName: "vip_plans",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
    underscored: true,
  }
);

module.exports = VipPlan;
