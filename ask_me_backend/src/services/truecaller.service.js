const crypto = require('crypto');
const dotenv = require('dotenv');
dotenv.config();

/**
 * Cached Truecaller Public Key
 */
let cachedPublicKey = null;
let keyCacheTimestamp = 0;
const KEY_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Fetch Truecaller RSA Public Key from official Truecaller API
 */
const fetchTruecallerPublicKey = async () => {
  const now = Date.now();
  if (cachedPublicKey && now - keyCacheTimestamp < KEY_CACHE_TTL_MS) {
    return cachedPublicKey;
  }

  try {
    const res = await fetch('https://api.truecaller.com/v1/key', {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
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
      console.log('[Truecaller Service] Truecaller RSA Public Key updated and cached successfully.');
      return cachedPublicKey;
    }
  } catch (err) {
    console.error('[Truecaller Service] Error fetching Truecaller public key:', err.message);
  }

  return cachedPublicKey;
};

/**
 * Normalize phone number safely
 * Supports formats: +919876543210, 919876543210, 9876543210
 */
const normalizePhone = (rawPhone) => {
  if (!rawPhone) return { valid: false };

  const digitsOnly = String(rawPhone).replace(/[^0-9]/g, '');

  if (digitsOnly.length < 10) {
    return { valid: false };
  }

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
 * Verify Truecaller Response using Official RSA Signature Verification or Profile API
 * STRICT SECURITY: Rejects invalid or unverified requests without fake fallbacks.
 */
const verifyTruecallerResponse = async ({
  payload,
  signature,
  signatureAlgorithm = 'SHA256withRSA',
  accessToken,
  authorizationCode,
  phone,
  name,
  email,
}) => {
  try {
    const appKey = process.env.TRUECALLER_APP_KEY;

    // -------------------------------------------------------------
    // MECHANISM 1: RSA Signature Verification of Truecaller Payload
    // -------------------------------------------------------------
    if (payload && signature) {
      const publicKeyPem = await fetchTruecallerPublicKey();

      if (publicKeyPem) {
        try {
          const payloadStr = typeof payload === 'string' ? payload : JSON.stringify(payload);
          const verifier = crypto.createVerify('RSA-SHA256');
          verifier.update(payloadStr);
          verifier.end();

          const isVerified = verifier.verify(publicKeyPem, signature, 'base64');

          if (isVerified) {
            const parsedPayload = typeof payload === 'string' ? JSON.parse(payload) : payload;
            const rawPhone = parsedPayload.phoneNumber || parsedPayload.phone || parsedPayload.userProfile?.phone;
            const norm = normalizePhone(rawPhone || phone);

            if (!norm.valid) {
              return { success: false, reason: 'Verified Truecaller payload contains invalid phone number.' };
            }

            const firstName = parsedPayload.firstName || parsedPayload.userProfile?.firstName || '';
            const lastName = parsedPayload.lastName || parsedPayload.userProfile?.lastName || '';
            const displayName = (firstName || lastName) ? `${firstName} ${lastName}`.trim() : (name || 'Truecaller User');
            const userEmail = parsedPayload.email || parsedPayload.userProfile?.email || email || `${norm.withCountryCode}@truecaller.user`;
            const truecallerId = parsedPayload.requestNonce || parsedPayload.userProfile?.id || norm.withCountryCode;

            console.log(`[Truecaller Service] Cryptographic RSA signature verified for +${norm.withCountryCode}`);

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
            console.warn('[Truecaller Service] Cryptographic RSA signature verification failed for payload.');
          }
        } catch (sigErr) {
          console.error('[Truecaller Service] Error during RSA verification:', sigErr.message);
        }
      }
    }

    // -------------------------------------------------------------
    // MECHANISM 2: Truecaller Partner Profile Verification API
    // -------------------------------------------------------------
    if (accessToken && String(accessToken).trim().length > 5 && appKey) {
      try {
        const fetchRes = await fetch('https://api.truecaller.com/v1/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
            'App-Key': appKey,
          },
        });

        if (fetchRes.ok) {
          const apiData = await fetchRes.json();
          console.log('[Truecaller Service] Truecaller API profile verified:', apiData);

          if (apiData?.phoneNumber) {
            const norm = normalizePhone(apiData.phoneNumber);
            if (norm.valid) {
              return {
                success: true,
                phone: norm.withCountryCode,
                tenDigit: norm.tenDigit,
                e164: norm.e164,
                name: apiData.name || name || `Truecaller ${norm.tenDigit.slice(-4)}`,
                email: apiData.email || email || `${norm.withCountryCode}@truecaller.user`,
                truecallerId: String(apiData.id || norm.withCountryCode),
                verifiedBy: 'profile_api',
              };
            }
          }
        } else {
          console.warn('[Truecaller Service] Truecaller API status code:', fetchRes.status);
        }
      } catch (apiErr) {
        console.warn('[Truecaller Service] Truecaller API fetch failed:', apiErr.message);
      }
    }

    // -------------------------------------------------------------
    // NO VERIFICATION MATCHED - STRICT FAILURE REJECTION
    // -------------------------------------------------------------
    console.warn('[Truecaller Service] Truecaller verification failed: No valid signature or API token provided.');
    return {
      success: false,
      reason: 'Truecaller verification failed. Signature or token could not be validated.',
    };

  } catch (error) {
    console.error('[Truecaller Service] Verification error:', error.message);
    return {
      success: false,
      reason: 'Truecaller verification process encountered an internal error.',
    };
  }
};

module.exports = {
  normalizePhone,
  verifyTruecallerResponse,
};
