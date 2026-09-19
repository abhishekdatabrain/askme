const ContactMessage = require('../models/ContactMessageModel');

/**
 * @desc    Submit Contact Us Form Message
 * @route   POST /api/contact/submit
 * @access  Public
 */
const submitContactMessage = async (req, res, next) => {
  try {
    const { name, email, role, phone, subject, message } = req.body;

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Name is required',
      });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Email address is required',
      });
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide a valid email address',
      });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Message content is required',
      });
    }

    // Create message in database
    const newMessage = await ContactMessage.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role: role || 'Viewer',
      phone: phone ? String(phone).trim() : null,
      subject: subject ? subject.trim() : 'General Support Inquiry',
      message: message.trim(),
      status: 'unread',
    });

    return res.status(201).json({
      status: 'success',
      message: 'Thank you for reaching out! Your message has been received.',
      data: {
        id: newMessage.id,
        name: newMessage.name,
        email: newMessage.email,
        role: newMessage.role,
        subject: newMessage.subject,
        createdAt: newMessage.createdAt,
      },
    });
  } catch (error) {
    console.error('SUBMIT CONTACT MESSAGE ERROR:', error);
    next(error);
  }
};

/**
 * @desc    Get All Contact Messages (Admin)
 * @route   GET /api/contact/messages
 * @access  Private / Admin
 */
const getContactMessages = async (req, res, next) => {
  try {
    const { status, limit = 50, page = 1 } = req.query;

    const whereClause = {};
    if (status) {
      whereClause.status = status;
    }

    const limitNum = parseInt(limit, 10);
    const pageNum = parseInt(page, 10);
    const offset = (pageNum - 1) * limitNum;

    const { count, rows: messages } = await ContactMessage.findAndCountAll({
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
      data: messages,
    });
  } catch (error) {
    console.error('GET CONTACT MESSAGES ERROR:', error);
    next(error);
  }
};

/**
 * @desc    Update Message Status (Admin)
 * @route   PATCH /api/contact/messages/:id/status
 * @access  Private / Admin
 */
const updateContactMessageStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['unread', 'read', 'replied', 'archived'].includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid status value',
      });
    }

    const message = await ContactMessage.findByPk(id);
    if (!message) {
      return res.status(404).json({
        status: 'error',
        message: 'Contact message not found',
      });
    }

    message.status = status;
    await message.save();

    return res.status(200).json({
      status: 'success',
      message: `Message status updated to ${status}`,
      data: message,
    });
  } catch (error) {
    console.error('UPDATE CONTACT MESSAGE STATUS ERROR:', error);
    next(error);
  }
};

module.exports = {
  submitContactMessage,
  getContactMessages,
  updateContactMessageStatus,
};
