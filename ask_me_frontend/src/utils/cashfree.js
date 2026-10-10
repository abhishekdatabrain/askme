/**
 * Utility for Cashfree Payments SDK loading and API helper methods
 */

/**
 * Dynamically load the Cashfree JS SDK script
 * @param {string} environment - 'production' | 'sandbox' | 'TEST' | 'PROD'
 * @returns {Promise<any>} Cashfree SDK instance
 */
export const loadCashfree = (environment = 'sandbox') => {
  return new Promise((resolve, reject) => {
    const isProd =
      String(environment).toLowerCase() === 'production' ||
      String(environment).toUpperCase() === 'PROD';
    const mode = isProd ? 'production' : 'sandbox';

    const initCashfree = () => {
      if (typeof window !== 'undefined' && window.Cashfree) {
        try {
          const cashfree = window.Cashfree({ mode });
          resolve(cashfree);
        } catch (err) {
          reject(err);
        }
      } else {
        reject(new Error('Cashfree SDK failed to initialize'));
      }
    };

    if (typeof window !== 'undefined' && window.Cashfree) {
      initCashfree();
      return;
    }

    const scriptId = 'cashfree-js-sdk';
    let script = document.getElementById(scriptId);

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
      script.async = true;
      script.onload = () => initCashfree();
      script.onerror = () => reject(new Error('Failed to load Cashfree SDK script'));
      document.body.appendChild(script);
    } else {
      script.addEventListener('load', initCashfree);
    }
  });
};

/**
 * Helper to make HTTP requests to Cashfree backend endpoints
 * @param {string} url - API endpoint URL
 * @param {object} data - Payload object
 * @param {string} [token] - Optional Authorization token
 * @returns {Promise<any>}
 */
export const cashfreeRequest = async (url, data, token = null) => {
  if (!url) {
    throw new Error('API Endpoint URL is undefined. Please check API_ENDPOINTS configuration.');
  }

  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(data || {}),
  });

  let result;
  try {
    result = await response.json();
  } catch (err) {
    result = {};
  }

  if (!response.ok) {
    const error = new Error(
      result.message || result.error || `Request failed with status ${response.status}`
    );
    error.statusCode = response.status;
    error.data = result;
    throw error;
  }

  return result;
};

/**
 * Create a new Cashfree payment attempt object
 * @param {string} fingerprint - JSON stringified payment payload
 * @returns {object}
 */
export const createCashfreeAttempt = (fingerprint) => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return {
    idempotencyKey: `cf_idem_${timestamp}_${random}`,
    verificationToken: `cf_verif_${timestamp}_${random}`,
    fingerprint,
    orderId: null,
  };
};
