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
  getViewerQuestions,
  getPublicPastStreams,
} = require('../controllers/viewerController');
const {
  createVipSubscription,
  getViewerMemberships,
  // cancelVipMembership,
  getPublicVipPlans,
} = require('../controllers/vipController');
const { protect, optionalAuth } = require('../middlewares/authMiddleware');

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

/**
 * @route   GET /api/viewers/public/past-streams
 * @desc    Get All Past Broadcast Streams / Sessions for Viewers
 * @access  Public
 */
router.get('/public/past-streams', getPublicPastStreams);




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
router.post('/follow', protect, toggleFollowCreator);

/**
 * @route   GET /api/viewers/following
 * @desc    Get List of Followed Creators
 * @access  Public / Private
 */
router.get('/following', protect, getFollowingCreators);

/**
 * @route   POST /api/viewers/vip/subscribe
 * @desc    Create VIP Membership Subscription
 * @access  Public / Private
 */
router.post('/vip/subscribe', protect, createVipSubscription);

/**
 * @route   GET /api/viewers/vip/my-memberships
 * @desc    Get Viewer Active VIP Memberships
 * @access  Public / Private
 */
router.get('/vip/my-memberships', protect, getViewerMemberships);

/**
 * @route   GET /api/viewers/my-questions
 * @desc    Get All Questions / Donations Asked by Viewer
 * @access  Public / Private
 */
router.get('/my-questions', getViewerQuestions);

module.exports = router;
