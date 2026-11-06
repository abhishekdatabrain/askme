const sanitizeHtml = require("sanitize-html");
const { Op } = require("sequelize");
const { LegalPolicy, LegalPolicyVersion, UserPolicyConsent } = require("../../models");

// Clean, standard sanitizer options preserving legal formatting, links, tables
const sanitizeOptions = {
  allowedTags: [
    "h1", "h2", "h3", "h4", "h5", "h6",
    "p", "strong", "b", "em", "i", "u", "s", "strike",
    "blockquote", "code", "pre", "hr", "br",
    "ul", "ol", "li",
    "table", "thead", "tbody", "tr", "th", "td",
    "a", "span", "div",
  ],
  allowedAttributes: {
    a: ["href", "name", "target", "rel", "class"],
    table: ["class", "border", "cellpadding", "cellspacing"],
    th: ["class", "colspan", "rowspan", "scope", "style"],
    td: ["class", "colspan", "rowspan", "style"],
    span: ["class", "style"],
    div: ["class"],
    p: ["class"],
    h1: ["class"],
    h2: ["class"],
    h3: ["class"],
    h4: ["class"],
    blockquote: ["class"],
  },
  allowedSchemes: ["http", "https", "mailto", "tel"],
};

const sanitizeContent = (html) => {
  if (!html || typeof html !== "string") return "";
  return sanitizeHtml(html, sanitizeOptions);
};

/**
 * 1. List all policies with search, filter, and metadata
 */
exports.getAdminPolicies = async (req, res) => {
  try {
    const { search, status } = req.query;
    const where = {};

    if (status && status !== "all") {
      where.status = status;
    }

    if (search && search.trim()) {
      const q = `%${search.trim()}%`;
      where[Op.or] = [
        { title: { [Op.iLike]: q } },
        { slug: { [Op.iLike]: q } },
        { category: { [Op.iLike]: q } },
      ];
    }

    const policies = await LegalPolicy.findAll({
      where,
      order: [
        ["display_order", "ASC"],
        ["id", "ASC"],
      ],
      include: [
        {
          model: LegalPolicyVersion,
          as: "versions",
          attributes: ["id", "version", "published_at", "is_material_change", "publisher_name"],
        },
      ],
    });

    const formatted = policies.map((p) => {
      const plain = p.get({ plain: true });
      plain.version_count = plain.versions ? plain.versions.length : 0;
      return plain;
    });

    return res.status(200).json({
      status: "success",
      count: formatted.length,
      data: formatted,
    });
  } catch (error) {
    console.error("Error in getAdminPolicies:", error);
    return res.status(500).json({
      status: "error",
      message: error.message || "Failed to retrieve legal policies.",
    });
  }
};

/**
 * 2. Get single policy with full version history
 */
exports.getAdminPolicyById = async (req, res) => {
  try {
    const { id } = req.params;
    const isNumeric = !isNaN(id);
    const where = isNumeric ? { id } : { slug: id };

    const policy = await LegalPolicy.findOne({
      where,
      include: [
        {
          model: LegalPolicyVersion,
          as: "versions",
          order: [["published_at", "DESC"]],
        },
      ],
    });

    if (!policy) {
      return res.status(404).json({
        status: "fail",
        message: "Legal policy not found.",
      });
    }

    // Consent count summary for DPDP audit
    const consentCount = await UserPolicyConsent.count({
      where: { policy_id: policy.id, consented: true },
    });

    return res.status(200).json({
      status: "success",
      data: {
        ...policy.get({ plain: true }),
        active_consent_count: consentCount,
      },
    });
  } catch (error) {
    console.error("Error in getAdminPolicyById:", error);
    return res.status(500).json({
      status: "error",
      message: error.message || "Failed to retrieve policy details.",
    });
  }
};

/**
 * 3. Create a new legal policy
 */
exports.createPolicy = async (req, res) => {
  try {
    const {
      title,
      slug,
      category,
      content,
      effective_date,
      display_order,
      meta_title,
      meta_description,
      meta_keywords,
      is_consent_required,
      consent_type,
      status,
      version,
    } = req.body;

    if (!title || !slug) {
      return res.status(400).json({
        status: "fail",
        message: "Title and slug are required fields.",
      });
    }

    const cleanSlug = slug.toLowerCase().trim().replace(/[^a-z0-9_-]/g, "-");
    const existing = await LegalPolicy.findOne({ where: { slug: cleanSlug } });
    if (existing) {
      return res.status(400).json({
        status: "fail",
        message: `A policy with slug "${cleanSlug}" already exists.`,
      });
    }

    const cleanContent = sanitizeContent(content || "");
    const initialVersion = version || "1.0";
    const policyStatus = status === "draft" ? "draft" : "published";

    const policy = await LegalPolicy.create({
      title: title.trim(),
      slug: cleanSlug,
      category: category || "Legal",
      content: cleanContent,
      draft_content: null,
      has_draft: false,
      status: policyStatus,
      version: initialVersion,
      effective_date: effective_date || new Date(),
      display_order: display_order || 99,
      meta_title: meta_title || `${title.trim()} | AskMe`,
      meta_description: meta_description || null,
      meta_keywords: meta_keywords || null,
      is_consent_required: !!is_consent_required,
      consent_type: consent_type || cleanSlug.replace(/-/g, "_"),
      requires_reconsent: false,
      published_at: policyStatus === "published" ? new Date() : null,
      published_by: policyStatus === "published" ? req.user?.id : null,
      created_by: req.user?.id || null,
      updated_by: req.user?.id || null,
    });

    if (policyStatus === "published") {
      await LegalPolicyVersion.create({
        policy_id: policy.id,
        version: initialVersion,
        title: policy.title,
        content: cleanContent,
        effective_date: policy.effective_date,
        changelog: "Initial published policy created.",
        is_material_change: false,
        published_by: req.user?.id || null,
        publisher_name: req.user?.name || req.user?.email || "Admin",
        published_at: new Date(),
      });
    }

    return res.status(201).json({
      status: "success",
      message: "Legal policy created successfully.",
      data: policy,
    });
  } catch (error) {
    console.error("Error in createPolicy:", error);
    return res.status(500).json({
      status: "error",
      message: error.message || "Failed to create legal policy.",
    });
  }
};

/**
 * 4. Update policy (Save Draft or Metadata Update)
 */
exports.updatePolicy = async (req, res) => {
  try {
    const { id } = req.params;
    const policy = await LegalPolicy.findByPk(id);

    if (!policy) {
      return res.status(404).json({
        status: "fail",
        message: "Legal policy not found.",
      });
    }

    const {
      title,
      slug,
      category,
      content,
      draft_content,
      save_as_draft,
      effective_date,
      display_order,
      meta_title,
      meta_description,
      meta_keywords,
      is_consent_required,
      consent_type,
    } = req.body;

    // Validate slug if changed
    if (slug && slug !== policy.slug) {
      const cleanSlug = slug.toLowerCase().trim().replace(/[^a-z0-9_-]/g, "-");
      const duplicate = await LegalPolicy.findOne({
        where: { slug: cleanSlug, id: { [Op.ne]: policy.id } },
      });
      if (duplicate) {
        return res.status(400).json({
          status: "fail",
          message: `Slug "${cleanSlug}" is already in use by another policy.`,
        });
      }
      policy.slug = cleanSlug;
    }

    if (title) policy.title = title.trim();
    if (category) policy.category = category.trim();
    if (effective_date) policy.effective_date = effective_date;
    if (display_order !== undefined) policy.display_order = parseInt(display_order, 10);
    if (meta_title !== undefined) policy.meta_title = meta_title;
    if (meta_description !== undefined) policy.meta_description = meta_description;
    if (meta_keywords !== undefined) policy.meta_keywords = meta_keywords;
    if (is_consent_required !== undefined) policy.is_consent_required = !!is_consent_required;
    if (consent_type !== undefined) policy.consent_type = consent_type;

    // Handle Content / Draft Content
    if (save_as_draft) {
      const draftText = draft_content !== undefined ? draft_content : content;
      policy.draft_content = sanitizeContent(draftText || "");
      policy.has_draft = true;
    } else if (content !== undefined) {
      // Direct content update
      policy.content = sanitizeContent(content);
    }

    policy.updated_by = req.user?.id || null;
    await policy.save();

    return res.status(200).json({
      status: "success",
      message: save_as_draft
        ? "Draft saved successfully. Published version remains unchanged."
        : "Policy updated successfully.",
      data: policy,
    });
  } catch (error) {
    console.error("Error in updatePolicy:", error);
    return res.status(500).json({
      status: "error",
      message: error.message || "Failed to update legal policy.",
    });
  }
};

/**
 * 5. Publish Policy: Moves draft to content (if draft exists), creates immutable version snapshot
 */
exports.publishPolicy = async (req, res) => {
  try {
    const { id } = req.params;
    const policy = await LegalPolicy.findByPk(id);

    if (!policy) {
      return res.status(404).json({
        status: "fail",
        message: "Legal policy not found.",
      });
    }

    const {
      version,
      changelog,
      is_material_change,
      effective_date,
      title,
      category,
      meta_title,
      meta_description,
      meta_keywords,
      is_consent_required,
      consent_type,
      content: directContent,
    } = req.body;

    // Determine final content to publish: draft_content -> directContent -> existing content
    let finalContent = policy.content;
    if (policy.has_draft && policy.draft_content) {
      finalContent = policy.draft_content;
    } else if (directContent) {
      finalContent = sanitizeContent(directContent);
    }

    if (!finalContent || !finalContent.trim()) {
      return res.status(400).json({
        status: "fail",
        message: "Policy content cannot be empty when publishing.",
      });
    }

    // Determine new version number (e.g. 1.0 -> 1.1 or custom)
    let newVersion = version;
    if (!newVersion) {
      const current = parseFloat(policy.version) || 1.0;
      newVersion = is_material_change ? (Math.floor(current) + 1).toFixed(1) : (current + 0.1).toFixed(1);
    }

    // Update policy record
    policy.content = finalContent;
    policy.draft_content = null;
    policy.has_draft = false;
    policy.status = "published";
    policy.version = newVersion;
    if (effective_date) policy.effective_date = effective_date;
    if (title) policy.title = title.trim();
    if (category) policy.category = category.trim();
    if (meta_title !== undefined) policy.meta_title = meta_title;
    if (meta_description !== undefined) policy.meta_description = meta_description;
    if (meta_keywords !== undefined) policy.meta_keywords = meta_keywords;
    if (is_consent_required !== undefined) policy.is_consent_required = !!is_consent_required;
    if (consent_type !== undefined) policy.consent_type = consent_type;

    if (is_material_change) {
      policy.requires_reconsent = true;
    }

    policy.published_at = new Date();
    policy.published_by = req.user?.id || null;
    policy.updated_by = req.user?.id || null;
    await policy.save();

    // Create immutable audit snapshot
    const versionRecord = await LegalPolicyVersion.create({
      policy_id: policy.id,
      version: newVersion,
      title: policy.title,
      content: finalContent,
      effective_date: policy.effective_date,
      changelog: changelog || (is_material_change ? "Material update requiring user re-consent." : "Policy updated and published."),
      is_material_change: !!is_material_change,
      published_by: req.user?.id || null,
      publisher_name: req.user?.name || req.user?.email || "Admin",
      published_at: new Date(),
    });

    return res.status(200).json({
      status: "success",
      message: `Policy published successfully as version ${newVersion}.`,
      data: {
        policy,
        version: versionRecord,
      },
    });
  } catch (error) {
    console.error("Error in publishPolicy:", error);
    return res.status(500).json({
      status: "error",
      message: error.message || "Failed to publish legal policy.",
    });
  }
};

/**
 * 6. Unpublish Policy (sets status to draft so it's hidden from public site)
 */
exports.unpublishPolicy = async (req, res) => {
  try {
    const { id } = req.params;
    const policy = await LegalPolicy.findByPk(id);

    if (!policy) {
      return res.status(404).json({
        status: "fail",
        message: "Legal policy not found.",
      });
    }

    policy.status = "draft";
    policy.updated_by = req.user?.id || null;
    await policy.save();

    return res.status(200).json({
      status: "success",
      message: "Policy unpublished and set to draft.",
      data: policy,
    });
  } catch (error) {
    console.error("Error in unpublishPolicy:", error);
    return res.status(500).json({
      status: "error",
      message: error.message || "Failed to unpublish legal policy.",
    });
  }
};

/**
 * 7. Get version history for a policy
 */
exports.getPolicyVersions = async (req, res) => {
  try {
    const { id } = req.params;
    const isNumeric = !isNaN(id);
    const policy = await LegalPolicy.findOne({
      where: isNumeric ? { id } : { slug: id },
    });

    if (!policy) {
      return res.status(404).json({
        status: "fail",
        message: "Legal policy not found.",
      });
    }

    const versions = await LegalPolicyVersion.findAll({
      where: { policy_id: policy.id },
      order: [["published_at", "DESC"]],
    });

    return res.status(200).json({
      status: "success",
      count: versions.length,
      data: versions,
    });
  } catch (error) {
    console.error("Error in getPolicyVersions:", error);
    return res.status(500).json({
      status: "error",
      message: error.message || "Failed to retrieve policy versions.",
    });
  }
};

/**
 * 8. Discard draft content
 */
exports.discardDraft = async (req, res) => {
  try {
    const { id } = req.params;
    const policy = await LegalPolicy.findByPk(id);

    if (!policy) {
      return res.status(404).json({
        status: "fail",
        message: "Legal policy not found.",
      });
    }

    policy.draft_content = null;
    policy.has_draft = false;
    await policy.save();

    return res.status(200).json({
      status: "success",
      message: "Draft discarded successfully.",
      data: policy,
    });
  } catch (error) {
    console.error("Error in discardDraft:", error);
    return res.status(500).json({
      status: "error",
      message: error.message || "Failed to discard draft.",
    });
  }
};

/**
 * 9. Get DPDP user consent audit logs
 */
exports.getPolicyConsents = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const where = {};
    if (id && id !== "all") {
      const isNumeric = !isNaN(id);
      if (isNumeric) {
        where.policy_id = id;
      } else {
        const p = await LegalPolicy.findOne({ where: { slug: id } });
        if (p) where.policy_id = p.id;
      }
    }

    const { count, rows } = await UserPolicyConsent.findAndCountAll({
      where,
      limit: parseInt(limit, 10),
      offset,
      order: [["consented_at", "DESC"]],
      include: [
        {
          model: LegalPolicy,
          as: "policy",
          attributes: ["id", "title", "slug"],
        },
      ],
    });

    return res.status(200).json({
      status: "success",
      total: count,
      page: parseInt(page, 10),
      totalPages: Math.ceil(count / parseInt(limit, 10)),
      data: rows,
    });
  } catch (error) {
    console.error("Error in getPolicyConsents:", error);
    return res.status(500).json({
      status: "error",
      message: error.message || "Failed to retrieve consent records.",
    });
  }
};
