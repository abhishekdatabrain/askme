const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs");

/**
 * Configure Nodemailer Transport from environment variables with fallback
 */
const getTransporter = () => {
  const host = process.env.SMTP_HOST || process.env.MAIL_HOST;
  const port = process.env.SMTP_PORT
    ? Number(process.env.SMTP_PORT)
    : 587;

  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;

  if (host && user && pass) {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      requireTLS: port === 587,
      auth: {
        user,
        pass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    return transporter;
  }

  console.log("[SMTP] Missing SMTP configuration");
  return null;
};

/**
 * Get logo attachment for inline CID embedding in emails
 */
const getLogoAttachment = () => {
  try {
    const logoPath = path.join(__dirname, "../assets/logo.png");
    if (fs.existsSync(logoPath)) {
      return {
        filename: "logo.png",
        path: logoPath,
        cid: "askmelogo",
      };
    }
  } catch (e) {
    console.warn("Logo attachment warning:", e.message);
  }
  return null;
};

/**
 * Generate Responsive HTML Email Template tailored by role
 */
const buildWelcomeEmailHtml = ({ name, role }) => {
  const isCreator = String(role).toLowerCase() === "creator";
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  const dashboardUrl = isCreator ? `${frontendUrl}` : `${frontendUrl}`;
  const recipientName = name || (isCreator ? "Creator" : "Viewer");

  if (isCreator) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to AskMe</title>
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #0A0A0F; color: #F5F5F7; margin: 0; padding: 40px 16px; -webkit-font-smoothing: antialiased; }
        .wrapper { width: 100%; max-width: 540px; margin: 0 auto; }
        .brand-header { text-align: center; margin-bottom: 24px; }
        .brand-text { font-size: 24px; font-weight: 900; color: #1C1C28; text-decoration: none; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; }
        .brand-red { color: #EB1000; }
        .card { background-color: #12121A; border: 1px solid #1C1C28; border-radius: 24px; padding: 40px 36px; box-shadow: 0 20px 50px rgba(0,0,0,0.6); }
        .title { font-size: 28px; font-weight: 900; color: #FFFFFF; margin: 0 0 14px 0; letter-spacing: -0.5px; line-height: 1.2; }
        .subtitle { font-size: 15px; line-height: 1.6; color: #E2E8F0; margin: 0 0 32px 0; font-weight: 400; }
        .step-table { width: 100%; border-collapse: collapse; margin-bottom: 28px; }
        .step-num { background-color: rgba(235, 16, 0, 0.12); color: #FF3B30; border: 1px solid rgba(235, 16, 0, 0.35); font-weight: 900; font-size: 12px; width: 28px; height: 28px; border-radius: 50%; text-align: center; line-height: 28px; display: inline-block; }
        .step-title { font-size: 15px; font-weight: 800; color: #FFFFFF; margin-bottom: 3px; }
        .step-desc { font-size: 13.5px; color: #94A3B8; line-height: 1.5; }
        .cta-btn { display: inline-block; background: linear-gradient(90deg, #FF3B30 0%, #EB1000 100%); color: #FFFFFF !important; font-weight: 800; font-size: 15px; padding: 14px 32px; border-radius: 14px; text-decoration: none; margin-top: 8px; margin-bottom: 32px; box-shadow: 0 6px 25px rgba(235, 16, 0, 0.4); text-align: center; }
        .divider { border-top: 1px solid #1F1F2E; padding-top: 24px; margin-top: 12px; }
        .footer-note { font-size: 13.5px; color: #94A3B8; line-height: 1.6; margin: 0; }
        .outer-footer { text-align: center; margin-top: 24px; font-size: 12px; color: #64748B; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="brand-header">
          <a href="${frontendUrl}" style="text-decoration: none;">
            <img src="cid:askmelogo" alt="AskMe" style="height: 36px; vertical-align: middle; margin-right: 6px; border: 0;" />
            <span class="brand-text">AskMe<span class="brand-red">.live</span></span>
          </a>
        </div>

        <div class="card">
          <h1 class="title">Welcome to AskMe, ${recipientName}</h1>
          <p class="subtitle">
            Your creator account is ready. Share your AskMe link or QR code on your next stream, and every question lands in one queue &mdash; never buried in chat.
          </p>

          <table class="step-table">
            <tr>
              <td valign="top" width="44" style="padding-bottom: 24px;">
                <div class="step-num">1</div>
              </td>
              <td valign="top" style="padding-bottom: 24px;">
                <div class="step-title">Verify your identity</div>
                <div class="step-desc">Complete KYC to unlock payouts and withdrawals.</div>
              </td>
            </tr>
            <tr>
              <td valign="top" width="44" style="padding-bottom: 24px;">
                <div class="step-num">2</div>
              </td>
              <td valign="top" style="padding-bottom: 24px;">
                <div class="step-title">Get your AskMe link &amp; QR</div>
                <div class="step-desc">Drop it in your stream description, pinned chat, or bio.</div>
              </td>
            </tr>
            <tr>
              <td valign="top" width="44">
                <div class="step-num">3</div>
              </td>
              <td valign="top">
                <div class="step-title">Add the OBS overlay</div>
                <div class="step-desc">See questions live on your dashboard while you stream.</div>
              </td>
            </tr>
          </table>

          <div>
            <a href="${dashboardUrl}" class="cta-btn">Go to Creator Studio</a>
          </div>

          <div class="divider">
            <p class="footer-note">You won't be able to withdraw earnings until KYC is verified &mdash; it only takes a few minutes.</p>
          </div>
        </div>

        <div class="outer-footer">
          AskMe Creator Platform &bull; <a href="${frontendUrl}" style="color: #64748B; text-decoration: underline;">askme.live</a>
        </div>
      </div>
    </body>
    </html>
    `;
  }

  // Viewer Email Template
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to AskMe</title>
    <style>
      body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #0A0A0F; color: #F5F5F7; margin: 0; padding: 40px 16px; -webkit-font-smoothing: antialiased; }
      .wrapper { width: 100%; max-width: 540px; margin: 0 auto; }
      .brand-header { text-align: center; margin-bottom: 24px; }
      .brand-text { font-size: 24px; font-weight: 900; color: #FFFFFF; text-decoration: none; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; }
      .brand-red { color: #EB1000; }
      .card { background-color: #12121A; border: 1px solid #1C1C28; border-radius: 24px; padding: 40px 36px; box-shadow: 0 20px 50px rgba(0,0,0,0.6); }
      .title { font-size: 28px; font-weight: 900; color: #FFFFFF; margin: 0 0 14px 0; letter-spacing: -0.5px; line-height: 1.2; }
      .subtitle { font-size: 15px; line-height: 1.6; color: #E2E8F0; margin: 0 0 32px 0; font-weight: 400; }
      .step-table { width: 100%; border-collapse: collapse; margin-bottom: 28px; }
      .step-num { background-color: rgba(235, 16, 0, 0.12); color: #FF3B30; border: 1px solid rgba(235, 16, 0, 0.35); font-weight: 900; font-size: 12px; width: 28px; height: 28px; border-radius: 50%; text-align: center; line-height: 28px; display: inline-block; }
      .step-title { font-size: 15px; font-weight: 800; color: #FFFFFF; margin-bottom: 3px; }
      .step-desc { font-size: 13.5px; color: #94A3B8; line-height: 1.5; }
      .cta-btn { display: inline-block; background: linear-gradient(90deg, #FF3B30 0%, #EB1000 100%); color: #FFFFFF !important; font-weight: 800; font-size: 15px; padding: 14px 32px; border-radius: 14px; text-decoration: none; margin-top: 8px; margin-bottom: 32px; box-shadow: 0 6px 25px rgba(235, 16, 0, 0.4); text-align: center; }
      .divider { border-top: 1px solid #1F1F2E; padding-top: 24px; margin-top: 12px; }
      .footer-note { font-size: 13.5px; color: #94A3B8; line-height: 1.6; margin: 0; }
      .outer-footer { text-align: center; margin-top: 24px; font-size: 12px; color: #64748B; }
    </style>
  </head>
  <body>
    <div class="wrapper">
      <div class="brand-header">
        <a href="${frontendUrl}" style="text-decoration: none;">
          <img src="cid:askmelogo" alt="AskMe" style="height: 36px; vertical-align: middle; margin-right: 6px; border: 0;" />
          <span class="brand-text">AskMe<span class="brand-red">.live</span></span>
        </a>
      </div>

      <div class="card">
        <h1 class="title">Welcome to AskMe</h1>
        <p class="subtitle">
          Your account is ready. Follow your favorite creators and never miss a live session &mdash; or your chance to ask them something directly.
        </p>

        <table class="step-table">
          <tr>
            <td valign="top" width="44" style="padding-bottom: 24px;">
              <div class="step-num">1</div>
            </td>
            <td valign="top" style="padding-bottom: 24px;">
              <div class="step-title">Follow your favorite creators</div>
              <div class="step-desc">Get notified the moment they go live.</div>
            </td>
          </tr>
          <tr>
            <td valign="top" width="44" style="padding-bottom: 24px;">
              <div class="step-num">2</div>
            </td>
            <td valign="top" style="padding-bottom: 24px;">
              <div class="step-title">Turn on notifications</div>
              <div class="step-desc">Know instantly when your question gets answered.</div>
            </td>
          </tr>
          <tr>
            <td valign="top" width="44">
              <div class="step-num">3</div>
            </td>
            <td valign="top">
              <div class="step-title">Ask your first question</div>
              <div class="step-desc">Scan a QR code or tap a creator's AskMe link during any stream.</div>
            </td>
          </tr>
        </table>

        <div>
          <a href="${frontendUrl}" class="cta-btn">Explore Live Creators</a>
        </div>

        <div class="divider">
          <p class="footer-note">Your questions stay in a dedicated queue, not a scrolling chat &mdash; so they actually get seen.</p>
        </div>
      </div>

      <div class="outer-footer">
        AskMe Live Stream Community &bull; <a href="${frontendUrl}" style="color: #64748B; text-decoration: underline;">askme.live</a>
      </div>
    </div>
  </body>
  </html>
  `;
};

/**
 * ASYNCHRONOUS FIRE-AND-FORGET WELCOME EMAIL SENDER
 * This function NEVER throws or blocks API response time.
 */
const sendWelcomeEmailAsync = ({ email, name, role }) => {
  if (!email || !String(email).includes("@")) return;

  setImmediate(async () => {
    try {
      const transporter = getTransporter();
      const isCreator = String(role).toLowerCase() === "creator";

      const subject = isCreator
        ? "Welcome to AskMe – Your Creator Account Has Been Registered"
        : "Welcome to AskMe – Registration Successful";

      const html = buildWelcomeEmailHtml({ name, role });
      const fromEmail = process.env.SMTP_FROM || process.env.MAIL_FROM || "AskMe Platform <noreply@askme.live>";

      const logoAtt = getLogoAttachment();
      const attachments = logoAtt ? [logoAtt] : [];

      if (transporter) {
        await transporter.sendMail({
          from: fromEmail,
          to: email,
          subject,
          html,
          attachments,
        });
        console.log(`[EMAIL SERVICE] Async Welcome email sent to ${role} (${email}) via SMTP.`);
      } else {
        console.log(`[EMAIL SERVICE NOTICE] SMTP credentials not set. Simulated Welcome Email dispatch for ${role} (${email})`);
      }
    } catch (err) {
      console.warn(`[EMAIL SERVICE NOTICE] Asynchronous email dispatch failed for ${email}:`, err.message);
    }
  });
};

/**
 * Generate Responsive HTML Email Template for Registration OTP Code (matching dark red AskMe design)
 */
const buildEmailOtpTemplate = ({ otp }) => {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your AskMe Verification Code</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #0A0A0F; color: #FFFFFF; margin: 0; padding: 40px 16px; -webkit-font-smoothing: antialiased; }
      .wrapper { width: 100%; max-width: 520px; margin: 0 auto; }
      .brand-header { text-align: left; margin-bottom: 24px; }
      .brand-text { font-size: 24px; font-weight: 900; color: rgba(11, 10, 10, 1); text-decoration: none; }
      .brand-red { color: #EB1000; }
      .card { background-color: #12121A; border: 1px solid #1C1C28; border-radius: 24px; padding: 40px 36px; box-shadow: 0 20px 50px rgba(0,0,0,0.6); }
      .title { font-size: 28px; font-weight: 800; color: #FFFFFF; margin: 0 0 10px 0; letter-spacing: -0.5px; }
      .subtitle { font-size: 15px; color: #94A3B8; margin: 0 0 28px 0; line-height: 1.5; font-weight: 400; }
      .otp-box { background-color: #161622; border: 1px solid #232336; border-radius: 16px; padding: 28px 20px; text-align: center; margin-bottom: 28px; }
      .otp-code { font-family: 'SF Mono', SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace; font-size: 38px; font-weight: 800; letter-spacing: 12px; color: #FFFFFF; display: inline-block; padding-left: 12px; }
      .divider { border-top: 1px solid #1F1F2E; margin: 24px 0 20px 0; }
      .footer-note { font-size: 13.5px; color: #8F95B2; line-height: 1.6; margin: 0; }
      .outer-footer { text-align: center; margin-top: 24px; font-size: 12px; color: #64748B; }
    </style>
  </head>
  <body>
    <div class="wrapper">
      <div class="brand-header">
        <a href="${frontendUrl}" style="text-decoration: none;">
          <img src="cid:askmelogo" alt="AskMe" style="height: 36px; vertical-align: middle; margin-right: 6px; border: 0;" />
          <span class="brand-text">AskMe<span class="brand-red">.live</span></span>
        </a>
      </div>

      <div class="card">
        <h1 class="title">Your verification code</h1>
        <p class="subtitle">Enter this code to continue signing in to AskMe.</p>

        <div class="otp-box">
          <span class="otp-code">${otp}</span>
        </div>

        <div class="divider"></div>

        <p class="footer-note">This code expires in 10 minutes. For your security, never share it &mdash; AskMe staff will never ask you for your code.</p>
      </div>

      <div class="outer-footer">
        AskMe Security &bull; <a href="${frontendUrl}" style="color: #64748B; text-decoration: underline;">askme.live</a>
      </div>
    </div>
  </body>
  </html>
  `;
};

/**
 * Send Email OTP for registration verification
 */
const sendEmailOtp = async ({ email, otp }) => {
  if (!email || !String(email).includes("@")) {
    throw new Error("Valid recipient email address is required.");
  }

  try {
    const transporter = getTransporter();

    if (!transporter) {
      throw new Error("SMTP transporter could not be created.");
    }

    // Test SMTP connection/authentication
    await transporter.verify();

    const subject = "Your AskMe Verification Code";
    const html = buildEmailOtpTemplate({ otp });

    const fromEmail =
      process.env.SMTP_FROM ||
      process.env.MAIL_FROM ||
      "AskMe Platform <noreply@ask-me.live>";

    const logoAtt = getLogoAttachment();
    const attachments = logoAtt ? [logoAtt] : [];

    const info = await transporter.sendMail({
      from: fromEmail,
      to: email,
      subject,
      html,
      attachments,
    });

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (err) {
    console.error("❌ EMAIL ERROR:", err);
    throw err;
  }
};

/**
 * Generate Responsive HTML Email Template for Creator KYC Submission ("Your KYC is under review")
 */
const buildKycUnderReviewEmailHtml = ({ name, reviewEta = "24 hours" }) => {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  const statusUrl = `${frontendUrl}/creators/kyc`;

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your KYC is under review</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #0A0A0F; color: #FFFFFF; margin: 0; padding: 40px 16px; -webkit-font-smoothing: antialiased; }
      .wrapper { width: 100%; max-width: 520px; margin: 0 auto; }
      .brand-header { text-align: center; margin-bottom: 24px; }
      .brand-text { font-size: 24px; font-weight: 900; color: #101010ff; text-decoration: none; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; }
      .brand-red { color: #EB1000; }
      .card { background-color: #12121A; border: 1px solid #1C1C28; border-radius: 24px; padding: 40px 36px; box-shadow: 0 20px 50px rgba(0,0,0,0.6); }
      .title { font-size: 28px; font-weight: 800; color: #FFFFFF; margin: 0 0 16px 0; letter-spacing: -0.5px; line-height: 1.2; }
      .status-pill { background-color: rgba(245, 158, 11, 0.18); color: #F59E0B; border: 1px solid rgba(245, 158, 11, 0.35); font-weight: 800; font-size: 11px; padding: 5px 14px; border-radius: 20px; font-family: sans-serif; display: inline-block; margin-bottom: 24px; text-transform: uppercase; letter-spacing: 1px; }
      .body-text { font-size: 15px; color: #D1D5DB; line-height: 1.6; margin: 0 0 32px 0; font-weight: 400; }
      .cta-btn { display: inline-block; background-color: #EB1000; color: #FFFFFF !important; font-weight: 800; font-size: 15px; padding: 14px 32px; border-radius: 14px; text-decoration: none; margin-bottom: 32px; box-shadow: 0 6px 25px rgba(235, 16, 0, 0.4); text-align: center; }
      .divider { border-top: 1px solid #1F1F2E; margin-bottom: 24px; }
      .footer-note { font-size: 13.5px; color: #94A3B8; line-height: 1.6; margin: 0; }
      .outer-footer { text-align: center; margin-top: 24px; font-size: 12px; color: #64748B; }
    </style>
  </head>
  <body>
    <div class="wrapper">
      <div class="brand-header">
        <a href="${frontendUrl}" style="text-decoration: none;">
          <img src="cid:askmelogo" alt="AskMe" style="height: 36px; vertical-align: middle; margin-right: 8px; border: 0;" />
          <span class="brand-text">AskMe<span class="brand-red">.live</span></span>
        </a>
      </div>

      <div class="card">
        <h1 class="title">Your KYC is under review</h1>
        <div class="status-pill">IN REVIEW</div>

        <p class="body-text">
          We&rsquo;ve received your KYC details and our team is reviewing them now. We&rsquo;ll email you the moment your account is activated.
        </p>

        <div>
          <a href="${statusUrl}" class="cta-btn">View Application Status</a>
        </div>

        <div class="divider"></div>

        <p class="footer-note">
          Reviews typically complete within ${reviewEta}. No action is needed from you right now.
        </p>
      </div>

      <div class="outer-footer">
        AskMe Compliance &bull; <a href="${frontendUrl}" style="color: #64748B; text-decoration: underline;">askme.live</a>
      </div>
    </div>
  </body>
  </html>
  `;
};

/**
 * ASYNCHRONOUS FIRE-AND-FORGET KYC UNDER REVIEW EMAIL SENDER
 */
const sendKycUnderReviewEmailAsync = ({ email, name, reviewEta }) => {
  if (!email || !String(email).includes("@")) return;

  setImmediate(async () => {
    try {
      const transporter = getTransporter();
      const subject = "Your KYC is under review - AskMe.live";
      const html = buildKycUnderReviewEmailHtml({ name, reviewEta });
      const fromEmail = process.env.SMTP_FROM || process.env.MAIL_FROM || "AskMe Compliance <noreply@askme.live>";

      const logoAtt = getLogoAttachment();
      const attachments = logoAtt ? [logoAtt] : [];

      if (transporter) {
        await transporter.sendMail({
          from: fromEmail,
          to: email,
          subject,
          html,
          attachments,
        });
        console.log(`[EMAIL SERVICE] KYC Under Review email sent to ${email} via SMTP.`);
      } else {
        console.log(`[EMAIL SERVICE NOTICE] SMTP credentials not set. Simulated KYC Under Review Email dispatch for ${email}`);
      }
    } catch (err) {
      console.warn(`[EMAIL SERVICE NOTICE] Asynchronous KYC email dispatch failed for ${email}:`, err.message);
    }
  });
};

/**
 * Generate HTML Email Template when Creator goes Live (sent to followers)
 */
const buildGoLiveEmailHtml = ({ viewerName, creatorName, sessionTitle, sessionCode, frontendUrl }) => {
  const streamUrl = sessionCode ? `${frontendUrl}/pay/${sessionCode}` : frontendUrl;
  const nameDisplay = viewerName || "there";

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="dark">
<meta name="supported-color-schemes" content="dark">
<title>🔴 ${creatorName} is Live on AskMe</title>
<style>
  body { margin: 0; padding: 0; background-color: #0A0A0F; color: #F5F5F7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
  table { border-collapse: collapse; }
  img { border: 0; display: block; }
  a { text-decoration: none; }
  @media only screen and (max-width: 600px) {
    .container { width: 100% !important; padding: 16px 12px !important; }
    .card-body { padding: 24px 20px !important; }
    .btn-cta { width: 100% !important; box-sizing: border-box !important; }
    .title-h1 { font-size: 24px !important; }
  }
</style>
</head>
<body style="margin: 0; padding: 32px 12px; background-color: #0A0A0F; color: #F5F5F7;">

<!-- Hidden Preheader -->
<div style="display:none; max-height:0; overflow:hidden; opacity:0; color:#0A0A0F; font-size:1px; line-height:1px;">
  🔴 ${creatorName} is now live on AskMe: "${sessionTitle}". Join now and get your question answered on screen!
</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #0A0A0F;">
  <tr>
    <td align="center">
      <table role="presentation" class="container" width="560" cellpadding="0" cellspacing="0" style="max-width: 560px; width: 100%; margin: 0 auto;">
        
        <!-- BRAND HEADER -->
        <tr>
          <td align="center" style="padding-bottom: 24px;">
            <a href="${frontendUrl}" style="text-decoration: none; display: inline-flex; align-items: center;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td valign="middle" style="padding-right: 8px;">
                    <img src="cid:askmelogo" width="34" height="34" alt="AskMe" style="width: 34px; height: 34px; border: 0;" />
                  </td>
                  <td valign="middle">
                    <span style="font-size: 24px; font-weight: 900; color: #FFFFFF; letter-spacing: -0.5px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                      AskMe<span style="color: #EB1000;">.live</span>
                    </span>
                  </td>
                </tr>
              </table>
            </a>
          </td>
        </tr>

        <!-- MAIN CARD -->
        <tr>
          <td style="background-color: #12121A; border: 1px solid #1F1F30; border-radius: 24px; padding: 36px 32px; box-shadow: 0 20px 50px rgba(0,0,0,0.6);" class="card-body">
            
            <!-- LIVE BADGE -->
            <div style="margin-bottom: 18px;">
              <span style="display: inline-block; background-color: rgba(235, 16, 0, 0.12); border: 1px solid rgba(235, 16, 0, 0.35); color: #FF3B30; font-size: 11px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; padding: 6px 14px; border-radius: 999px;">
                🔴 LIVE STREAM STARTED
              </span>
            </div>

            <!-- TITLE & SUBTITLE -->
            <h1 class="title-h1" style="margin: 0 0 12px 0; font-size: 28px; line-height: 1.25; font-weight: 900; color: #FFFFFF; letter-spacing: -0.5px;">
              ${creatorName} is Live Now!
            </h1>
            <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #94A3B8;">
              Hi ${nameDisplay}, <strong style="color: #FFFFFF;">${creatorName}</strong> has just started broadcasting. Join the live stream, send your questions directly with UPI, and get them answered live on screen!
            </p>

            <!-- SESSION DETAILS CARD -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #181824; border: 1px solid #252538; border-radius: 16px; margin-bottom: 26px;">
              <tr>
                <td style="padding: 18px 20px;">
                  <div style="font-size: 11px; font-weight: 700; color: #EB1000; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 6px;">
                    Broadcasting Topic
                  </div>
                  <div style="font-size: 17px; font-weight: 800; color: #FFFFFF; line-height: 1.4; margin-bottom: 10px;">
                    &ldquo;${sessionTitle}&rdquo;
                  </div>
                  <table role="presentation" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="font-size: 12px; color: #94A3B8;">
                        Host: <strong style="color: #FFFFFF;">${creatorName}</strong> &bull; AskMe Q&amp;A On Screen Enabled
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <!-- PRIMARY ACTION BUTTON -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 28px;">
              <tr>
                <td align="center">
                  <a href="${streamUrl}" class="btn-cta" style="display: block; width: 100%; text-align: center; background: linear-gradient(135deg, #FF3B30 0%, #EB1000 100%); color: #FFFFFF !important; font-weight: 800; font-size: 15px; padding: 15px 24px; border-radius: 14px; text-decoration: none; box-shadow: 0 8px 25px rgba(235, 16, 0, 0.4); box-sizing: border-box;">
                    Join Live Stream &amp; Ask Questions &rarr;
                  </a>
                </td>
              </tr>
            </table>

            <!-- HOW IT WORKS MINI GUIDE -->
            <div style="border-top: 1px solid #1F1F30; padding-top: 22px;">
              <div style="font-size: 12px; font-weight: 800; color: #E2E8F0; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 14px;">
                How to get answered:
              </div>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="33%" valign="top" style="padding-right: 8px;">
                    <div style="font-size: 13px; font-weight: 800; color: #FFFFFF; margin-bottom: 3px;">1. Open Stream</div>
                    <div style="font-size: 12px; color: #64748B; line-height: 1.4;">Watch the live broadcast with ease.</div>
                  </td>
                  <td width="33%" valign="top" style="padding: 0 4px;">
                    <div style="font-size: 13px; font-weight: 800; color: #FFFFFF; margin-bottom: 3px;">2. Ask with UPI</div>
                    <div style="font-size: 12px; color: #64748B; line-height: 1.4;">Instant payment sends your question.</div>
                  </td>
                  <td width="33%" valign="top" style="padding-left: 8px;">
                    <div style="font-size: 13px; font-weight: 800; color: #FFFFFF; margin-bottom: 3px;">3. On Screen</div>
                    <div style="font-size: 12px; color: #64748B; line-height: 1.4;">See it live on stream &amp; get answered!</div>
                  </td>
                </tr>
              </table>
            </div>

          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td align="center" style="padding-top: 24px; font-size: 12px; color: #64748B; line-height: 1.6;">
            <div>
              AskMe Live Platform &bull; <a href="${frontendUrl}" style="color: #94A3B8; text-decoration: underline;">askme.live</a>
            </div>
            <div style="margin-top: 4px; font-size: 11px;">
              You received this alert because you follow <strong>${creatorName}</strong> on AskMe.
            </div>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>

</body>
</html>`;
};

/**
 * ASYNCHRONOUS FIRE-AND-FORGET GO-LIVE EMAIL NOTIFICATION TO CREATOR FOLLOWERS
 */
const sendGoLiveEmailToFollowersAsync = ({ followers, creatorName, sessionTitle, sessionCode }) => {
  if (!followers || !Array.isArray(followers) || followers.length === 0) return;

  setImmediate(async () => {
    try {
      const transporter = getTransporter();
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      const fromEmail = process.env.SMTP_FROM || process.env.MAIL_FROM || "AskMe Live <noreply@askme.live>";
      const logoAtt = getLogoAttachment();
      const attachments = logoAtt ? [logoAtt] : [];

      const subject = `🔴 ${creatorName || 'Creator'} is NOW LIVE: ${sessionTitle || 'Join Live Broadcast'}`;

      for (const follower of followers) {
        const viewerEmail = follower.email || follower['viewer.email'];
        const viewerName = follower.name || follower['viewer.name'] || 'there';

        if (!viewerEmail || !String(viewerEmail).includes('@')) continue;

        const html = buildGoLiveEmailHtml({
          viewerName: viewerName.split(' ')[0] || viewerName,
          creatorName: creatorName,
          sessionTitle: sessionTitle ,
          sessionCode: sessionCode,
          frontendUrl,
        });

        if (transporter) {
          try {
            await transporter.sendMail({
              from: fromEmail,
              to: viewerEmail,
              subject,
              html,
              attachments,
            });
            console.log(`[EMAIL SERVICE] Go-Live email sent to ${viewerEmail} for creator "${creatorName}"`);
          } catch (err) {
            console.warn(`[EMAIL SERVICE] Go-Live email failed for ${viewerEmail}:`, err.message);
          }
        } else {
          console.log(`[EMAIL SERVICE NOTICE] SMTP not configured. Simulated Go-Live email to ${viewerEmail} for creator "${creatorName}"`);
        }
      }
    } catch (err) {
      console.warn(`[EMAIL SERVICE] Mass Go-Live email broadcast error:`, err.message);
    }
  });
};

module.exports = {
  sendWelcomeEmailAsync,
  sendEmailOtp,
  sendKycUnderReviewEmailAsync,
  sendGoLiveEmailToFollowersAsync,
};


