const SupportTicket = require('../models/SupportTicketModel');
const CreatorBankAccount = require('../models/CreatorBankAccountModel');
const adminNotificationService = require('../admin/services/notificationService');
const { Op } = require('sequelize');

/**
 * @desc    Create a new Support Ticket (Saved in support_tickets table)
 * @route   POST /api/tickets/create
 * @access  Public / Authenticated
 */
const createSupportTicket = async (req, res, next) => {
  try {
    const { creatorId, userId, name, email, phone, role, category, subject, message } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ status: 'fail', message: 'Name is required.' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ status: 'fail', message: 'Email is required.' });
    }
    if (!message || !message.trim()) {
      return res.status(400).json({ status: 'fail', message: 'Message content is required.' });
    }

    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const ticketNumber = `TCK-${randomNum}`;

    const newTicket = await SupportTicket.create({
      ticket_number: ticketNumber,
      creator_id: creatorId || null,
      user_id: userId || null,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? String(phone).trim() : null,
      role: role || '',
      category: category || 'payout_change',
      subject: subject ? subject.trim() : 'Payout Details Change Ticket',
      message: message.trim(),
      status: 'unread',
    });

    // Send real-time notification to Admin Panel
    try {
      await adminNotificationService.createNotification({
        type: 'payout',
        title: `Ticket #${newTicket.id} (${ticketNumber}): ${newTicket.subject}`,
        message: `Support Ticket raised by ${newTicket.name} (${newTicket.role}): "${newTicket.message.slice(0, 100)}..."`,
      });
    } catch (notifErr) {
      console.warn('Notice: Admin ticket notification trigger warning:', notifErr.message);
    }

    return res.status(201).json({
      status: 'success',
      message: `Support ticket #${newTicket.id} (${ticketNumber}) submitted successfully! Support team will review.`,
      data: newTicket,
    });
  } catch (error) {
    console.error('CREATE SUPPORT TICKET ERROR:', error);
    next(error);
  }
};

/**
 * @desc    Get Creator/User Raised Tickets (From support_tickets table)
 * @route   GET /api/tickets/my-tickets
 * @access  Public / Authenticated
 */
const getMySupportTickets = async (req, res, next) => {
  try {
    const email = req.query.email ? String(req.query.email).trim().toLowerCase() : null;
    const creatorId = req.query.creatorId || req.query.creator_id;

    if (!email && !creatorId) {
      return res.status(400).json({ status: 'fail', message: 'Email or creatorId parameter is required.' });
    }

    const whereClause = {};
    if (creatorId) {
      whereClause[Op.or] = [
        { creator_id: creatorId },
        ...(email ? [{ email }] : [])
      ];
    } else {
      whereClause.email = email;
    }

    const tickets = await SupportTicket.findAll({
      where: whereClause,
      order: [['created_at', 'DESC']],
      limit: 50,
    });

    return res.status(200).json({
      status: 'success',
      total: tickets.length,
      data: tickets,
    });
  } catch (error) {
    console.error('GET MY SUPPORT TICKETS ERROR:', error);
    next(error);
  }
};

/**
 * @desc    Get All Support Tickets (Admin - From support_tickets table)
 * @route   GET /api/tickets/admin/all
 * @access  Private / Admin
 */
const getAdminTickets = async (req, res, next) => {
  try {
    const { status, category, search, limit = 50, page = 1 } = req.query;

    const whereClause = {};
    if (status && status !== 'all') {
      whereClause.status = status;
    }
    if (category && category !== 'all') {
      whereClause.category = category;
    }

    if (search && search.trim()) {
      const q = `%${search.trim().toLowerCase()}%`;
      whereClause[Op.or] = [
        { name: { [Op.iLike]: q } },
        { email: { [Op.iLike]: q } },
        { subject: { [Op.iLike]: q } },
        { message: { [Op.iLike]: q } },
        { ticket_number: { [Op.iLike]: q } },
      ];
    }

    const limitNum = parseInt(limit, 10);
    const pageNum = parseInt(page, 10);
    const offset = (pageNum - 1) * limitNum;

    const { count, rows: tickets } = await SupportTicket.findAndCountAll({
      where: whereClause,
      order: [['created_at', 'DESC']],
      limit: limitNum,
      offset: offset,
    });

    return res.status(200).json({
      status: 'success',
      total: count,
      page: pageNum,
      limit: limitNum,
      data: tickets,
    });
  } catch (error) {
    console.error('GET ADMIN TICKETS ERROR:', error);
    next(error);
  }
};

/**
 * @desc    Update Support Ticket Status (Admin)
 * @route   PATCH /api/tickets/admin/:id/status
 * @access  Private / Admin
 */
const updateTicketStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const ticket = await SupportTicket.findByPk(id);
    if (!ticket) {
      return res.status(404).json({ status: 'fail', message: 'Support ticket not found.' });
    }

    if (status) ticket.status = status;
    if (adminNotes !== undefined) ticket.admin_notes = adminNotes;
    await ticket.save();

    return res.status(200).json({
      status: 'success',
      message: `Ticket #${id} status updated to '${ticket.status}'.`,
      data: ticket,
    });
  } catch (error) {
    console.error('UPDATE TICKET STATUS ERROR:', error);
    next(error);
  }
};

/**
 * @desc    1-Click Admin Action: Approve Payout Change Request & Reset Creator Bank Account Details
 * @route   POST /api/tickets/admin/:id/approve-payout
 * @access  Private / Admin
 */
const approvePayoutChangeTicket = async (req, res, next) => {
  try {
    const { id } = req.params;

    const ticket = await SupportTicket.findByPk(id);
    if (!ticket) {
      return res.status(404).json({ status: 'fail', message: 'Support ticket not found.' });
    }

    const targetCreatorId = ticket.creator_id;
    if (targetCreatorId) {
      // Deactivate existing bank account records so creator can fill new details
      await CreatorBankAccount.update(
        { status: 'inactive', is_primary: false },
        { where: { creator_id: targetCreatorId } }
      );

      // Send real-time notification to Creator
      try {
        await adminNotificationService.createNotification({
          creatorId: targetCreatorId,
          type: 'payout_unlocked',
          title: 'Payout Details Unlocked! ✅',
          message: `Your Payout Details Change Ticket #${ticket.id} was approved by Admin. You can now update your bank/UPI details on your Profile page.`,
        });
      } catch (nErr) { }
    }

    ticket.status = 'replied';
    ticket.admin_notes = 'Payout details unlocked & reset by Admin.';
    await ticket.save();

    return res.status(200).json({
      status: 'success',
      message: `Ticket #${id} approved! Creator payout details unlocked for re-entry.`,
      data: ticket,
    });
  } catch (error) {
    console.error('APPROVE PAYOUT TICKET ERROR:', error);
    next(error);
  }
};

module.exports = {
  createSupportTicket,
  getMySupportTickets,
  getAdminTickets,
  updateTicketStatus,
  approvePayoutChangeTicket,
};
