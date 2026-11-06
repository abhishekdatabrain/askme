const express = require("express");
const router = express.Router();
const {
  getPublicPolicies,
  getPublicPolicyBySlug,
  recordConsent,
  checkConsentStatus,
} = require("../controllers/legalPolicyPublicController");

// Public Policy Routes (No Auth required)
router.get("/", getPublicPolicies);
router.post("/consent", recordConsent);
router.get("/consent/:slug", checkConsentStatus);
router.get("/:slug", getPublicPolicyBySlug);

module.exports = router;
