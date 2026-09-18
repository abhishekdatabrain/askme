const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const CreatorTestimonial = sequelize.define(
  "creator_testimonials",
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    creator_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    profile_image: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    testimonial: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    metric_label: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    metric_value: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    creator_type: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    platform: {
      type: DataTypes.STRING(50),
      defaultValue: "YouTube",
    },
    social_handle: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    followers: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    profile_link: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    display_order: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      allowNull: false,
    },
    featured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    show_on_landing_page: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    status: {
      type: DataTypes.STRING(20),
      defaultValue: "active", // 'active' | 'inactive'
    },
  },
  {
    tableName: "creator_testimonials",
    schema: process.env.SCHEMA || "Abhishek",
    timestamps: true,
    underscored: true,
    paranoid: true, // Soft delete enabled (deleted_at)
    indexes: [
      { fields: ["status"] },
      { fields: ["show_on_landing_page"] },
      { fields: ["display_order"] },
      { fields: ["deleted_at"] },
    ],
  }
);

// Auto-sync table structure with database schema
CreatorTestimonial.sync({ alter: true }).catch((err) => {
  console.warn("CreatorTestimonialModel sync alter notice:", err.message);
});

module.exports = CreatorTestimonial;
