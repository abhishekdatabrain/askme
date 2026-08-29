const VipMembership = require("../models/VipMembershipModel");
const Creator = require("../models/CreatorsModel");

// In-memory fallback map for VIP memberships in development mode
const vipMemoryStore = new Map();

/**
 * @desc    Create / Purchase VIP Membership Subscription
 * @route   POST /api/viewers/vip/subscribe
 * @access  Public / Private
 */
const createVipSubscription = async (req, res, next) => {
  try {
    console.log("requser", req.use);
    const userId = String(req.user?.id || req.body.userId);
    console.log("userId", userId);
    const { creatorId, planName, amount, transactionId } = req.body;

    if (!creatorId) {
      return res.status(400).json({
        status: "fail",
        message: "creatorId is required.",
      });
    }

    const subAmount = parseFloat(amount || "");
    const subPlanName = planName || "";
    const subTxnId = transactionId || `pay_${Math.random().toString(36).substring(2, 11).toUpperCase()}`;

    // Next billing date: 30 days from today
    const nextBilling = new Date();
    nextBilling.setMonth(nextBilling.getMonth() + 1);
    const nextBillingStr = nextBilling.toISOString().split("T")[0];
    console.log(nextBillingStr);
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
      const records = await VipMembership.findAll({
        where: {
          viewer_id: userId,
          status: "active",
        },
        order: [["created_at", "DESC"]],
      });
      memberships = records.map((r) => r.toJSON());
    } catch (dbErr) {
      console.warn("DB VipMembership read fallback to memory store:", dbErr.message);
      for (const [key, val] of vipMemoryStore.entries()) {
        if (key.startsWith(`${userId}_`) && val.status === "active") {
          memberships.push(val);
        }
      }
    }

    // Attach creator details if available
    const creators = await Creator.findAll({ raw: true }).catch(() => []);
    const creatorMap = new Map();
    creators.forEach((c) => creatorMap.set(String(c.id), c));

    const enrichedMemberships = memberships.map((m) => {
      const creatorObj = creatorMap.get(String(m.creator_id)) || {};
      const cleanUsername = String(creatorObj.username || "creator").replace(/^@+/, "");
      return {
        ...m,
        creatorName: creatorObj.full_name || `Creator #${m.creator_id}`,
        creatorUsername: `@${cleanUsername}`,
        creatorAvatar: creatorObj.profile_image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
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
 * @desc    Get Public Active VIP Plans
 * @route   GET /api/viewers/vip/plans
 * @access  Public
 */
const getPublicVipPlans = async (req, res, next) => {
  try {
    const VipPlan = require("../models/VipPlanModel");
    let plans = [];

    try {
      const records = await VipPlan.findAll({
        where: { status: 'Active' },
        order: [['created_at', 'ASC']],
        raw: true,
      });
      plans = records.map((p) => ({
        id: p.id,
        name: p.name,
        price: parseFloat(p.price),
        interval: p.interval || 'Month',
        badgeColor: p.badge_color || 'bg-[#FFD60A]',
        perks: p.perks ? p.perks.split(',').map((s) => s.trim()) : [],
      }));
    } catch (e) {
      console.warn("DB VipPlan read notice:", e.message);
    }

    if (!plans || plans.length === 0) {
      plans = [
        {
          id: 1,
          name: 'VIP Membership',
          price: 999,
          interval: 'Month',
          badgeColor: 'bg-[#FFD60A]',
          perks: [
            'VIP Badge in Live Chat & Profile',
            'Priority in Live Q&A Stream Queue',
            'Exclusive VIP Member Content',
            'Early Access to Videos & Announcements',
            'Member Only Live Sessions',
            'Custom Emojis & Badges',
          ],
        },
        {
          id: 2,
          name: 'Premium Pass',
          price: 499,
          interval: 'Month',
          badgeColor: 'bg-[#7B2FFF]',
          perks: [
            'Priority in Live Q&A Stream Queue',
            'Exclusive Member Content',
            'Early Access to Videos',
            'Custom Badges',
          ],
        },
        {
          id: 3,
          name: 'Basic Supporter',
          price: 99,
          interval: 'Month',
          badgeColor: 'bg-[#38BDF8]',
          perks: ['Supporter Badge in Live Chat', 'Custom Emojis'],
        },
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
