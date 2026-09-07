const sequelize = require("../../config/database");
const { Wallet, Donation, VipMembership, WalletSettlement } = require("../../models");
const { parsePagination, buildPaginationMeta } = require("../../utils/pagination");
const { getCreatorNetSharePercent } = require("../../config/commissionConfig");
const { Op } = require("sequelize");

/**
 * Get Creator Wallet Details & Transaction History
 */
const getCreatorWalletDetailsService = async (creatorId, queryParams = {}) => {
  if (!creatorId) {
    const err = new Error("Creator ID is required.");
    err.statusCode = 400;
    throw err;
  }

  const { status, search } = queryParams;
  const { page, limit, offset } = parsePagination(queryParams);

  const wallet = await Wallet.findOne({ where: { creator_id: creatorId } });

  const whereCondition = { creator_id: creatorId };

  if (status && status !== "All" && status !== "all") {
    const dbStatus = status.toLowerCase() === "successful" ? "success" : status.toLowerCase();
    whereCondition.payment_status = dbStatus;
  }

  if (search && String(search).trim()) {
    const rawSearch = String(search).trim();
    const searchTerm = `%${rawSearch}%`;
    const orConditions = [
      { viewer_name: { [Op.iLike]: searchTerm } },
      { viewer_email: { [Op.iLike]: searchTerm } },
      { message: { [Op.iLike]: searchTerm } },
      sequelize.where(
        sequelize.cast(sequelize.col("donations.donation_uuid"), "TEXT"),
        { [Op.iLike]: searchTerm }
      ),
    ];

    if (/^\d+$/.test(rawSearch)) {
      orConditions.push({ id: rawSearch });
    }

    whereCondition[Op.or] = orConditions;
  }

  const { count, rows: donations } = await Donation.findAndCountAll({
    where: whereCondition,
    order: [["id", "DESC"]],
    limit,
    offset,
  });

  const netSharePercent = getCreatorNetSharePercent();

  const transactions = donations.map((d) => {
    const gross = parseFloat(d.amount || 0);
    return {
      id: d.id,
      donationUuid: d.donation_uuid || `TXN-${d.id}`,
      date: d.paid_at || d.createdAt,
      viewerName: d.anonymous ? "Anonymous Supporter" : d.viewer_name || "Anonymous Supporter",
      amount: gross,
      netAmount: gross * netSharePercent,
      message: d.message || "",
      payment_status: d.payment_status === "success" ? "Successful" : d.payment_status === "pending" ? "Pending" : d.payment_status === "refunded" ? "Refunded" : "Failed",
    };
  });

  const settlementsRecords = await WalletSettlement.findAll({
    where: { creator_id: creatorId },
    order: [["settlement_month", "DESC"]],
    limit: 12,
  }).catch(() => []);

  const settlements = settlementsRecords.map((s) => ({
    id: s.id,
    earningMonth: s.earning_month || s.settlement_month,
    settlementMonth: s.settlement_month,
    periodStart: s.period_start,
    periodEnd: s.period_end,
    grossAmount: parseFloat(s.gross_amount || s.total_earning || 0),
    totalEarning: parseFloat(s.total_earning || s.gross_amount || 0),
    commissionAmount: parseFloat(s.commission_amount || s.platform_commission || 0),
    platformCommission: parseFloat(s.platform_commission || s.commission_amount || 0),
    netAmount: parseFloat(s.net_amount || s.creator_net_amount || 0),
    creatorNetAmount: parseFloat(s.creator_net_amount || s.net_amount || 0),
    previousCarriedBalance: parseFloat(s.previous_carried_balance || 0),
    availableAmount: parseFloat(s.available_amount || 0),
    withdrawnAmount: parseFloat(s.withdrawn_amount || 0),
    remainingAmount: parseFloat(s.remaining_amount || 0),
    hasWithdrawn: Boolean(s.has_withdrawn),
    status: s.status || s.settlement_status || "available",
    settledAt: s.settled_at,
    reference: s.reference,
  }));

  const latestSettlement = settlements.length > 0 ? settlements[0] : null;

  const pagination = buildPaginationMeta(count, page, limit);

  const totalEarnings = wallet?.total_earnings
    ? parseFloat(wallet.total_earnings)
    : transactions.filter((t) => t.payment_status === "Successful").reduce((acc, t) => acc + t.netAmount, 0);

  const availableBalance = wallet?.available_balance
    ? parseFloat(wallet.available_balance)
    : totalEarnings;

  const pendingAmount = wallet?.pending_balance
    ? parseFloat(wallet.pending_balance)
    : 0;

  const withdrawnAmount = wallet?.withdrawn_amount
    ? parseFloat(wallet.withdrawn_amount)
    : 0;

  const activeSubscribersCount = await VipMembership.count({
    where: { creator_id: String(creatorId), status: "active" },
  }).catch(() => 0);

  return {
    wallet: {
      totalEarnings,
      availableBalance,
      pendingAmount,
      withdrawnAmount,
      activeSubscribersCount,
    },
    currentSettlement: latestSettlement,
    activeSubscribersCount,
    transactions,
    settlements,
    pagination,
  };
};

module.exports = {
  getCreatorWalletDetailsService,
};
