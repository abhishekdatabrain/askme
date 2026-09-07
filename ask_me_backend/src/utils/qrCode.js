const QRCode = require('qrcode');

/**
 * Server-side QR Code generation.
 * Avoids third-party external services.
 */
const generateQrDataUrl = async (text) => {
  try {
    return await QRCode.toDataURL(text, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    });
  } catch (error) {
    // Fallback data URI if QR generation fails
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><text x="10" y="150" font-size="14">QR Error</text></svg>`;
  }
};

module.exports = {
  generateQrDataUrl,
};
