const express = require('express');
const router = express.Router();
const {
  registerViewer,
  loginViewer,
  getViewerProfile,
} = require('../controllers/viewerController');

/**
 * @route   POST /api/viewers/register
 * @desc    Register a new Viewer
 * @access  Public
 */
router.post('/register', registerViewer);

/**
 * @route   POST /api/viewers/login
 * @desc    Viewer Login
 * @access  Public
 */
router.post('/login', loginViewer);

/**
 * @route   GET /api/viewers/profile
 * @desc    Get Viewer Profile
 * @access  Public / Private
 */
router.get('/profile', getViewerProfile);

module.exports = router;
