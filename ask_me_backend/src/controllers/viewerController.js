const User = require('../models/userModel');
const generateToken = require('../utils/generateToken');
const bcrypt = require('bcryptjs');
const Follow = require("../models/FollowModel");
const CreatorsModel = require('../models/CreatorsModel');
const CreatorProfileModel = require('../models/CreatorProfileModel');
const CreatorSocialLinkModel = require('../models/CreatorSocialLinkModel');
const DonationSession = require('../models/DonationSessionModels');
const FollowModel = require('../models/FollowModel');
const Donation = require('../models/DonationModel');

const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
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
      phone: mobile,
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
 * @desc    Google OAuth Viewer Login / Register
 * @route   POST /api/viewers/google-auth
 * @access  Public
 */
const googleAuthViewer = async (req, res, next) => {
  try {
    const { idToken, credential, token, email, name, googleId } = req.body;
    let verifiedEmail = (email || '').trim().toLowerCase();
    let verifiedName = (name || '').trim();

    const incomingToken = idToken || credential || token;

    if (incomingToken) {
      if (process.env.GOOGLE_CLIENT_ID) {
        try {
          const ticket = await googleClient.verifyIdToken({
            idToken: incomingToken,
            audience: process.env.GOOGLE_CLIENT_ID,
          });
          const payload = ticket.getPayload();
          if (payload) {
            verifiedEmail = (payload.email || verifiedEmail).toLowerCase();
            verifiedName = payload.name || verifiedName;
          }
        } catch (tokenErr) {
          console.warn('Google ID Token verification note:', tokenErr.message);
        }
      }

      // If ID Token verification didn't yield an email (e.g. incomingToken is an OAuth access token starting with 'ya29.'),
      // query Google's UserInfo API endpoint directly using the incoming access token
      if (!verifiedEmail) {
        try {
          const userinfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${incomingToken}` },
          });
          if (userinfoRes.ok) {
            const googleProfile = await userinfoRes.json();
            if (googleProfile.email) {
              verifiedEmail = googleProfile.email.toLowerCase();
            }
            if (googleProfile.name) {
              verifiedName = googleProfile.name;
            }
          }
        } catch (userinfoErr) {
          console.warn('Google UserInfo API fetch note:', userinfoErr.message);
        }
      }
    }

    if (!verifiedEmail) {
      return res.status(400).json({
        status: 'fail',
        message: 'Google authentication email address is required.',
      });
    }

    if (!verifiedName) {
      verifiedName = verifiedEmail.split('@')[0] || 'Google Supporter';
    }

    let user = await User.findOne({ where: { email: verifiedEmail } }).catch(() => null);

    if (!user) {
      const randomPassword = 'G_' + Math.random().toString(36).slice(-8) + '!' + Date.now();
      user = await User.create({
        name: verifiedName,
        email: verifiedEmail,
        password: randomPassword,
        role: 'viewer',
      });
    }

    const jwtToken = generateToken(user.id, 'viewer');

    res.cookie('viewer_token', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      status: 'success',
      message: 'Authenticated with Google successfully!',
      data: {
        token: jwtToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error('GOOGLE AUTH VIEWER ERROR:', error);
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

    // 1. Fetch All Creators, Profiles, Socials, Sessions, Follows & Donations
    const creators = await CreatorsModel.findAll({ raw: true }).catch(() => []);
    const profiles = await CreatorProfileModel.findAll({ raw: true }).catch(() => []);
    const socialLinks = await CreatorSocialLinkModel.findAll({ raw: true }).catch(() => []);
    const sessions = await DonationSession.findAll({ raw: true }).catch(() => []);
    const follows = await FollowModel.findAll({ raw: true }).catch(() => []);
    const donations = await Donation.findAll({ raw: true }).catch(() => []);

    const followsMap = new Map();
    follows.forEach(f => {
      const cid = String(f.creator_id);
      followsMap.set(cid, (followsMap.get(cid) || 0) + 1);
    });

    const answeredMap = new Map();
    donations.forEach(d => {
      const cid = String(d.creator_id);
      if (d.status === 'answered' || d.status === 'completed' || d.payment_status === 'success') {
        answeredMap.set(cid, (answeredMap.get(cid) || 0) + 1);
      }
    });

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
      const dynamicFollowers = followsMap.get(cid) !== undefined ? followsMap.get(cid) : parseInt(profile.followers_count || 0);
      const dynamicAnswered = answeredMap.get(cid) !== undefined ? answeredMap.get(cid) : parseInt(profile.answered_count || 0);

      return {
        creatorId: c.id,
        fullName: c.full_name || '',
        username: `@${cleanUsername}`,
        cleanUsername: cleanUsername,
        avatar: (profile.profile_image && profile.profile_image.trim()) || (profile.profileImage && profile.profileImage.trim()) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        bio: profile.bio || '',
        category: latestSession?.category || profile.category || 'Gaming',
        minFee: parseFloat(profile.min_fee || latestSession?.min_donation_amount || 50),
        followersCount: dynamicFollowers,
        rating: parseFloat(profile.rating || 4.85),
        answeredCount: dynamicAnswered,
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
          category: latestSession.category || 's',
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
      const catLower = category.toLowerCase().trim();
      feedItems = feedItems.filter(item => {
        const itemCat = String(item.category || '').toLowerCase();
        const sessionCat = String(item.session?.category || '').toLowerCase();
        return (
          (itemCat && (itemCat.includes(catLower) || catLower.includes(itemCat))) ||
          (sessionCat && (sessionCat.includes(catLower) || catLower.includes(sessionCat)))
        );
      });
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

    // Extract dynamic categories from profiles & sessions
    // const categorySet = new Set(['All']);
    // creators.forEach(c => {
    //   const cid = String(c.id);
    //   const profile = profileMap.get(cid) || {};
    //   const creatorSessions = sessions.filter(s => String(s.creator_id) === cid);
    //   if (profile.category) categorySet.add(profile.category.trim());
    //   creatorSessions.forEach(s => {
    //     if (s.category) categorySet.add(s.category.trim());
    //   });
    // });
    // // ['Gaming', 'News', 'Tech', 'Education', 'Comedy', 'Music', 'Business', 'Fitness', 'Entertainment'].forEach(cat => categorySet.add(cat));
    // const dynamicCategories = Array.from(categorySet);
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
        // categories: dynamicCategories,
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

    const creators = await CreatorsModel.findAll({ raw: true }).catch(() => []);
    const creator = creators.find(c => String(c.username || '').toLowerCase() === targetUsername || String(c.id) === targetUsername);

    if (!creator) {
      return res.status(404).json({
        status: 'fail',
        message: `Creator @${targetUsername} not found.`,
      });
    }

    const profile = await CreatorProfileModel.findOne({ where: { creator_id: creator.id }, raw: true }).catch(() => null);
    const socials = await CreatorSocialLinkModel.findAll({ where: { creator_id: creator.id }, raw: true }).catch(() => []);
    const sessions = await DonationSession.findAll({ where: { creator_id: creator.id }, raw: true }).catch(() => []);
    // Get total followers
    const followCount = await FollowModel.count({
      where: {
        creator_id: creator.id,
      },
    }).catch(() => 0);
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
          country: creator.country || '',
          followersCount: followCount,
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
    const userId = req.user?.id || req.body.userId || req.query.userId;
    const { creatorId } = req.body;

    console.log("Authenticated User:", req.user);
    console.log("Viewer ID:", userId);
    console.log("Creator ID:", creatorId);

    if (!userId) {
      return res.status(401).json({
        status: "fail",
        message: "Viewer authentication required.",
      });
    }

    if (!creatorId) {
      return res.status(400).json({
        status: "fail",
        message: "creatorId is required.",
      });
    }

    // Prevent creator following himself
    if (String(userId) === String(creatorId)) {
      return res.status(400).json({
        status: "fail",
        message: "You cannot follow yourself.",
      });
    }

    // Check creator exists
    const creator = await CreatorsModel.findByPk(creatorId);

    if (!creator) {
      return res.status(404).json({
        status: "fail",
        message: "Creator not found.",
      });
    }

    // Check existing follow
    const existingFollow = await Follow.findOne({
      where: {
        viewer_id: userId,
        creator_id: creatorId,
      },
    });

    let isFollowing;

    if (existingFollow) {
      await existingFollow.destroy();
      isFollowing = false;
    } else {
      await Follow.create({
        viewer_id: userId,
        creator_id: creatorId,
      });

      isFollowing = true;
    }

    const followingCount = await Follow.count({
      where: {
        viewer_id: userId,
      },
    });

    return res.status(200).json({
      status: "success",
      isFollowing,
      followingCount,
      message: isFollowing
        ? "Creator followed!"
        : "Creator unfollowed.",
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

/**
 * @desc    Get All Live Questions / Donations Asked by Viewer
 * @route   GET /api/viewers/my-questions
 * @access  Public / Private
 */
const getViewerQuestions = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.query.userId || req.query.viewerId;
    const viewerEmail = req.user?.email || req.query.email;
    const sessionId = req.query.sessionId || req.params.sessionId;
    const { Op } = require('sequelize');

    let DonationModel = null;
    try { DonationModel = require('../models/DonationModel'); } catch (e) { }

    let questions = [];

    if (DonationModel) {
      let whereClause = { payment_status: 'success' };
      if (sessionId) {
        whereClause.session_id = sessionId;
      }
      if (userId && viewerEmail) {
        whereClause[Op.or] = [
          { viewer_id: String(userId) },
          { viewer_email: viewerEmail }
        ];
      } else if (userId) {
        whereClause.viewer_id = String(userId);
      } else if (viewerEmail) {
        whereClause.viewer_email = viewerEmail;
      }

      const records = await DonationModel.findAll({
        where: whereClause,
        order: [['created_at', 'DESC']],
        limit: 100
      });

      const creators = await CreatorsModel.findAll({ raw: true }).catch(() => []);
      const sessions = await DonationSession.findAll({ raw: true }).catch(() => []);
      const creatorMap = new Map();
      const sessionMap = new Map();

      creators.forEach(c => creatorMap.set(String(c.id), c));
      sessions.forEach(s => sessionMap.set(String(s.id), s));

      questions = records.map(d => {
        const creatorObj = creatorMap.get(String(d.creator_id)) || {};
        const sessionObj = sessionMap.get(String(d.session_id)) || {};
        return {
          id: d.id,
          donationUuid: d.donation_uuid,
          creatorId: d.creator_id,
          creatorName: creatorObj.full_name || 'Live Creator Host',
          creatorAvatar: creatorObj.profile_image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          sessionTitle: sessionObj.title || 'Live Broadcast Session',
          sessionCode: sessionObj.session_code || '',
          sessionStatus: sessionObj.status || 'closed',
          amount: parseFloat(d.amount || 0),
          message: d.message || '',
          paidAt: d.paid_at || d.createdAt,
          isVip: !!d.is_vip,
          status: d.status || 'not_read',
        };
      });

      if (!sessionId) {
        questions = questions.filter(q => q.sessionStatus === 'active');
      }
    }

    return res.status(200).json({
      status: 'success',
      data: {
        questions,
        totalQuestions: questions.length
      }
    });
  } catch (error) {
    console.error('GET VIEWER QUESTIONS ERROR:', error);
    next(error);
  }
};

/**
 * @desc    Get All Past Broadcast Streams / Sessions for Viewers
 * @route   GET /api/viewers/public/past-streams
 * @access  Public
 */
const getPublicPastStreams = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    const userId = req.user?.id || req.query.userId || req.query.viewerId;
    const viewerEmail = req.user?.email || req.query.email;
    const { Op } = require('sequelize');

    let DonationModel = null;
    try { DonationModel = require('../models/DonationModel'); } catch (e) { }

    let targetSessionIds = new Set();
    let viewerQuestionsBySession = new Map();

    if (DonationModel && (userId || viewerEmail)) {
      let whereClause = { payment_status: 'success' };
      if (userId && viewerEmail) {
        whereClause[Op.or] = [
          { viewer_id: String(userId) },
          { viewer_email: viewerEmail }
        ];
      } else if (userId) {
        whereClause.viewer_id = String(userId);
      } else if (viewerEmail) {
        whereClause.viewer_email = viewerEmail;
      }

      const viewerDonations = await DonationModel.findAll({
        where: whereClause,
        order: [['created_at', 'DESC']]
      }).catch(() => []);

      viewerDonations.forEach(d => {
        if (d.session_id) {
          const sId = String(d.session_id);
          targetSessionIds.add(sId);
          viewerQuestionsBySession.set(sId, (viewerQuestionsBySession.get(sId) || 0) + 1);
        }
      });
    }

    let pastSessions = [];

    if (DonationSession) {
      if (targetSessionIds.size > 0) {
        pastSessions = await DonationSession.findAll({
          where: {
            id: { [Op.in]: Array.from(targetSessionIds) }
          },
          order: [['started_at', 'DESC'], ['created_at', 'DESC']],
          limit: 50,
        });
      } else if (!userId && !viewerEmail) {
        pastSessions = await DonationSession.findAll({
          order: [['started_at', 'DESC'], ['created_at', 'DESC']],
          limit: 50,
        });
      }
    }

    const creators = await CreatorsModel.findAll({ raw: true }).catch(() => []);
    const profiles = await CreatorProfileModel.findAll({ raw: true }).catch(() => []);
    const creatorMap = new Map();
    const profileMap = new Map();

    creators.forEach(c => creatorMap.set(String(c.id), c));
    profiles.forEach(p => profileMap.set(String(p.creator_id), p));

    let formatted = await Promise.all(pastSessions.map(async (s) => {
      const creatorObj = creatorMap.get(String(s.creator_id)) || {};
      const profileObj = profileMap.get(String(s.creator_id)) || {};
      const cleanUsername = String(creatorObj.username || 'creator').replace(/^@+/, '');

      const askedByViewerCount = viewerQuestionsBySession.get(String(s.id)) || 0;

      let questionCount = s.total_donations || 0;
      if (DonationModel) {
        questionCount = await DonationModel.count({
          where: { session_id: s.id, payment_status: 'success' }
        }).catch(() => s.total_donations || 0);
      }

      return {
        id: s.id,
        sessionCode: s.session_code,
        title: s.title || `${creatorObj.full_name || 'Creator'}'s Live Session`,
        category: s.category || profileObj.category || 'General',
        description: s.description || '',
        thumbnailUrl: s.thumbnail_url || profileObj.profile_image || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80',
        streamUrl: s.stream_url || '',
        streamingPlatform: s.streaming_platform || s.platform || 'YouTube Live',
        status: s.status || 'closed',
        startedAt: s.started_at || s.createdAt,
        endedAt: s.ended_at || s.ends_at || s.updatedAt,
        totalDonations: questionCount || s.total_donations || 0,
        viewerQuestionsCount: askedByViewerCount,
        totalAmount: s.total_amount || 0,
        creator: {
          id: s.creator_id,
          fullName: creatorObj.full_name || 'Live Creator',
          username: `@${cleanUsername}`,
          avatar: profileObj.profile_image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        }
      };
    }));

    if (category && category.toLowerCase() !== 'all') {
      const catLower = category.toLowerCase();
      formatted = formatted.filter(item => item.category.toLowerCase().includes(catLower));
    }

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      formatted = formatted.filter(item =>
        item.title.toLowerCase().includes(q) ||
        item.creator.fullName.toLowerCase().includes(q) ||
        item.creator.username.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    }

    return res.status(200).json({
      status: 'success',
      data: {
        sessions: formatted,
        totalSessions: formatted.length
      }
    });
  } catch (error) {
    console.error('GET PUBLIC PAST STREAMS ERROR:', error);
    next(error);
  }
};

/**
 * @desc    Get Dynamic Categories List for Viewers
 * @route   GET /api/viewers/public/categories
 * @access  Public
 */
const getPublicCategories = async (req, res, next) => {
  try {

    const profiles = await CreatorProfileModel.findAll({ raw: true }).catch(() => []);
    const sessions = await DonationSession.findAll({ raw: true }).catch(() => []);

    const categorySet = new Set();
    categorySet.add("All");

    profiles.forEach(p => {
      if (p.category && String(p.category).trim()) {
        categorySet.add(String(p.category).trim());
      }
    });

    sessions.forEach(s => {
      if (s.category && String(s.category).trim()) {
        categorySet.add(String(s.category).trim());
      }
    });

    const categories = Array.from(categorySet);

    return res.status(200).json({
      status: "success",
      total: categories.length,
      categories,
    });
  } catch (error) {
    console.error("GET PUBLIC CATEGORIES ERROR:", error);
    next(error);
  }
};

module.exports = {
  registerViewer,
  loginViewer,
  googleAuthViewer,
  getViewerProfile,
  getPublicLiveFeed,
  getCreatorPublicProfile,
  toggleFollowCreator,
  getFollowingCreators,
  getViewerQuestions,
  getPublicPastStreams,
  getPublicCategories,
};
