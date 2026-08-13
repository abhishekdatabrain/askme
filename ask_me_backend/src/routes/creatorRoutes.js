const express = require('express');
const router = express.Router();
const { registerCreator, loginCreator, submitKyc, getKycStatus } = require('../controllers/creatorController');

/**
 * @route   POST /api/creators/register
 * @desc    Register a new Creator
 * @access  Public
 */
router.post('/register', registerCreator);

/**
 * @route   POST /api/creators/login
 * @desc    Creator Login against creators table
 * @access  Public
 */
router.post('/login', loginCreator);

/**
 * @route   POST /api/creators/kyc
 * @desc    Submit KYC verification & Bank account details
 * @access  Public / Private
 */
router.post('/kyc', submitKyc);

/**
 * @route   GET /api/creators/kyc/status
 * @desc    Get Creator's KYC Verification status
 * @access  Public / Private
 */
router.get('/kyc/status', getKycStatus);

module.exports = router;
