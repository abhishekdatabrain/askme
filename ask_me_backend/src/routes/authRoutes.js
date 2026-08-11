const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');
const {
  registerValidationRules,
  loginValidationRules,
  validate,
} = require('../middlewares/validateMiddleware');

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', registerValidationRules, validate, registerUser);

/**
 * @route   POST /api/auth/login
 * @desc    Login user with static or DB credentials
 * @access  Public
 */
router.post('/login', loginValidationRules, validate, loginUser);

module.exports = router;
