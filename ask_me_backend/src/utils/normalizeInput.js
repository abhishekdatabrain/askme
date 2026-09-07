/**
 * Input Normalization Utility
 * Handles request payload field alias mappings (e.g. creatorId / creator_id, fullName / full_name)
 * at the controller boundary.
 */

/**
 * Derives authenticated creator ID from req.user
 * Returns null if not authenticated (does NOT fallback to pseudo-IDs like 1)
 */
const getAuthenticatedCreatorId = (req) => {
  if (req && req.user && req.user.id) {
    return req.user.id;
  }
  return null;
};

/**
 * Normalizes common input aliases across request body/query
 */
const normalizeCreatorInput = (body = {}, query = {}, params = {}) => {
  return {
    creatorId: params.creatorId || params.id || body.creatorId || body.creator_id || query.creatorId || query.creator_id || null,
    sessionId: params.sessionId || params.id || body.sessionId || body.session_id || query.sessionId || query.session_id || null,
    sessionCode: params.sessionCode || body.sessionCode || body.session_code || query.sessionCode || query.session_code || null,
    fullName: body.fullName || body.full_name || body.name || null,
    username: body.username ? String(body.username).trim().replace(/^@+/, '') : null,
    email: body.email ? String(body.email).trim().toLowerCase() : null,
    mobile: body.mobileNumber || body.mobile || body.phone || null,
    profileImage: body.profileImage || body.profile_image || body.avatar || null,
    country: body.country || 'India',
    bio: body.bio || null,
    category: body.category || null,
    dateOfBirth: body.dateOfBirth || body.date_of_birth || null,
    panNumber: body.panNumber || body.pan_number || body.pan || null,
    documentType: body.documentType || body.document_type || null,
    documentNumber: body.documentNumber || body.document_number || null,
    fileUrl: body.fileUrl || body.file_url || body.documentFileUrl || body.document_file_url || null,
    accountHolderName: body.accountHolderName || body.account_holder_name || null,
    bankName: body.bankName || body.bank_name || null,
    accountNumber: body.accountNumber || body.account_number || null,
    ifscCode: body.ifscCode || body.ifsc_code ? String(body.ifscCode || body.ifsc_code).trim().toUpperCase() : null,
    upiId: body.upiId || body.upi_id ? String(body.upiId || body.upi_id).trim() : null,
  };
};

module.exports = {
  getAuthenticatedCreatorId,
  normalizeCreatorInput,
};
