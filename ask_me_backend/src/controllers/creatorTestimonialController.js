const CreatorTestimonial = require('../models/CreatorTestimonialModel');
const { Op } = require('sequelize');

// Default initial seed data for "Loved by Top Live Streamers"
// const DEFAULT_TESTIMONIALS = [
//   {
//     creator_name: 'TechBurner Live',
//     username: '@techburner',
//     profile_image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
//     testimonial: 'AskMe completely transformed my live stream. Instead of having hundreds of frantic chat messages scroll by unread every second, I have a clean, organized queue on my iPad. Best of all, keeping 85% with zero Apple or app-store commission has doubled our Q&A broadcast revenue.',
//     metric_label: 'Average Live Q&A Payout',
//     metric_value: '₹3.2K+ /stream',
//     creator_type: 'YouTube Live Creator',
//     platform: 'YouTube',
//     social_handle: '@techburner',
//     followers: '3.4M Subs',
//     profile_link: 'https://youtube.com/@techburner',
//     verified: true,
//     category: 'Technology',
//     display_order: 1,
//     featured: true,
//     show_on_landing_page: true,
//     status: 'active',
//   },
//   {
//     creator_name: 'FinCal Strategy',
//     username: '@fincal_live',
//     profile_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
//     testimonial: 'When viewers ask about tax strategies or portfolio allocations, they need thorough answers, not a one-liner before the message vanishes. With AskMe, each question stays pinned until I answer it, and the instant bank settlements via IMPS are seamless.',
//     metric_label: 'Question Answer Rate',
//     metric_value: '99.4%',
//     creator_type: 'Finance Streamer',
//     platform: 'YouTube',
//     social_handle: '@fincal_live',
//     followers: '1.8M Subs',
//     profile_link: 'https://youtube.com/@fincal_live',
//     verified: true,
//     category: 'Finance',
//     display_order: 2,
//     featured: true,
//     show_on_landing_page: true,
//     status: 'active',
//   },
//   {
//     creator_name: 'GamerX Xtreme',
//     username: '@gamerx_live',
//     profile_image: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=150&q=80',
//     testimonial: 'The OBS browser source overlay is ridiculously good. When a fan submits a question, it triggers an animated lower-third on stream without dropping my FPS in Valorant. The custom QR code on screen makes it super easy for viewers to scan and ask from their phone.',
//     metric_label: 'OBS Overlay Trigger Latency',
//     metric_value: '< 35ms',
//     creator_type: 'Twitch & Kick Streamer',
//     platform: 'Twitch',
//     social_handle: '@gamerx_live',
//     followers: '2.1M Community',
//     profile_link: 'https://twitch.tv/gamerx_live',
//     verified: true,
//     category: 'Gaming',
//     display_order: 3,
//     featured: false,
//     show_on_landing_page: true,
//     status: 'active',
//   },
//   {
//     creator_name: 'Dr. Priya HealthTalk',
//     username: '@dr_priya_health',
//     profile_image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
//     testimonial: 'The Gemini AI moderation is a lifesaver for medical and lifestyle Q&As. It instantly screens out spam and trolls before questions hit my screen, and the direct AskMe feature lets me answer detailed health consultations asynchronously after the stream ends.',
//     metric_label: 'Automated AI Moderation',
//     metric_value: '0 Spam',
//     creator_type: 'Health Streamer',
//     platform: 'YouTube',
//     social_handle: '@dr_priya_health',
//     followers: '620K Followers',
//     profile_link: 'https://youtube.com/@dr_priya_health',
//     verified: true,
//     category: 'Health',
//     display_order: 4,
//     featured: false,
//     show_on_landing_page: true,
//     status: 'active',
//   },
// ];

/**
 * Helper to ensure table exists in PostgreSQL schema and is seeded with initial data
 */
// const ensureTableAndSeed = async () => {
//   try {
//     const countTotal = await CreatorTestimonial.count({ paranoid: false });
//     if (countTotal === 0) {
//       await CreatorTestimonial.bulkCreate(DEFAULT_TESTIMONIALS);
//     }
//   } catch (err) {
//     console.log('Syncing CreatorTestimonial table in database schema...', err.message);
//     await CreatorTestimonial.sync({ alter: true });
//     const countTotal = await CreatorTestimonial.count({ paranoid: false });
//     if (countTotal === 0) {
//       await CreatorTestimonial.bulkCreate(DEFAULT_TESTIMONIALS);
//     }
//   }
// };

/**
 * Public Endpoint: GET /api/public/creator-testimonials
 * Returns active testimonials sorted by display_order ASC for landing page.
 */
const getPublicTestimonials = async (req, res) => {
  try {

    const testimonials = await CreatorTestimonial.findAll({
      where: {
        status: 'active',
        show_on_landing_page: true,
      },
      order: [['display_order', 'ASC']],
    });

    const formattedData = testimonials.map((item) => ({
      id: item.id,
      creatorName: item.creator_name,
      username: item.username,
      followers: item.followers || '',
      creatorType: item.creator_type,
      testimonial: item.testimonial,
      metricLabel: item.metric_label,
      metricValue: item.metric_value,
      profileImage: item.profile_image || '',
      platform: item.platform || 'YouTube',
      socialHandle: item.social_handle || item.username,
      profileLink: item.profile_link || '',
      verified: !!item.verified,
      category: item.category || 'General',
      displayOrder: item.display_order,
      featured: !!item.featured,
      status: item.status,
    }));

    return res.status(200).json({
      success: true,
      data: formattedData,
    });
  } catch (error) {
    console.error('Error in getPublicTestimonials:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch public creator testimonials.',
      error: error.message,
    });
  }
};

/**
 * Admin Endpoint: GET /api/admin/creator-testimonials
 * List all testimonials with search/filters
 */
const getAdminTestimonials = async (req, res) => {
  try {

    const { search, status, category } = req.query;

    const whereCondition = {};
    if (status) {
      whereCondition.status = status;
    }
    if (category && category !== 'All') {
      whereCondition.category = category;
    }
    if (search && search.trim()) {
      const q = `%${search.trim()}%`;
      whereCondition[Op.or] = [
        { creator_name: { [Op.iLike || Op.like]: q } },
        { username: { [Op.iLike || Op.like]: q } },
        { creator_type: { [Op.iLike || Op.like]: q } },
        { testimonial: { [Op.iLike || Op.like]: q } },
      ];
    }

    const testimonials = await CreatorTestimonial.findAll({
      where: whereCondition,
      order: [['display_order', 'ASC'], ['id', 'ASC']],
    });

    return res.status(200).json({
      success: true,
      count: testimonials.length,
      data: testimonials,
    });
  } catch (error) {
    console.error('Error in getAdminTestimonials:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch admin testimonials.',
      error: error.message,
    });
  }
};

/**
 * Admin Endpoint: GET /api/admin/creator-testimonials/:id
 */
const getTestimonialById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await CreatorTestimonial.findByPk(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    console.error('Error in getTestimonialById:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch testimonial.',
      error: error.message,
    });
  }
};

/**
 * Admin Endpoint: POST /api/admin/creator-testimonials
 * Create a new testimonial
 */
const createTestimonial = async (req, res) => {
  try {

    const {
      creator_name,
      username,
      profile_image,
      testimonial,
      metric_label,
      metric_value,
      creator_type,
      platform,
      social_handle,
      followers,
      profile_link,
      verified,
      category,
      display_order,
      featured,
      show_on_landing_page,
      status,
    } = req.body;

    // Field Validation
    if (!creator_name || String(creator_name).trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Creator Name is required (max 100 characters).' });
    }
    if (String(creator_name).length > 100) {
      return res.status(400).json({ success: false, message: 'Creator Name must not exceed 100 characters.' });
    }
    if (!username || String(username).trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Username is required (max 100 characters).' });
    }
    if (String(username).length > 100) {
      return res.status(400).json({ success: false, message: 'Username must not exceed 100 characters.' });
    }
    if (!testimonial || String(testimonial).trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Testimonial message is required (max 1000 characters).' });
    }
    if (String(testimonial).length > 1000) {
      return res.status(400).json({ success: false, message: 'Testimonial message must not exceed 1000 characters.' });
    }
    if (!metric_label || String(metric_label).trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Metric Label is required (max 150 characters).' });
    }
    if (String(metric_label).length > 150) {
      return res.status(400).json({ success: false, message: 'Metric Label must not exceed 150 characters.' });
    }
    if (!metric_value || String(metric_value).trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Metric Value is required (max 100 characters).' });
    }
    if (String(metric_value).length > 100) {
      return res.status(400).json({ success: false, message: 'Metric Value must not exceed 100 characters.' });
    }
    if (!creator_type || String(creator_type).trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Creator Type is required.' });
    }

    const orderNum = parseInt(display_order, 10);
    const validDisplayOrder = !isNaN(orderNum) && orderNum >= 1 ? orderNum : 1;

    // Handle File Upload if uploaded via multipart/form-data
    let finalProfileImage = profile_image || '';
    if (req.file) {
      finalProfileImage = `/uploads/profiles/${req.file.filename}`;
    }

    const newTestimonial = await CreatorTestimonial.create({
      creator_name: String(creator_name).trim(),
      username: String(username).trim().startsWith('@') ? String(username).trim() : `@${String(username).trim()}`,
      profile_image: finalProfileImage,
      testimonial: String(testimonial).trim(),
      metric_label: String(metric_label).trim(),
      metric_value: String(metric_value).trim(),
      creator_type: String(creator_type).trim(),
      platform: platform || 'YouTube',
      social_handle: social_handle || username,
      followers: followers || '',
      profile_link: profile_link || '',
      verified: verified !== undefined ? Boolean(verified) : true,
      category: category || 'Technology',
      display_order: validDisplayOrder,
      featured: featured !== undefined ? Boolean(featured) : false,
      show_on_landing_page: show_on_landing_page !== undefined ? Boolean(show_on_landing_page) : true,
      status: status || 'active',
    });

    return res.status(201).json({
      success: true,
      message: 'Creator testimonial created successfully.',
      data: newTestimonial,
    });
  } catch (error) {
    console.error('Error in createTestimonial:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create testimonial.',
      error: error.message,
    });
  }
};

/**
 * Admin Endpoint: PUT /api/admin/creator-testimonials/:id
 * Update existing testimonial
 */
const updateTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await CreatorTestimonial.findByPk(id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Testimonial not found.' });
    }

    const {
      creator_name,
      username,
      profile_image,
      testimonial,
      metric_label,
      metric_value,
      creator_type,
      platform,
      social_handle,
      followers,
      profile_link,
      verified,
      category,
      display_order,
      featured,
      show_on_landing_page,
      status,
    } = req.body;

    // Field Validation
    if (creator_name !== undefined && String(creator_name).trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Creator Name is required.' });
    }
    if (creator_name && String(creator_name).length > 100) {
      return res.status(400).json({ success: false, message: 'Creator Name must not exceed 100 characters.' });
    }
    if (username !== undefined && String(username).trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Username is required.' });
    }
    if (username && String(username).length > 100) {
      return res.status(400).json({ success: false, message: 'Username must not exceed 100 characters.' });
    }
    if (testimonial !== undefined && String(testimonial).trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Testimonial message is required.' });
    }
    if (testimonial && String(testimonial).length > 1000) {
      return res.status(400).json({ success: false, message: 'Testimonial message must not exceed 1000 characters.' });
    }
    if (metric_label !== undefined && String(metric_label).trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Metric Label is required.' });
    }
    if (metric_label && String(metric_label).length > 150) {
      return res.status(400).json({ success: false, message: 'Metric Label must not exceed 150 characters.' });
    }
    if (metric_value !== undefined && String(metric_value).trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Metric Value is required.' });
    }
    if (metric_value && String(metric_value).length > 100) {
      return res.status(400).json({ success: false, message: 'Metric Value must not exceed 100 characters.' });
    }

    // Handle File Upload if new file uploaded
    let finalProfileImage = item.profile_image;
    if (req.file) {
      finalProfileImage = `/uploads/profiles/${req.file.filename}`;
    } else if (profile_image !== undefined) {
      finalProfileImage = profile_image;
    }

    const updatedData = {
      creator_name: creator_name !== undefined ? String(creator_name).trim() : item.creator_name,
      username: username !== undefined ? (String(username).trim().startsWith('@') ? String(username).trim() : `@${String(username).trim()}`) : item.username,
      profile_image: finalProfileImage,
      testimonial: testimonial !== undefined ? String(testimonial).trim() : item.testimonial,
      metric_label: metric_label !== undefined ? String(metric_label).trim() : item.metric_label,
      metric_value: metric_value !== undefined ? String(metric_value).trim() : item.metric_value,
      creator_type: creator_type !== undefined ? String(creator_type).trim() : item.creator_type,
      platform: platform !== undefined ? platform : item.platform,
      social_handle: social_handle !== undefined ? social_handle : item.social_handle,
      followers: followers !== undefined ? followers : item.followers,
      profile_link: profile_link !== undefined ? profile_link : item.profile_link,
      verified: verified !== undefined ? Boolean(verified) : item.verified,
      category: category !== undefined ? category : item.category,
      display_order: display_order !== undefined ? Math.max(1, parseInt(display_order, 10) || 1) : item.display_order,
      featured: featured !== undefined ? Boolean(featured) : item.featured,
      show_on_landing_page: show_on_landing_page !== undefined ? Boolean(show_on_landing_page) : item.show_on_landing_page,
      status: status !== undefined ? status : item.status,
    };

    await item.update(updatedData);

    return res.status(200).json({
      success: true,
      message: 'Testimonial updated successfully.',
      data: item,
    });
  } catch (error) {
    console.error('Error in updateTestimonial:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update testimonial.',
      error: error.message,
    });
  }
};

/**
 * Admin Endpoint: DELETE /api/admin/creator-testimonials/:id
 * Soft delete testimonial record
 */
const deleteTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await CreatorTestimonial.findByPk(id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Testimonial not found.' });
    }

    // Soft Delete via Sequelize paranoid option
    await item.destroy();

    return res.status(200).json({
      success: true,
      message: 'Testimonial deleted successfully (Soft deleted).',
    });
  } catch (error) {
    console.error('Error in deleteTestimonial:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete testimonial.',
      error: error.message,
    });
  }
};

/**
 * Admin Endpoint: PATCH /api/admin/creator-testimonials/:id/status
 * Toggle or update status (active / inactive)
 */
const toggleTestimonialStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const item = await CreatorTestimonial.findByPk(id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Testimonial not found.' });
    }

    const newStatus = status ? status : (item.status === 'active' ? 'inactive' : 'active');
    await item.update({ status: newStatus });

    return res.status(200).json({
      success: true,
      message: `Testimonial status updated to ${newStatus}.`,
      data: item,
    });
  } catch (error) {
    console.error('Error in toggleTestimonialStatus:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update testimonial status.',
      error: error.message,
    });
  }
};

/**
 * Admin Endpoint: PATCH /api/admin/creator-testimonials/order
 * Reorder display_order for multiple items [{ id: 1, display_order: 1 }, ...]
 */
const reorderTestimonials = async (req, res) => {
  try {
    const { orders } = req.body; // Array of { id, display_order }

    if (!Array.isArray(orders)) {
      return res.status(400).json({ success: false, message: 'orders array is required.' });
    }

    for (const item of orders) {
      if (item.id && item.display_order !== undefined) {
        await CreatorTestimonial.update(
          { display_order: parseInt(item.display_order, 10) || 1 },
          { where: { id: item.id } }
        );
      }
    }

    const updatedList = await CreatorTestimonial.findAll({
      order: [['display_order', 'ASC']],
    });

    return res.status(200).json({
      success: true,
      message: 'Testimonial display order updated successfully.',
      data: updatedList,
    });
  } catch (error) {
    console.error('Error in reorderTestimonials:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to reorder testimonials.',
      error: error.message,
    });
  }
};

module.exports = {
  getPublicTestimonials,
  getAdminTestimonials,
  getTestimonialById,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  toggleTestimonialStatus,
  reorderTestimonials,
};
