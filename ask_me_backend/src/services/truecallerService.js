const { verifyTruecallerResponse, normalizePhone } = require('./truecaller.service');

/**
 * Backward compatibility wrapper for verifyTruecallerToken
 */
const verifyTruecallerToken = async (params) => {
  return await verifyTruecallerResponse(params);
};

module.exports = {
  verifyTruecallerToken,
  verifyTruecallerResponse,
  normalizePhone,
};
