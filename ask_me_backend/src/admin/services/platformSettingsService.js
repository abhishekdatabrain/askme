let platformSettingsState = {
  broadcastMessage: 'Welcome to AskMe PRO Live Streaming Control Room.',
  maintenanceMode: false,
};

class PlatformSettingsService {
  async getSettings() {
    return {
      broadcastMessage: platformSettingsState.broadcastMessage,
      maintenanceMode: platformSettingsState.maintenanceMode,
      razorpayKey: process.env.RAZORPAY_KEY_ID ? 'rzp_live_set' : null,
      payuMerchantId: process.env.PAYU_MERCHANT_ID ? 'payu_merchant_set' : null,
    };
  }

  async updateSettings(body) {
    const { broadcastMessage, maintenanceMode } = body;

    if (broadcastMessage !== undefined) platformSettingsState.broadcastMessage = broadcastMessage;
    if (maintenanceMode !== undefined) platformSettingsState.maintenanceMode = Boolean(maintenanceMode);

    return await this.getSettings();
  }
}

module.exports = new PlatformSettingsService();
