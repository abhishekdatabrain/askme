const express = require('express');
const router = express.Router();
const {
  submitContactMessage,
  getContactMessages,
  updateContactMessageStatus,
} = require('../controllers/contactController');

// Public route to submit contact message
router.post('/submit', submitContactMessage);
router.post('/', submitContactMessage);

// Admin routes to view & manage contact messages
router.get('/messages', getContactMessages);
router.patch('/messages/:id/status', updateContactMessageStatus);

module.exports = router;
