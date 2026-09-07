const { VipPlan, VipMembership, User } = require("../../models");

/**
 * Get Creator Membership Tier Plans
 */
const getCreatorMembershipPlansService = async (creatorId) => {
  const whereClause = creatorId ? { creator_id: creatorId } : {};

  const records = await VipPlan.findAll({
    where: whereClause,
    order: [["created_at", "ASC"]],
    raw: true,
  });

  const plans = records.map((p) => ({
    id: p.id,
    creatorId: p.creator_id,
    name: p.name,
    price: parseFloat(p.price || 0),
    interval: p.interval || "",
    perks: p.perks ? (Array.isArray(p.perks) ? p.perks : String(p.perks).split(",").map((s) => s.trim())) : [],
    status: p.status || "",
    badgeColor: p.badge_color || "bg-[#FFD60A]",
  }));

  return { plans };
};

/**
 * Create Creator Membership Tier Plan
 */
const createCreatorMembershipPlanService = async (creatorId, data) => {
  if (!creatorId) {
    const err = new Error("Creator ID is required.");
    err.statusCode = 400;
    throw err;
  }

  const { name, price, interval, perks, badgeColor } = data;

  if (!name || !String(name).trim()) {
    const err = new Error("Plan name is required.");
    err.statusCode = 400;
    throw err;
  }

  const parsedPrice = parseFloat(price || 0);
  if (isNaN(parsedPrice) || parsedPrice < 0) {
    const err = new Error("Valid price is required.");
    err.statusCode = 400;
    throw err;
  }

  const created = await VipPlan.create({
    creator_id: creatorId,
    name: name.trim(),
    price: parsedPrice,
    interval: interval || "Monthly",
    perks: Array.isArray(perks) ? perks.join(", ") : perks || "VIP Badge",
    status: "Active",
    badge_color: badgeColor || "bg-[#FFD60A]",
  });

  return { plan: created.toJSON() };
};

/**
 * Update Creator Membership Tier Plan
 */
const updateCreatorMembershipPlanService = async (creatorId, planId, data) => {
  if (!planId) {
    const err = new Error("Plan ID is required.");
    err.statusCode = 400;
    throw err;
  }

  const plan = await VipPlan.findByPk(planId);
  if (!plan) {
    const err = new Error("Membership plan not found.");
    err.statusCode = 404;
    throw err;
  }

  if (creatorId && String(plan.creator_id) !== String(creatorId)) {
    const err = new Error("Unauthorized to update this membership plan.");
    err.statusCode = 403;
    throw err;
  }

  const { name, price, interval, perks, status, badgeColor } = data;

  if (name !== undefined) plan.name = name;
  if (price !== undefined) plan.price = parseFloat(price);
  if (interval !== undefined) plan.interval = interval;
  if (perks !== undefined) plan.perks = Array.isArray(perks) ? perks.join(", ") : perks;
  if (status !== undefined) plan.status = status;
  if (badgeColor !== undefined) plan.badge_color = badgeColor;

  await plan.save();

  return { plan: plan.toJSON() };
};

/**
 * Delete Creator Membership Tier Plan
 */
const deleteCreatorMembershipPlanService = async (creatorId, planId) => {
  if (!planId) {
    const err = new Error("Plan ID is required.");
    err.statusCode = 400;
    throw err;
  }

  const plan = await VipPlan.findByPk(planId);
  if (!plan) {
    const err = new Error("Membership plan not found.");
    err.statusCode = 404;
    throw err;
  }

  if (creatorId && String(plan.creator_id) !== String(creatorId)) {
    const err = new Error("Unauthorized to delete this membership plan.");
    err.statusCode = 403;
    throw err;
  }

  await plan.destroy();

  return { message: "Membership Tier deleted successfully." };
};

/**
 * Get Creator Active Subscribers (Optimized - Sequelize JOIN)
 */
const getCreatorSubscribersService = async (creatorId) => {
  const whereClause = creatorId ? { creator_id: String(creatorId) } : {};

  const records = await VipMembership.findAll({
    where: whereClause,
    include: [
      {
        model: User,
        as: "viewer",
        attributes: ["id", "name", "email"],
        required: false,
      },
    ],
    order: [["created_at", "DESC"]],
  });

  const subscribers = records.map((r) => {
    const viewerObj = r.viewer || {};
    return {
      id: r.id,
      viewerName: viewerObj.name || "Subscriber",
      viewerEmail: viewerObj.email || "",
      planName: r.plan_name || "VIP Member",
      amount: parseFloat(r.amount || 0),
      status: r.status || "active",
      startDate: r.created_at ? new Date(r.created_at).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
      nextBillingDate: r.next_billing_date || "",
    };
  });

  return { subscribers, total: subscribers.length };
};

module.exports = {
  getCreatorMembershipPlansService,
  createCreatorMembershipPlanService,
  updateCreatorMembershipPlanService,
  deleteCreatorMembershipPlanService,
  getCreatorSubscribersService,
};
