const express = require('express');
const router = express.Router();
const { truecallerAuthViewer, truecallerCallback } = require('../controllers/truecaller.controller');

/**
 * @route   POST /api/auth/truecaller/viewer
 * @desc    Authenticate Askme Viewer via Truecaller
 * @access  Public
 */
router.post('/viewer', truecallerAuthViewer);

/**
 * @route   GET /api/auth/truecaller/callback
 * @desc    Truecaller OAuth / Web Callback Handler
 * @access  Public
 */
router.get('/callback', truecallerCallback);

module.exports = router;
