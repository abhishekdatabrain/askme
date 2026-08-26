const express = require('express');
const router = express.Router();
const {
  registerViewer,
  loginViewer,
  getViewerProfile,
  getPublicLiveFeed,
  getCreatorPublicProfile,
  toggleFollowCreator,
  getFollowingCreators,
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

/**
 * @route   GET /api/viewers/public/live-feed
 * @desc    Get Public Live Stream & Creator Feed
 * @access  Public
 */
router.get('/public/live-feed', getPublicLiveFeed);

/**
 * @route   GET /api/viewers/public/creators/:username
 * @desc    Get Creator Public Profile
 * @access  Public
 */
router.get('/public/creators/:username', getCreatorPublicProfile);

const { optionalAuth } = require('../middlewares/authMiddleware');

const {
  createVipSubscription,
  getViewerMemberships,
  cancelVipMembership,
  getPublicVipPlans,
} = require('../controllers/vipController');

/**
 * @route   GET /api/viewers/vip/plans
 * @desc    Get Public Active VIP Plans
 * @access  Public
 */
router.get('/vip/plans', getPublicVipPlans);

/**
 * @route   POST /api/viewers/follow
 * @desc    Follow / Unfollow Creator
 * @access  Public / Private
 */
router.post('/follow', optionalAuth, toggleFollowCreator);

/**
 * @route   GET /api/viewers/following
 * @desc    Get List of Followed Creators
 * @access  Public / Private
 */
router.get('/following', optionalAuth, getFollowingCreators);

/**
 * @route   POST /api/viewers/vip/subscribe
 * @desc    Create VIP Membership Subscription
 * @access  Public / Private
 */
router.post('/vip/subscribe', optionalAuth, createVipSubscription);

/**
 * @route   GET /api/viewers/vip/my-memberships
 * @desc    Get Viewer Active VIP Memberships
 * @access  Public / Private
 */
router.get('/vip/my-memberships', optionalAuth, getViewerMemberships);

/**
 * @route   POST /api/viewers/vip/cancel
 * @desc    Cancel VIP Membership
 * @access  Public / Private
 */
router.post('/vip/cancel', optionalAuth, cancelVipMembership);

module.exports = router;
