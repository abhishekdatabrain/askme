const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/db');

/**
 * Sequelize User Model Definition matching "Abhishek".users PostgreSQL table
 */
const User = sequelize.define(
  'user',
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Name cannot be empty' },
        len: { args: [2, 255], msg: 'Name must be between 2 and 255 characters' },
      },
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: {
        name: 'users_email_key',
        msg: 'A user with this email address already exists',
      },
      validate: {
        isEmail: { msg: 'Please provide a valid email address' },
      },
      set(value) {
        // Automatically save email in lowercase
        this.setDataValue('email', value ? value.trim().toLowerCase() : value);
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: { args: [6, 255], msg: 'Password must be at least 6 characters long' },
      },
    },
    role: {
      type: DataTypes.ENUM('user', 'creator', 'admin'),
      allowNull: false,
      defaultValue: 'admin',
    },
  },
  {
    schema: process.env.SCHEMA || 'Abhishek',
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true, // Uses created_at and updated_at naming conventions in PostgreSQL
    hooks: {
      /**
       * Before create hook to automatically hash user password
       */
      beforeCreate: async (user) => {
        if (user.password && !user.password.startsWith('$2a$') && !user.password.startsWith('$2b$')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      /**
       * Before update hook to re-hash password if modified
       */
      beforeUpdate: async (user) => {
        if (user.changed('password') && !user.password.startsWith('$2a$') && !user.password.startsWith('$2b$')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  }
);

/**
 * Instance method to compare plain text password with hashed password
 */
User.prototype.validPassword = async function (enteredPassword) {
  if (!this.password || !enteredPassword) return false;

  // Direct string match fallback if password in DB was inserted as plain text
  if (this.password === enteredPassword) {
    return true;
  }

  // Compare using bcrypt hash
  try {
    return await bcrypt.compare(enteredPassword, this.password);
  } catch (err) {
    return false;
  }
};

/**
 * Static helper method to compare plain text password with stored password
 */
User.comparePassword = async function (enteredPassword, storedPassword) {
  if (!enteredPassword || !storedPassword) return false;
  if (enteredPassword === storedPassword) return true;
  try {
    return await bcrypt.compare(enteredPassword, storedPassword);
  } catch (err) {
    return false;
  }
};

/**
 * Instance method to return sanitized public user JSON object (omits password)
 */
User.prototype.toPublicJSON = function () {
  const userJson = typeof this.toJSON === 'function' ? this.toJSON() : { ...this };
  delete userJson.password;
  return userJson;
};

module.exports = User;
