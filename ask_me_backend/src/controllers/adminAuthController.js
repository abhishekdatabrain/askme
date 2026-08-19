const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const {
  Admin,
  AdminRefreshToken,
} = require("../models");
// const generateToken = require('../utils/generateToken');
const generateAccessToken = (admin) => {

  return jwt.sign(
    {
      id: admin.id.toString(),
      email: admin.email,
      role: admin.role,
    },
    process.env.JWT_ACCESS_SECRET,
    {
      expiresIn: process.env.JWT_ACCESS_EXPIRES || "15m",
    }
  );
};
const generateRefreshToken = () => {

  return crypto.randomBytes(64).toString("hex");

};
const hashRefreshToken = (token) => {

  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

};

/**
 * @desc    Register a new user dynamically in "Abhishek".users table
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    console.log(req.body)
    const userName = name || 'User';
    const userEmail = (email || '').trim().toLowerCase();

    if (!userEmail || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Email and password are required',
      });
    }

    if (password.length < 8) {

      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });

    }
    // 1. Dynamic DB check: Check if user already exists in PostgreSQL database
    const existingUser = await Admin.findOne({
      where: { email: userEmail },
    });

    if (existingUser) {
      return res.status(409).json({
        status: 'fail',
        message: 'Admin with this email already exists',
      });
    }
    const passwordHash = await bcrypt.hash(
      password,
      12
    );
    // 2. Dynamic DB create: Insert record into "Abhishek".users (Password automatically hashed via bcrypt hook)
    const admin = await Admin.create({
      name: userName,
      email: userEmail,
      password_hash: passwordHash,
      role: role || 'admin', // Table default is 'admin'
      is_active: true,

    });

    // 3. Generate JWT Token
    // const token = generateToken(newUser.id, newUser.role);

    // 4. Return HTTP 201 Created with sanitized public user details
    return res.status(201).json({

      success: true,

      message: "Admin registered successfully",

      data: {

        id: admin.id,

        name: admin.name,

        email: admin.email,

        role: admin.role,

        is_active: admin.is_active,

      },

    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login User dynamically against PostgreSQL database ("Abhishek".users)
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {

    const {
      email,
      password,
    } = req.body;


    // -----------------------------
    // Validation
    // -----------------------------

    if (!email || !password) {

      return res.status(400).json({

        success: false,

        message: "Email and password are required",

      });

    }


    // -----------------------------
    // Find Admin
    // -----------------------------

    const admin = await Admin.findOne({

      where: {

        email: email.toLowerCase().trim(),

      },

    });


    if (!admin) {

      return res.status(401).json({

        success: false,

        message: "Invalid email or password",

      });

    }


    // -----------------------------
    // Check Active
    // -----------------------------

    if (!admin.is_active) {

      return res.status(403).json({

        success: false,

        message: "Admin account is inactive",

      });

    }


    // -----------------------------
    // Compare Password
    // -----------------------------

    const passwordMatch = await bcrypt.compare(

      password,

      admin.password_hash

    );


    if (!passwordMatch) {

      return res.status(401).json({

        success: false,

        message: "Invalid email or password",

      });

    }


    // -----------------------------
    // Generate Access Token
    // -----------------------------

    const accessToken = generateAccessToken(admin);


    // -----------------------------
    // Generate Refresh Token
    // -----------------------------

    const refreshToken = generateRefreshToken();


    // -----------------------------
    // Hash Refresh Token
    // -----------------------------

    const tokenHash = hashRefreshToken(
      refreshToken
    );


    // -----------------------------
    // Refresh Token Expiry
    // -----------------------------

    const expiresAt = new Date();

    expiresAt.setDate(
      expiresAt.getDate() + 7
    );


    // -----------------------------
    // Save Refresh Token
    // -----------------------------

    await AdminRefreshToken.create({

      admin_id: admin.id,

      token_hash: tokenHash,

      expires_at: expiresAt,

    });


    // -----------------------------
    // Set HttpOnly Cookie
    // -----------------------------

    res.cookie(
      "admin_refresh_token",
      refreshToken,
      {
        httpOnly: true,

        secure: process.env.NODE_ENV === "development",

        sameSite:
          process.env.NODE_ENV === "development"
            ? "none"
            : "lax",

        maxAge:
          7 * 24 * 60 * 60 * 1000,

        path: "/",
      }
    );


    // -----------------------------
    // Response
    // -----------------------------

    return res.status(200).json({

      success: true,

      message: "Login successful",

      accessToken,

      admin: {

        id: admin.id,

        name: admin.name,

        email: admin.email,

        role: admin.role,

        is_active: admin.is_active,

      },

    });

  } catch (error) {

    console.error("Login Error:", error);

    return res.status(500).json({

      success: false,

      message: "Internal server error",

    });

  }

};

module.exports = {
  register,
  login,
  // getMe,
};
