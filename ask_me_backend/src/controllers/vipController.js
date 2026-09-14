const { Op } = require("sequelize");
const VipMembership = require("../models/VipMembershipModel");
const Creator = require("../models/CreatorsModel");
const VipPlan = require("../models/VipPlanModel");

// In-memory fallback map for VIP memberships in development mode
const vipMemoryStore = new Map();

/**
 * @desc    Create / Purchase VIP Membership Subscription
 * @route   POST /api/viewers/vip/subscribe
 * @access  Public / Private
 */
const createVipSubscription = async (req, res, next) => {
  try {
    const userId = String(req.user?.id || req.body.userId);
    const { creatorId, planName, amount, duration, interval, transactionId } = req.body;
    if (!creatorId) {
      return res.status(400).json({
        status: "fail",
        message: "creatorId is required.",
      });
    }

    const subAmount = parseFloat(amount || "");
    const subPlanName = planName;
    const subDuration = duration;
    const subInterval = interval;
    const subTxnId = transactionId || `pay_${Math.random().toString(36).substring(2, 11).toUpperCase()}`;

    const getNextBillingDate = (duration) => {
      const nextBilling = new Date();

      const match = duration.match(/(\d+)\s*(Day|Days|Month|Months|Year|Years)/i);

      if (!match) {
        throw new Error("Invalid duration format");
      }

      const value = parseInt(match[1]);
      const unit = match[2].toLowerCase();

      if (unit.startsWith("day")) {
        nextBilling.setDate(nextBilling.getDate() + value);
      }
      else if (unit.startsWith("month")) {
        nextBilling.setMonth(nextBilling.getMonth() + value);
      }
      else if (unit.startsWith("year")) {
        nextBilling.setFullYear(nextBilling.getFullYear() + value);
      }

      return nextBilling.toISOString().split("T")[0];
    };

    const nextBillingStr = getNextBillingDate(subDuration);


    let membership = null;

    try {
      // Try database creation
      const existing = await VipMembership.findOne({
        where: {
          viewer_id: userId,
          creator_id: creatorId,
        },
      });

      if (existing) {
        existing.status = "active";
        existing.amount = subAmount;
        existing.duration = subDuration;
        existing.interval = subInterval;
        existing.transaction_id = subTxnId;
        existing.next_billing_date = nextBillingStr;
        await existing.save();
        membership = existing.toJSON();
      } else {
        const created = await VipMembership.create({
          viewer_id: userId,
          creator_id: creatorId,
          plan_name: subPlanName,
          amount: subAmount,
          status: "active",
          duration: subDuration,
          interval: subInterval,
          transaction_id: subTxnId,
          next_billing_date: nextBillingStr,
        });
        membership = created.toJSON();
      }
    } catch (dbErr) {
      console.warn("DB VipMembership write fallback to memory store:", dbErr.message);

    }

    return res.status(200).json({
      status: "success",
      message: "Congratulations! You are now a VIP Member!",
      data: {
        membership,
        vipBadge: true,
      },
    });
  } catch (error) {
    console.error("VIP SUBSCRIBE ERROR:", error);
    next(error);
  }
};

/**
 * @desc    Get Viewer Active VIP Memberships
 * @route   GET /api/viewers/vip/my-memberships
 * @access  Public / Private
 */
const getViewerMemberships = async (req, res, next) => {
  try {
    const userId = String(req.user?.id || req.query.userId);

    let memberships = [];

    try {
      // Auto-expire active memberships whose next_billing_date has passed today
      const todayStr = new Date().toISOString().split("T")[0];
      await VipMembership.update(
        { status: "expired" },
        {
          where: {
            status: "active",
            next_billing_date: {
              [Op.lt]: todayStr,
            },
          },
        }
      ).catch((err) => console.warn("Auto-expire check notice:", err.message));

      const records = await VipMembership.findAll({
        where: {
          viewer_id: userId,
        },
        order: [["created_at", "DESC"]],
      });
      memberships = records.map((r) => r.toJSON());
    } catch (dbErr) {
      console.warn("DB VipMembership read fallback to memory store:", dbErr.message);
      for (const [key, val] of vipMemoryStore.entries()) {
        if (key.startsWith(`${userId}_`)) {
          memberships.push(val);
        }
      }
    }

    // Attach creator details and plan perks if available
    const creators = await Creator.findAll({ raw: true }).catch(() => []);
    const creatorMap = new Map();
    creators.forEach((c) => creatorMap.set(String(c.id), c));

    let plans = [];
    if (VipPlan) {
      plans = await VipPlan.findAll({ raw: true }).catch(() => []);
    }
    const planMap = new Map();
    plans.forEach((p) => {
      planMap.set(String(p.id), p);
      if (p.creator_id) planMap.set(`creator_${p.creator_id}`, p);
    });

    const enrichedMemberships = memberships.map((m) => {
      const creatorObj = creatorMap.get(String(m.creator_id)) || {};
      const cleanUsername = String(creatorObj.username || "creator").replace(/^@+/, "");
      const planObj = (m.plan_id ? planMap.get(String(m.plan_id)) : null) || planMap.get(`creator_${m.creator_id}`) || {};
      const perks = m.perks || planObj.perks;

      // Calculate remaining validity days until next_billing_date
      let daysRemaining = 0;
      if (m.next_billing_date) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const billingDate = new Date(m.next_billing_date);
        billingDate.setHours(0, 0, 0, 0);
        const diffMs = billingDate.getTime() - today.getTime();
        daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
      }

      const isExpired = m.status === 'expired' || (daysRemaining <= 0 && m.next_billing_date && new Date(m.next_billing_date) < new Date());
      const effectiveStatus = isExpired ? 'expired' : (m.status || 'active');
      const durationText = m.duration || (daysRemaining > 0 ? `30 Days (${daysRemaining} Days Left)` : "30 Days");

      return {
        ...m,
        status: effectiveStatus,
        interval: m.interval || planObj.billing_cycle || planObj.interval || "Month",
        duration: durationText,
        daysRemaining: daysRemaining,
        creatorName: creatorObj.full_name || `Creator #${m.creator_id}`,
        creatorUsername: `@${cleanUsername}`,
        creatorAvatar: creatorObj.profile_image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
        perks: perks,
      };
    });

    return res.status(200).json({
      status: "success",
      total: enrichedMemberships.length,
      data: {
        memberships: enrichedMemberships,
      },
    });
  } catch (error) {
    console.error("GET VIEWER MEMBERSHIPS ERROR:", error);
    next(error);
  }
};

/**
 * @desc    Cancel VIP Membership
 * @route   POST /api/viewers/vip/cancel
 * @access  Public / Private
 */
// const cancelVipMembership = async (req, res, next) => {
//   try {
//     const userId = String(req.user?.id || req.body.userId || 1);
//     const { membershipId, creatorId } = req.body;

//     try {
//       if (membershipId) {
//         await VipMembership.update(
//           { status: "cancelled" },
//           { where: { id: membershipId, viewer_id: userId } }
//         );
//       } else if (creatorId) {
//         await VipMembership.update(
//           { status: "cancelled" },
//           { where: { creator_id: creatorId, viewer_id: userId } }
//         );
//       }
//     } catch (dbErr) {
//       console.warn("DB VipMembership cancel fallback:", dbErr.message);
//       const key = `${userId}_${creatorId}`;
//       if (vipMemoryStore.has(key)) {
//         const val = vipMemoryStore.get(key);
//         val.status = "cancelled";
//       }
//     }

//     return res.status(200).json({
//       status: "success",
//       message: "VIP Membership cancelled. You will retain access until the end of your billing cycle.",
//     });
//   } catch (error) {
//     console.error("CANCEL VIP MEMBERSHIP ERROR:", error);
//     next(error);
//   }
// };

/**
 * @desc    Get Public Active VIP Plans for a Creator
 * @route   GET /api/viewers/vip/plans
 * @access  Public
 */
const getPublicVipPlans = async (req, res, next) => {
  try {
    const VipPlan = require("../models/VipPlanModel");
    const Creator = require("../models/CreatorsModel");
    let plans = [];

    let targetCreatorId = req.query.creatorId || req.query.creator_id || null;
    const username = req.query.username || null;

    if (!targetCreatorId && username) {
      try {
        const cleanUname = String(username).replace(/^@+/, '').toLowerCase();
        const creators = await Creator.findAll({ raw: true }).catch(() => []);
        const matched = creators.find(
          (c) => String(c.username || '').toLowerCase().replace(/^@+/, '') === cleanUname || String(c.id) === cleanUname
        );
        if (matched) targetCreatorId = matched.id;
      } catch (e) {
        console.warn("Creator lookup error in VIP plans:", e.message);
      }
    }

    if (targetCreatorId) {
      try {
        const records = await VipPlan.findAll({
          where: { creator_id: targetCreatorId, status: 'Active' },
          order: [['price', 'ASC'], ['created_at', 'ASC']],
          raw: true,
        });

        plans = records.map((p) => ({
          id: p.id,
          creatorId: p.creator_id,
          name: p.name,
          price: parseFloat(p.price || 0),
          interval: p.interval || '',
          duration: p.duration || '30 Days',
          badgeColor: p.badge_color || '',
          perks: p.perks ? (Array.isArray(p.perks) ? p.perks : String(p.perks).split(',').map((s) => s.trim())) : [],
        }));
      } catch (e) {
        console.warn("DB VipPlan read notice:", e.message);
      }
    }

    // Default tiers for creator if creator has no custom plans saved yet
    if (!plans || plans.length === 0) {
      plans = [
      ];
    }

    return res.status(200).json({
      status: 'success',
      total: plans.length,
      data: { plans },
    });
  } catch (error) {
    console.error('GET PUBLIC VIP PLANS ERROR:', error);
    next(error);
  }
};

module.exports = {
  createVipSubscription,
  getViewerMemberships,
  // cancelVipMembership,
  getPublicVipPlans,
};

