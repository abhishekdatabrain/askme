const express = require('express');
const router = express.Router();
const {
  createSupportTicket,
  getMySupportTickets,
  getAdminTickets,
  updateTicketStatus,
  approvePayoutChangeTicket,
} = require('../controllers/ticketController');

// Public / Creator Ticket Routes
router.post('/create', createSupportTicket);
router.post('/', createSupportTicket);
router.get('/my-tickets', getMySupportTickets);

// Admin Ticket Management Routes
router.get('/admin/all', getAdminTickets);
router.patch('/admin/:id/status', updateTicketStatus);
router.post('/admin/:id/approve-payout', approvePayoutChangeTicket);

module.exports = router;
