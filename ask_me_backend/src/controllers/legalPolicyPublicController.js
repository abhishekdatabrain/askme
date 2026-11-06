const { LegalPolicy, LegalPolicyVersion, UserPolicyConsent } = require("../models");

// Normalize slug aliases (e.g. international-payments-policy -> international-payment-policy)
const normalizeSlug = (slug) => {
  if (!slug) return "";
  const s = slug.toLowerCase().trim();
  if (s === "international-payments-policy") return "international-payment-policy";
  return s;
};

/**
 * 1. Get list of all published legal policies
 */
exports.getPublicPolicies = async (req, res) => {
  try {
    const policies = await LegalPolicy.findAll({
      where: { status: "published" },
      attributes: [
        "id",
        "title",
        "slug",
        "category",
        "version",
        "effective_date",
        "display_order",
        "is_consent_required",
        "consent_type",
        "requires_reconsent",
        "updated_at",
      ],
      order: [
        ["display_order", "ASC"],
        ["id", "ASC"],
      ],
    });

    return res.status(200).json({
      status: "success",
      count: policies.length,
      data: policies,
    });
  } catch (error) {
    console.error("Error in getPublicPolicies:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to retrieve public legal policies.",
    });
  }
};

/**
 * 2. Get single published policy by slug (Drafts are strictly forbidden)
 */
exports.getPublicPolicyBySlug = async (req, res) => {
  try {
    const rawSlug = req.params.slug;
    const slug = normalizeSlug(rawSlug);

    const policy = await LegalPolicy.findOne({
      where: {
        slug,
        status: "published",
      },
      attributes: [
        "id",
        "title",
        "slug",
        "category",
        "content", // Only published content, NEVER draft_content
        "version",
        "effective_date",
        "meta_title",
        "meta_description",
        "meta_keywords",
        "is_consent_required",
        "consent_type",
        "requires_reconsent",
        "published_at",
        "updated_at",
      ],
    });

    if (!policy) {
      return res.status(404).json({
        status: "fail",
        message: `Policy "${rawSlug}" not found or is currently not published.`,
      });
    }

    return res.status(200).json({
      status: "success",
      data: policy,
    });
  } catch (error) {
    console.error(`Error in getPublicPolicyBySlug (${req.params.slug}):`, error);
    return res.status(500).json({
      status: "error",
      message: "Failed to retrieve legal policy.",
    });
  }
};

/**
 * 3. Record user consent for DPDP compliance
 */
exports.recordConsent = async (req, res) => {
  try {
    const { slug, policy_id, version, user_id, creator_id, identifier, consent_type } = req.body;

    let targetPolicy = null;
    if (policy_id) {
      targetPolicy = await LegalPolicy.findByPk(policy_id);
    } else if (slug) {
      targetPolicy = await LegalPolicy.findOne({ where: { slug: normalizeSlug(slug) } });
    }

    if (!targetPolicy) {
      return res.status(404).json({
        status: "fail",
        message: "Policy not found to record consent.",
      });
    }

    // Resolve current published version
    const consentVersion = version || targetPolicy.version;

    // Find version record ID if available
    const versionRecord = await LegalPolicyVersion.findOne({
      where: {
        policy_id: targetPolicy.id,
        version: consentVersion,
      },
    });

    const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket.remoteAddress || null;
    const userAgent = req.headers["user-agent"] || null;

    const consent = await UserPolicyConsent.create({
      policy_id: targetPolicy.id,
      policy_version_id: versionRecord ? versionRecord.id : null,
      policy_version: consentVersion,
      user_id: user_id || null,
      creator_id: creator_id || null,
      identifier: identifier || null,
      ip_address: ip,
      user_agent: userAgent,
      consent_type: consent_type || targetPolicy.consent_type || "policy_agreement",
      consented: true,
      consented_at: new Date(),
    });

    return res.status(201).json({
      status: "success",
      message: "User consent recorded successfully.",
      data: consent,
    });
  } catch (error) {
    console.error("Error in recordConsent:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to record consent.",
    });
  }
};

/**
 * 4. Check consent status for user / identifier
 */
exports.checkConsentStatus = async (req, res) => {
  try {
    const { slug } = req.params;
    const { user_id, creator_id, identifier } = req.query;

    const targetPolicy = await LegalPolicy.findOne({
      where: { slug: normalizeSlug(slug), status: "published" },
    });

    if (!targetPolicy) {
      return res.status(404).json({
        status: "fail",
        message: "Policy not found.",
      });
    }

    const where = {
      policy_id: targetPolicy.id,
      policy_version: targetPolicy.version,
      consented: true,
    };

    if (user_id) where.user_id = user_id;
    else if (creator_id) where.creator_id = creator_id;
    else if (identifier) where.identifier = identifier;
    else {
      return res.status(400).json({
        status: "fail",
        message: "user_id, creator_id, or identifier required.",
      });
    }

    const consent = await UserPolicyConsent.findOne({ where });

    return res.status(200).json({
      status: "success",
      consented: !!consent,
      requires_reconsent: targetPolicy.requires_reconsent,
      current_version: targetPolicy.version,
      data: consent,
    });
  } catch (error) {
    console.error("Error in checkConsentStatus:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to check consent status.",
    });
  }
};
