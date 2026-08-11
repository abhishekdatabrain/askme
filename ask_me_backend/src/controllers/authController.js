const User = require('../models/userModel');
const generateToken = require('../utils/generateToken');

/**
 * Static User Credentials for testing / demonstration
 */
const STATIC_USERS = [
  {
    id: 999,
    name: 'Admin User',
    email: 'admin@askme.com',
    password: 'admin123',
    role: 'admin',
    avatar: '',
    bio: 'System Administrator',
  },
  {
    id: 998,
    name: 'Tech Burner',
    email: 'creator@techburner.in',
    password: 'password123',
    role: 'creator',
    avatar: '',
    bio: 'Tech Content Creator',
  },
  {
    id: 997,
    name: 'Demo User',
    email: 'user@askme.com',
    password: 'password123',
    role: 'user',
    avatar: '',
    bio: 'Standard User Account',
  },
];

/**
 * @desc    Register a new user (Sequelize ORM + PostgreSQL)
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = async (req, res, next) => {
  try {
    const { name, fullname, email, password, role, bio } = req.body;
    const userName = name || fullname || 'User';

    // 1. Check if user already exists in database via Sequelize ORM
    const existingUser = await User.findOne({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return res.status(409).json({
        status: 'fail',
        message: 'User already exists with this email address',
      });
    }

    // 2. Create new user record (Password automatically hashed via Sequelize beforeCreate hook)
    const newUser = await User.create({
      name: userName,
      email: email.toLowerCase(),
      password,
      role: role || 'user',
      bio: bio || '',
    });

    // 3. Generate JWT Token
    const token = generateToken(newUser.id, newUser.role);

    // 4. Return HTTP 201 Created with sanitized public user details
    return res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: {
        user: newUser.toPublicJSON(),
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login User (Checks static user credentials & database)
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase();

    // 1. Check Static Credentials
    const staticUser = STATIC_USERS.find(
      (u) => u.email.toLowerCase() === normalizedEmail && u.password === password
    );

    if (staticUser) {
      const { password: _, ...publicStaticUser } = staticUser;
      const token = generateToken(staticUser.id, staticUser.role);
      return res.status(200).json({
        status: 'success',
        message: 'Login successful',
        data: {
          user: publicStaticUser,
          token,
        },
      });
    }

    // 2. Check Database via Sequelize ORM
    let user;
    try {
      user = await User.findOne({ where: { email: normalizedEmail } });
    } catch (dbErr) {
      console.warn('DB lookup failed during login:', dbErr.message);
    }

    if (user && (await user.validPassword(password))) {
      const token = generateToken(user.id, user.role);
      return res.status(200).json({
        status: 'success',
        message: 'Login successful',
        data: {
          user: user.toPublicJSON(),
          token,
        },
      });
    }

    // 3. Return 401 Unauthorized if credentials do not match
    return res.status(401).json({
      status: 'fail',
      message: 'Invalid email or password',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  STATIC_USERS,
};
