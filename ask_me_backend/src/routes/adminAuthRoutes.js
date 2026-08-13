const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/adminAuthController');
const { registerCreator } = require('../controllers/creatorController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const {
  registerValidationRules,
  loginValidationRules,
  validate,
} = require('../middlewares/validateMiddleware');

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user in "Abhishek".users table
 * @access  Public
 */
// router.post('/register', registerValidationRules, validate, registerUser);

/**
 * @route   POST /api/auth/creator/register
 * @desc    Register a new creator in creators table
 * @access  Public
 */
router.post('/creator/register', registerCreator);

/**
 * @route   POST /api/auth/login
 * @desc    Login user (DB or static fallback)
 * @access  Public
 */
// router.post('/login', loginValidationRules, validate, loginUser);
router.post(
  "/register",
  register
);


// Login
router.post(
  "/login",
  login
);
/**
 * @route   GET /api/auth/me
 * @desc    Get authenticated user profile
 * @access  Private (Authenticated)
 */
// router.get('/me', protect, getMe);

/**
 * @route   GET /api/auth/admin-only
 * @desc    Example Admin-Only Authorized Route (Demonstrates RBAC)
 * @access  Private (Admin Role Only)
 */
router.get('/admin-only', protect, authorize('admin'), (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Welcome Admin! You have accessed an authorized Admin-Only route.',
    data: { user: req.user },
  });
});

module.exports = router;
