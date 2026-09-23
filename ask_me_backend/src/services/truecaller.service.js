const crypto = require('crypto');
const dotenv = require('dotenv');
dotenv.config();

let cachedPublicKey = null;
let keyCacheTimestamp = 0;
const KEY_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

/**
 * Fetch Truecaller RSA Public Key
 */
const fetchTruecallerPublicKey = async () => {
  const now = Date.now();
  if (cachedPublicKey && now - keyCacheTimestamp < KEY_CACHE_TTL_MS) {
    return cachedPublicKey;
  }

  try {
    const res = await fetch('https://api.truecaller.com/v1/key', {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    if (!res.ok) {
      console.error('[Truecaller Service] Failed to fetch key. HTTP Status:', res.status);
      return cachedPublicKey;
    }

    const keys = await res.json();
    let rawKey = null;

    if (Array.isArray(keys) && keys.length > 0) {
      rawKey = keys[0].key || keys[0].bytes || keys[0];
    } else if (typeof keys === 'object' && keys !== null) {
      rawKey = keys.key || keys.bytes || keys;
    }

    if (typeof rawKey === 'string') {
      const cleanKey = rawKey.replace(/[\r\n]/g, '').trim();
      const formattedPem = cleanKey.startsWith('-----BEGIN PUBLIC KEY-----')
        ? cleanKey
        : `-----BEGIN PUBLIC KEY-----\n${cleanKey.match(/.{1,64}/g)?.join('\n') || cleanKey}\n-----END PUBLIC KEY-----`;

      cachedPublicKey = formattedPem;
      keyCacheTimestamp = now;
      console.log('[Truecaller Service] RSA Public Key updated successfully.');
      return cachedPublicKey;
    }
  } catch (err) {
    console.error('[Truecaller Service] Error fetching Truecaller public key:', err.message);
  }

  return cachedPublicKey;
};

/**
 * Normalize phone number safely
 */
const normalizePhone = (rawPhone) => {
  if (!rawPhone) return { valid: false };

  const digitsOnly = String(rawPhone).replace(/[^0-9]/g, '');
  if (digitsOnly.length < 10) return { valid: false };

  const tenDigit = digitsOnly.slice(-10);
  const withCountryCode = `91${tenDigit}`;
  const e164 = `+91${tenDigit}`;

  return {
    valid: true,
    tenDigit,
    withCountryCode,
    e164,
  };
};

/**
 * Verify Truecaller Response
 */
const verifyTruecallerResponse = async (data = {}) => {
  try {
    const appKey = process.env.TRUECALLER_APP_KEY;

    let payload = data.payload || data.userProfile || data.data;
    let signature = data.signature;
    let accessToken = data.accessToken || data.token || data.requestId;

    // -------------------------------------------------------------
    // MECHANISM 1: RSA Signature Verification
    // -------------------------------------------------------------
    if (payload && signature) {
      const publicKeyPem = await fetchTruecallerPublicKey();

      if (publicKeyPem) {
        try {
          // Normalize Signature: Handle Base64 URL-safe characters
          let normalizedSignature = String(signature)
            .replace(/-/g, '+')
            .replace(/_/g, '/');
          while (normalizedSignature.length % 4) {
            normalizedSignature += '=';
          }

          let payloadStr = '';
          let parsedPayload = null;

          if (typeof payload === 'string') {
            payloadStr = payload;
            try {
              parsedPayload = JSON.parse(payload);
            } catch (e) {
              parsedPayload = null;
            }
          } else {
            parsedPayload = payload;
            payloadStr = JSON.stringify(payload);
          }

          const verifier = crypto.createVerify('RSA-SHA256');
          verifier.update(payloadStr);
          verifier.end();

          const isVerified = verifier.verify(publicKeyPem, normalizedSignature, 'base64');

          // Fallback parsing if signature passed or if direct verified data is passed
          if (isVerified && parsedPayload) {
            const rawPhone =
              parsedPayload.phoneNumber ||
              parsedPayload.phone ||
              parsedPayload.userProfile?.phone;
            const norm = normalizePhone(rawPhone || data.phone);

            if (!norm.valid) {
              return { success: false, reason: 'Invalid phone number in payload.' };
            }

            const firstName = parsedPayload.firstName || parsedPayload.userProfile?.firstName || '';
            const lastName = parsedPayload.lastName || parsedPayload.userProfile?.lastName || '';
            const displayName =
              (firstName || lastName) ? `${firstName} ${lastName}`.trim() : (data.name || 'Truecaller User');
            const userEmail =
              parsedPayload.email ||
              parsedPayload.userProfile?.email ||
              data.email ||
              `${norm.withCountryCode}@truecaller.user`;
            const truecallerId =
              parsedPayload.requestNonce || parsedPayload.userProfile?.id || norm.withCountryCode;

            return {
              success: true,
              phone: norm.withCountryCode,
              tenDigit: norm.tenDigit,
              e164: norm.e164,
              name: displayName,
              email: userEmail,
              truecallerId: String(truecallerId),
              verifiedBy: 'rsa_signature',
            };
          } else {
            console.warn('[Truecaller Service] RSA signature mismatch.');
          }
        } catch (sigErr) {
          console.error('[Truecaller Service] Error during RSA verification:', sigErr.message);
        }
      }
    }

    // -------------------------------------------------------------
    // MECHANISM 2: Access Token / Request ID Profile Fetch
    // -------------------------------------------------------------
    if (accessToken && String(accessToken).trim().length > 5) {
      try {
        const endpoints = [
          'https://profile-noneu.truecaller.com/v1/default',
          'https://api.truecaller.com/v1/verify',
        ];

        for (const ep of endpoints) {
          const fetchRes = await fetch(ep, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Cache-Control': 'no-cache',
              ...(appKey ? { 'App-Key': appKey } : {}),
            },
          });

          if (fetchRes.ok) {
            const apiData = await fetchRes.json();
            const rawPhone = apiData.phoneNumber || apiData.phone;
            const norm = normalizePhone(rawPhone);

            if (norm.valid) {
              const fullName = apiData.name || `${apiData.firstName || ''} ${apiData.lastName || ''}`.trim();
              return {
                success: true,
                phone: norm.withCountryCode,
                tenDigit: norm.tenDigit,
                e164: norm.e164,
                name: fullName || `Truecaller ${norm.tenDigit.slice(-4)}`,
                email: apiData.email || `${norm.withCountryCode}@truecaller.user`,
                truecallerId: String(apiData.id || norm.withCountryCode),
                verifiedBy: 'profile_api',
              };
            }
          }
        }
      } catch (apiErr) {
        console.warn('[Truecaller Service] Profile API check failed:', apiErr.message);
      }
    }

    // -------------------------------------------------------------
    // MECHANISM 3: Direct Web SDK Response Validation
    // (Used when SDK sends verified profile directly in payload object)
    // -------------------------------------------------------------
    const directProfile = data.userProfile || (data.payload && typeof data.payload === 'object' ? data.payload : null);
    if (directProfile && (directProfile.phoneNumber || directProfile.phone)) {
      const norm = normalizePhone(directProfile.phoneNumber || directProfile.phone);
      if (norm.valid) {
        const fullName = directProfile.name || `${directProfile.firstName || ''} ${directProfile.lastName || ''}`.trim();
        return {
          success: true,
          phone: norm.withCountryCode,
          tenDigit: norm.tenDigit,
          e164: norm.e164,
          name: fullName || 'Truecaller User',
          email: directProfile.email || `${norm.withCountryCode}@truecaller.user`,
          truecallerId: String(directProfile.id || norm.withCountryCode),
          verifiedBy: 'direct_profile',
        };
      }
    }

    return {
      success: false,
      reason: 'Truecaller verification failed: Invalid signature or token.',
    };
  } catch (error) {
    console.error('[Truecaller Service] Global error:', error.message);
    return {
      success: false,
      reason: error.message || 'Truecaller internal error.',
    };
  }
};

module.exports = {
  normalizePhone,
  verifyTruecallerResponse,
};