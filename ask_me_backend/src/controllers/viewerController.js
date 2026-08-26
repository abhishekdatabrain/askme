const User = require('../models/userModel');
const generateToken = require('../utils/generateToken');
const bcrypt = require('bcryptjs');
const Follow = require("../models/FollowModel");
const CreatorsModel = require('../models/CreatorsModel');
const CreatorProfileModel = require('../models/CreatorProfileModel');
const CreatorSocialLinkModel = require('../models/CreatorSocialLinkModel');
const DonationSession = require('../models/DonationSessionModels');
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
        user: user.toPublicJSON ? user.toPublicJSON() : { id: user.id, name: user.name, email: user.email },
      },
    });
  } catch (error) {
    console.error('GET VIEWER PROFILE ERROR:', error);
    next(error);
  }
};

// In-memory Follow Store
const viewerFollowsMap = new Map(); // key: userId, value: Set of creatorIds

/**
 * @desc    Get Public Live Feed & Discover Creators
 * @route   GET /api/viewers/public/live-feed
 * @access  Public
 */
const getPublicLiveFeed = async (req, res, next) => {
  try {
    const { category, search, platform } = req.query;

    // 1. Fetch All Creators
    const creators = await CreatorsModel.findAll({ raw: true }).catch(() => []);
    const profiles = await CreatorProfileModel.findAll({ raw: true }).catch(() => []);
    const socialLinks = await CreatorSocialLinkModel.findAll({ raw: true }).catch(() => []);
    const sessions = await DonationSession.findAll({ raw: true }).catch(() => []);

    const profileMap = new Map(profiles.map(p => [String(p.creator_id), p]));

    // Map social links by creator_id
    const socialMap = new Map();
    socialLinks.forEach(s => {
      const cid = String(s.creator_id);
      if (!socialMap.has(cid)) socialMap.set(cid, []);
      socialMap.get(cid).push({
        platform: s.platform,
        url: s.profile_url || s.url,
      });
    });

    // 2. Build Feed List
    let feedItems = creators.map(c => {
      const cid = String(c.id);
      const profile = profileMap.get(cid) || {};
      const creatorSocials = socialMap.get(cid) || [];

      // Find active or recent session for this creator
      const creatorSessions = sessions.filter(s => String(s.creator_id) === cid);
      const activeSession = creatorSessions.find(s => s.status === 'active');
      const latestSession = activeSession || creatorSessions.sort((a, b) => new Date(b.created_at || b.createdAt || 0) - new Date(a.created_at || a.createdAt || 0))[0];

      // Format handle
      const cleanUsername = String(c.username || 'creator').replace(/^@+/, '');

      return {
        creatorId: c.id,
        fullName: c.full_name || 'Creator',
        username: `@${cleanUsername}`,
        cleanUsername: cleanUsername,
        avatar: profile.profile_image || profile.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        bio: profile.bio || 'Pro Esports player streaming GTA V, Valorant & BGMI. Ask about settings, sensitivity & pro tips!',
        category: latestSession?.category || profile.category || 'Gaming',
        minFee: parseFloat(profile.min_fee || latestSession?.min_donation_amount || 50),
        followersCount: parseInt(profile.followers_count || 2100000),
        rating: parseFloat(profile.rating || 4.85),
        answeredCount: parseInt(profile.answered_count || 440),
        isVerified: profile.is_verified !== false,
        paidMailEnabled: profile.paid_mail_enabled !== false,
        paidMailLink: profile.paid_mail_link || null,
        vipMembershipEnabled: profile.vip_membership_enabled !== false,
        vipMembershipLink: profile.vip_membership_link || null,
        isLive: !!activeSession,
        session: latestSession ? {
          id: latestSession.id,
          sessionCode: latestSession.session_code,
          title: latestSession.title || `${c.full_name}'s Live AMA Session`,
          category: latestSession.category || 'Gaming',
          description: latestSession.description || 'Pro Esports player streaming GTA V, Valorant & BGMI. Ask about settings, sensitivity & pro tips!',
          platform: latestSession.platform || latestSession.streaming_platform || 'YouTube',
          thumbnail: latestSession.thumbnail_url || profile.profile_image || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80',
          streamUrl: latestSession.stream_url || '',
          startedAt: latestSession.started_at || latestSession.created_at,
          status: latestSession.status,
          minDonationAmount: parseFloat(latestSession.min_donation_amount || profile.min_fee || 50),
          totalQuestions: Math.floor(45 + (c.id * 23) % 65),
          pendingQueue: Math.floor(10 + (c.id * 7) % 25),
        } : null,
        socialLinks: creatorSocials.length > 0 ? creatorSocials : [
          { platform: 'YouTube', url: 'https://youtube.com' },
          { platform: 'Twitch', url: 'https://twitch.tv' },
        ],
      };
    });

    // 3. Filter by Category
    if (category && category.toLowerCase() !== 'all') {
      const catLower = category.toLowerCase();
      feedItems = feedItems.filter(item =>
        item.category.toLowerCase().includes(catLower) ||
        (item.session && item.session.category.toLowerCase().includes(catLower))
      );
    }

    // 4. Filter by Search Query
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      feedItems = feedItems.filter(item =>
        item.fullName.toLowerCase().includes(q) ||
        item.username.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        (item.session && item.session.title.toLowerCase().includes(q))
      );
    }

    // 5. Filter by Platform
    if (platform && platform.toLowerCase() !== 'all') {
      const pLower = platform.toLowerCase();
      feedItems = feedItems.filter(item =>
        item.session && item.session.platform.toLowerCase().includes(pLower)
      );
    }

    // 6. Relevance Sorting (Live active broadcasts first, then highest followers, then recency)
    feedItems.sort((a, b) => {
      // 1. Live status priority
      if (a.isLive && !b.isLive) return -1;
      if (!a.isLive && b.isLive) return 1;

      // 2. Followers count priority
      const followersDiff = (b.followersCount || 0) - (a.followersCount || 0);
      if (followersDiff !== 0) return followersDiff;

      // 3. Recency priority (Session start timestamp)
      const timeA = new Date(a.session?.startedAt || 0).getTime();
      const timeB = new Date(b.session?.startedAt || 0).getTime();
      return timeB - timeA;
    });

    return res.status(200).json({
      status: 'success',
      total: feedItems.length,
      data: {
        creators: feedItems,
        activeLiveCount: feedItems.filter(i => i.isLive).length,
      },
    });
  } catch (error) {
    console.error('GET PUBLIC LIVE FEED ERROR:', error);
    next(error);
  }
};

/**
 * @desc    Get Public Creator Profile by Username
 * @route   GET /api/viewers/public/creators/:username
 * @access  Public
 */
const getCreatorPublicProfile = async (req, res, next) => {
  try {
    const targetUsername = String(req.params.username || '').replace(/^@+/, '').toLowerCase();

    const CreatorsModel = require('../models/CreatorsModel');
    const CreatorProfileModel = require('../models/CreatorProfileModel');
    const CreatorSocialLinkModel = require('../models/CreatorSocialLinkModel');
    const DonationSession = require('../models/DonationSessionModels');

    const creators = await CreatorsModel.findAll({ raw: true }).catch(() => []);
    const creator = creators.find(c => String(c.username || '').toLowerCase() === targetUsername || String(c.id) === targetUsername);

    if (!creator) {
      return res.status(404).json({
        status: 'fail',
        message: `Creator @${targetUsername} not found.`,
      });
    }

    const cid = String(creator.id);
    const profile = await CreatorProfileModel.findOne({ where: { creator_id: creator.id }, raw: true }).catch(() => null);
    const socials = await CreatorSocialLinkModel.findAll({ where: { creator_id: creator.id }, raw: true }).catch(() => []);
    const sessions = await DonationSession.findAll({ where: { creator_id: creator.id }, raw: true }).catch(() => []);

    const activeSession = sessions.find(s => s.status === 'active');
    const pastSessions = sessions
      .filter(s => s.status !== 'active')
      .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

    return res.status(200).json({
      status: 'success',
      data: {
        creator: {
          id: creator.id,
          fullName: creator.full_name,
          username: `@${creator.username}`,
          cleanUsername: creator.username,
          avatar: profile?.profile_image || profile?.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          bio: profile?.bio || 'Official AskMe Studio Creator',
          category: profile?.category || 'Content Creator',
          country: creator.country || 'India',
          followersCount: Math.floor(1500 + (creator.id * 347) % 8500),
          isLive: !!activeSession,
          activeSession: activeSession ? {
            id: activeSession.id,
            sessionCode: activeSession.session_code,
            title: activeSession.title,
            category: activeSession.category,
            description: activeSession.description,
            thumbnail: activeSession.thumbnail_url,
            platform: activeSession.platform || activeSession.streaming_platform || 'YouTube',
            streamUrl: activeSession.stream_url,
            startedAt: activeSession.started_at,
          } : null,
          socialLinks: socials.map(s => ({ platform: s.platform, url: s.platform_url || s.url })),
          pastSessions: pastSessions.map(s => ({
            id: s.id,
            sessionCode: s.session_code,
            title: s.title,
            category: s.category,
            platform: s.platform || 'YouTube',
            createdAt: s.created_at || s.createdAt,
            status: s.status,
          })),
        },
      },
    });
  } catch (error) {
    console.error('GET CREATOR PUBLIC PROFILE ERROR:', error);
    next(error);
  }
};

/**
 * @desc    Toggle Follow Creator
 * @route   POST /api/viewers/follow
 * @access  Public / Private
 */
const toggleFollowCreator = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.body.userId || 1;
    const creatorId = req.body.creatorId;

    if (!creatorId) {
      return res.status(400).json({
        status: "fail",
        message: "creatorId is required.",
      });
    }

    // Check if already following
    const existingFollow = await Follow.findOne({
      where: {
        viewer_id: userId,
        creator_id: creatorId,
      },
    });

    let isFollowing;

    if (existingFollow) {
      // Unfollow
      await existingFollow.destroy();
      isFollowing = false;
    } else {
      // Follow
      await Follow.create({
        viewer_id: userId,
        creator_id: creatorId,
      });

      isFollowing = true;
    }

    // Get total following count
    const followingCount = await Follow.count({
      where: {
        viewer_id: userId,
      },
    });

    return res.status(200).json({
      status: "success",
      isFollowing,
      message: isFollowing
        ? "Creator followed!"
        : "Creator unfollowed.",
      followingCount,
    });
  } catch (error) {
    console.error("TOGGLE FOLLOW ERROR:", error);
    next(error);
  }
};

/**
 * @desc    Get Followed Creators for Viewer
 * @route   GET /api/viewers/following
 * @access  Public / Private
 */
const getFollowingCreators = async (req, res, next) => {
  try {
    // Get user from authenticated JWT or query param
    const userId = req.user?.id || req.query.userId;

    if (!userId) {
      return res.status(200).json({
        status: "success",
        followingIds: [],
      });
    }

    // Get all creators followed by this user
    const follows = await Follow.findAll({
      where: {
        viewer_id: userId,
      },
      attributes: ["creator_id"],
      order: [["created_at", "DESC"]],
    });

    const followingIds = follows.map((follow) =>
      String(follow.creator_id)
    );

    return res.status(200).json({
      status: "success",
      followingIds,
    });
  } catch (error) {
    console.error("GET FOLLOWING ERROR:", error);
    next(error);
  }
};

module.exports = {
  registerViewer,
  loginViewer,
  getViewerProfile,
  getPublicLiveFeed,
  getCreatorPublicProfile,
  toggleFollowCreator,
  getFollowingCreators,
};
