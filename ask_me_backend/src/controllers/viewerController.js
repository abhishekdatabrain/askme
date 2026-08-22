const User = require('../models/userModel');
const generateToken = require('../utils/generateToken');
const bcrypt = require('bcryptjs');

/**
 * @desc    Register a new Viewer (User role)
 * @route   POST /api/viewers/register
 * @access  Public
 */
const registerViewer = async (req, res, next) => {
  try {
    const { name, fullName, firstname, lastname, email, password, mobile } = req.body;
    const viewerName = (name || fullName || `${firstname || ''} ${lastname || ''}`).trim();
    const viewerEmail = (email || '').trim().toLowerCase();

    if (!viewerName || !viewerEmail || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide full name, email address, and password.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        status: 'fail',
        message: 'Password must be at least 6 characters long.',
      });
    }

    // Check if user with email already exists
    const existingUser = await User.findOne({ where: { email: viewerEmail } }).catch(() => null);
    if (existingUser) {
      return res.status(400).json({
        status: 'fail',
        message: 'A viewer account with this email address already exists. Please login instead.',
      });
    }

    // Create Viewer User Record (userModel automatically hashes password via beforeCreate hook)

    const newUser = await User.create({
      name: viewerName,
      email: viewerEmail,
      password,
      mobile,
      role: 'viewer',
    });

    const token = generateToken(newUser.id, 'viewer');

    return res.status(201).json({
      status: 'success',
      message: 'Viewer account created successfully!',
      data: {
        token,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      },
    });
  } catch (error) {
    console.error('REGISTER VIEWER ERROR:', error);
    next(error);
  }
};

/**
 * @desc    Viewer Login
 * @route   POST /api/viewers/login
 * @access  Public
 */
const loginViewer = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const viewerEmail = (email || '').trim().toLowerCase();
    if (!viewerEmail || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please enter both email address and password.',
      });
    }

    // Find User by email
    const user = await User.findOne({ where: { email: viewerEmail } });
    if (!user) {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid email address or password.',
      });
    }

    // Compare Password
    const isMatch = await user.validPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid email address or password.',
      });
    }

    const token = generateToken(user.id, user.role || 'user');

    return res.status(200).json({
      status: 'success',
      message: 'Logged in successfully!',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error('LOGIN VIEWER ERROR:', error);
    next(error);
  }
};

/**
 * @desc    Get Viewer Profile
 * @route   GET /api/viewers/profile
 * @access  Public / Private
 */
const getViewerProfile = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.query.userId || 1;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'Viewer profile not found.',
      });
    }

    return res.status(200).json({
      status: 'success',
      data: {
        user: user.toPublicJSON(),
      },
    });
  } catch (error) {
    console.error('GET VIEWER PROFILE ERROR:', error);
    next(error);
  }
};

module.exports = {
  registerViewer,
  loginViewer,
  getViewerProfile,
};
