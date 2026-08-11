const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/db');

/**
 * Sequelize User Model Definition
 */
const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Name cannot be empty' },
        len: { args: [2, 50], msg: 'Name must be between 2 and 50 characters' },
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        name: 'users_email_unique',
        msg: 'A user with this email address already exists',
      },
      validate: {
        isEmail: { msg: 'Please provide a valid email address' },
      },
      set(value) {
        // Automatically save email in lowercase
        this.setDataValue('email', value ? value.toLowerCase() : value);
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: { args: [6, 255], msg: 'Password must be at least 6 characters long' },
      },
    },
    role: {
      type: DataTypes.ENUM('user', 'creator', 'admin'),
      defaultValue: 'user',
      validate: {
        isIn: {
          args: [['user', 'creator', 'admin']],
          msg: 'Role must be either user, creator, or admin',
        },
      },
    },
    avatar: {
      type: DataTypes.TEXT,
      defaultValue: '',
    },
    bio: {
      type: DataTypes.STRING(250),
      defaultValue: '',
    },
  },
  {
    tableName: 'users',
    timestamps: true,
    underscored: true, // Uses created_at and updated_at naming conventions in PostgreSQL
    hooks: {
      /**
       * Before create hook to automatically hash user password
       */
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      /**
       * Before update hook to re-hash password if modified
       */
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
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
  return await bcrypt.compare(enteredPassword, this.password);
};

/**
 * Instance method to return sanitized public user JSON object (omits password)
 */
User.prototype.toPublicJSON = function () {
  const userJson = this.toJSON();
  delete userJson.password;
  return userJson;
};

module.exports = User;
