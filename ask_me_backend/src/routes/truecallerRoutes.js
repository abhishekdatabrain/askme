const express = require('express');
const router = express.Router();
const { truecallerAuthViewer, truecallerCallback } = require('../controllers/truecaller.controller');

// Direct JSON Verification (Web SDK / Manual POST)
router.post('/viewer', truecallerAuthViewer);

// Mobile Deep Link Return Handler (Handles both GET and POST)
router.get('/callback', truecallerCallback);
router.post('/callback', truecallerCallback);

module.exports = router;