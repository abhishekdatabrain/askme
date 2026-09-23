const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const User = require('../models/userModel');
const { verifyTruecallerResponse, normalizePhone } = require('../services/truecaller.service');

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Helper to generate JWT Token
 */
const generateToken = (userId, role) => {
  const secret = process.env.JWT_SECRET || process.env.JWT_ACCESS_SECRET || '';
  const expiresIn = process.env.JWT_SECRET_EXPIRES || process.env.JWT_ACCESS_EXPIRES || '7d';
  return jwt.sign({ id: userId, role }, secret, {
    expiresIn: String(expiresIn || '7d').trim(),
  });
};

/**
 * @desc    Authenticate Viewer using Verified Truecaller Credentials
 * @route   POST /api/auth/truecaller/viewer
 * @access  Public
 */
const truecallerAuthViewer = async (req, res, next) => {
  try {
    console.log('[Truecaller Controller] Processing auth request:', {
      hasPayload: !!req.body.payload,
      hasSignature: !!req.body.signature,
      hasAccessToken: !!req.body.accessToken,
    });

    const verification = await verifyTruecallerResponse(req.body);
    console.log('Incoming Body:', req.body);
    if (!verification.success || !verification.phone) {
      return res.status(401).json({
        status: 'fail',
        message: verification.reason || 'Truecaller verification failed.',
      });
    }

    const cleanPhone = verification.phone; // e.g. 919876543210
    const tenDigit = verification.tenDigit; // e.g. 9876543210
    const e164 = verification.e164; // e.g. +919876543210
    const truecallerId = verification.truecallerId;

    const displayName = verification.name || `Viewer ${tenDigit.slice(-4)}`;
    const userEmail = verification.email || `${cleanPhone}@truecaller.user`;

    // Search existing user by truecaller_id or normalized phone variants
    let user = await User.findOne({
      where: {
        [Op.or]: [
          ...(truecallerId ? [{ truecaller_id: truecallerId }] : []),
          { phone: cleanPhone },
          { phone: tenDigit },
          { phone: e164 },
          { email: userEmail },
        ],
      },
    }).catch((err) => {
      console.warn('[Truecaller Controller] User lookup warning:', err.message);
      return null;
    });

    if (user) {
      // Update truecaller_verified status if not already set
      let needsSave = false;
      if (!user.truecaller_verified) {
        user.truecaller_verified = true;
        needsSave = true;
      }
      if (truecallerId && !user.truecaller_id) {
        user.truecaller_id = truecallerId;
        needsSave = true;
      }
      if (needsSave) {
        await user.save().catch((saveErr) => console.warn('User update warning:', saveErr.message));
      }
    } else {
      // Auto-register new viewer user with truecaller_verified = true
      const randomPassword = await bcrypt.hash(`tc_${Date.now()}_${Math.random()}`, 10);
      user = await User.create({
        name: displayName,
        email: userEmail,
        phone: cleanPhone,
        password: randomPassword,
        role: 'viewer', // Default user/viewer role in schema
        truecaller_id: truecallerId || cleanPhone,
        truecaller_verified: true,
      });
    }

    const token = generateToken(user.id, user.role);

    return res.status(200).json({
      status: 'success',
      message: 'Truecaller login successful.',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role || 'viewer',
          truecaller_verified: user.truecaller_verified,
        },
      },
    });
  } catch (error) {
    console.error('[Truecaller Controller] Error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error during Truecaller authentication.',
    });
  }
};

/**
 * @desc    Truecaller OAuth / Web Redirect Callback Handler
 * @route   GET /api/auth/truecaller/callback
 * @access  Public
 */
// const truecallerCallback = async (req, res, next) => {
//   try {
//     const { code, state, error, payload, signature } = req.query;

//     if (error) {
//       return res.status(401).json({
//         status: 'fail',
//         message: `Truecaller authorization failed: ${error}`,
//       });
//     }

//     if (payload && signature) {
//       const verification = await verifyTruecallerResponse({ payload, signature });
//       console.log(verification, "trueverification");
//       if (verification.success) {
//         return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/viewers/login?tc_status=success&phone=${verification.phone}`);
//       }
//     }

//     return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/viewers/login?tc_status=fail`);
//   } catch (err) {
//     console.error('[Truecaller Callback Error]:', err);
//     next(err);
//   }
// };
const truecallerCallback = async (req, res) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

  try {
    // Truecaller can send params in req.query or req.body depending on platform
    const data = { ...req.query, ...req.body };
    const { error, payload, signature, accessToken } = data;

    console.log('[Truecaller Callback] Received payload keys:', Object.keys(data));

    if (error) {
      console.warn('[Truecaller Callback Error]:', error);
      return res.redirect(`${frontendUrl}/viewers/login?error=${encodeURIComponent(error)}`);
    }

    if ((payload && signature) || accessToken) {
      const verification = await verifyTruecallerResponse({
        payload,
        signature,
        accessToken,
      });

      if (verification && verification.success) {
        const cleanPhone = verification.phone;
        const displayName = verification.name || `Viewer ${verification.tenDigit.slice(-4)}`;
        const userEmail = verification.email || `${cleanPhone}@truecaller.user`;

        let user = await User.findOne({
          where: {
            [Op.or]: [
              { phone: cleanPhone },
              { phone: verification.tenDigit },
              { phone: verification.e164 },
              { email: userEmail },
            ],
          },
        });

        if (!user) {
          const randomPassword = await bcrypt.hash(`tc_${Date.now()}`, 10);
          user = await User.create({
            name: displayName,
            email: userEmail,
            phone: cleanPhone,
            password: randomPassword,
            role: 'viewer',
            truecaller_id: verification.truecallerId || cleanPhone,
            truecaller_verified: true,
          });
        } else if (!user.truecaller_verified) {
          user.truecaller_verified = true;
          await user.save();
        }

        const token = generateToken(user.id, user.role);

        // Safe User Object for Frontend
        const userParam = encodeURIComponent(
          JSON.stringify({
            id: user.id,
            name: user.name,
            phone: user.phone,
            role: user.role,
          })
        );

        // Redirect directly to dashboard with token & user payload
        return res.redirect(`${frontendUrl}/viewers/dashboard?token=${token}&user=${userParam}`);
      }
    }

    return res.redirect(`${frontendUrl}/viewers/login?tc_status=fail`);
  } catch (err) {
    console.error('[Truecaller Callback Exception]:', err);
    return res.redirect(`${frontendUrl}/viewers/login?error=server_error`);
  }
};
module.exports = {
  truecallerAuthViewer,
  truecallerCallback,
};
