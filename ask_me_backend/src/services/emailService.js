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
      .brand-text { font-size: 24px; font-weight: 900; color: #FFFFFF; text-decoration: none; }
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

    console.log("✅ SMTP connection verified");

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

    console.log("========== EMAIL SENT ==========");
console.log("Message ID:", info.messageId);
console.log("Response:", info.response);
console.log("Accepted:", info.accepted);
console.log("Rejected:", info.rejected);
console.log("Envelope:", info.envelope);

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
      .brand-text { font-size: 24px; font-weight: 900; color: #FFFFFF; text-decoration: none; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; }
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
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="dark light">
<meta name="supported-color-schemes" content="dark light">
<title>🔴 ${creatorName} is Live on AskMe</title>
<style>
  body{margin:0;padding:0;background:#070708;-webkit-text-size-adjust:100%}
  table{border-collapse:collapse}
  img{border:0;display:block;max-width:100%;height:auto}
  a{text-decoration:none}
  .f{font-family:Inter,'Helvetica Neue',Helvetica,Arial,sans-serif}
  .h1{font-size:40px;line-height:44px;font-weight:800;color:#fff;letter-spacing:-1px;margin:0}
  .h2{font-size:26px;line-height:32px;font-weight:800;color:#fff;letter-spacing:-.4px;margin:0}
  .h3{font-size:16px;line-height:22px;font-weight:700;color:#fff;margin:0 0 6px}
  .p{font-size:15px;line-height:24px;color:#b9b9c0;margin:0}
  .btn{display:inline-block;padding:16px 30px;border-radius:999px;font-weight:700;font-size:15px}
  @media (max-width:620px){
    .w{width:100%!important}
    .px{padding-left:22px!important;padding-right:22px!important}
    .h1{font-size:32px!important;line-height:36px!important}
    .h2{font-size:23px!important;line-height:29px!important}
    .col{display:block!important;width:100%!important;padding:0 0 12px!important}
    .stack{display:block!important;width:100%!important;text-align:center!important}
    .qr{margin:0 auto 22px!important}
  }
</style>
</head>
<body style="margin:0;padding:0;background:#070708;">

<!-- Preheader -->
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#070708;font-size:1px;line-height:1px;">
  ${creatorName} is live now: "${sessionTitle}". Ask a question they'll actually see on screen!&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#070708" style="background:#070708;">
<tr><td align="center" style="padding:0;">

<table role="presentation" class="w" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;">

  <!-- LOGO BAND -->
  <tr><td align="center" bgcolor="#ffffff" style="background:#ffffff;padding:26px 20px 22px;">
    <a href="${frontendUrl}">
      <img src="cid:askmelogo" width="170" alt="Ask-me.live by FuturePast" style="margin:0 auto;width:170px;">
    </a>
  </td></tr>
  <tr><td height="5" bgcolor="#FF3B30" style="background:#FF3B30;font-size:0;line-height:0;">&nbsp;</td></tr>

  <!-- HERO -->
  <tr><td class="px" bgcolor="#070708" align="center" style="background:#070708;background-image:radial-gradient(ellipse at 50% 0%,#3a0d0a 0%,#070708 70%);padding:56px 40px 50px;">
    <p class="f" style="margin:0 0 18px;font-size:13px;letter-spacing:3px;font-weight:700;color:#FF3B30;">🔴 LIVE NOW &bull; DISCOVER &bull; ENGAGE</p>
    <h1 class="f h1">${creatorName} is live.<br>Now you can ask them anything.</h1>
    <p class="f p" style="margin:22px auto 0;max-width:460px;font-size:17px;line-height:27px;">Hi ${nameDisplay}, <strong>${creatorName}</strong> has just started a live stream: <em>"${sessionTitle}"</em>. Ask-me.live lets you send a question they'll actually see on screen, and tells you the moment they answer.</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:32px auto 0;">
      <tr><td align="center" bgcolor="#FF3B30" style="border-radius:999px;background:#FF3B30;">
        <a href="${streamUrl}" class="f btn" style="color:#ffffff;">Watch &amp; Ask ${creatorName}</a>
      </td></tr>
    </table>
    <p class="f" style="margin:16px 0 0;font-size:13px;color:#7c7c86;">Instant UPI &middot; Direct Q&amp;A On Screen</p>
  </td></tr>

  <!-- SCOOT STEPS -->
  <tr><td class="px" bgcolor="#0e0e10" style="background:#0e0e10;padding:40px 40px 34px;border-top:1px solid #1e1e22;">
    <h2 class="f h2" style="text-align:center;">Scan. Ask. Scoot. Get answered.</h2>
    <p class="f p" style="text-align:center;margin:10px 0 26px;">Four taps between you and ${creatorName}&rsquo;s reply.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td class="col" width="25%" valign="top" style="padding:0 6px;">
          <table role="presentation" width="100%" bgcolor="#151518" style="background:#151518;border:1px solid #26262b;border-radius:16px;"><tr><td align="center" style="padding:18px 8px;">
            <div style="font-size:26px;line-height:30px;">📱</div>
            <p class="f" style="margin:8px 0 2px;font-size:14px;font-weight:700;color:#fff;">Scan</p>
            <p class="f" style="margin:0;font-size:12px;line-height:17px;color:#9a9aa3;">Creator&rsquo;s QR or link</p>
          </td></tr></table>
        </td>
        <td class="col" width="25%" valign="top" style="padding:0 6px;">
          <table role="presentation" width="100%" bgcolor="#151518" style="background:#151518;border:1px solid #26262b;border-radius:16px;"><tr><td align="center" style="padding:18px 8px;">
            <div style="font-size:26px;line-height:30px;">💬</div>
            <p class="f" style="margin:8px 0 2px;font-size:14px;font-weight:700;color:#fff;">Ask</p>
            <p class="f" style="margin:0;font-size:12px;line-height:17px;color:#9a9aa3;">Type your question</p>
          </td></tr></table>
        </td>
        <td class="col" width="25%" valign="top" style="padding:0 6px;">
          <table role="presentation" width="100%" bgcolor="#151518" style="background:#151518;border:1px solid #26262b;border-radius:16px;"><tr><td align="center" style="padding:18px 8px;">
            <div style="font-size:26px;line-height:30px;">🛴</div>
            <p class="f" style="margin:8px 0 2px;font-size:14px;font-weight:700;color:#fff;">Scoot</p>
            <p class="f" style="margin:0;font-size:12px;line-height:17px;color:#9a9aa3;">Back to the stream</p>
          </td></tr></table>
        </td>
        <td class="col" width="25%" valign="top" style="padding:0 6px;">
          <table role="presentation" width="100%" bgcolor="#151518" style="background:#151518;border:1px solid #FF3B30;border-radius:16px;"><tr><td align="center" style="padding:18px 8px;">
            <div style="font-size:26px;line-height:30px;">🔔</div>
            <p class="f" style="margin:8px 0 2px;font-size:14px;font-weight:700;color:#fff;">Get answered</p>
            <p class="f" style="margin:0;font-size:12px;line-height:17px;color:#9a9aa3;">Pinged the instant they reply</p>
          </td></tr></table>
        </td>
      </tr>
    </table>
  </td></tr>

  <!-- FEATURES -->
  <tr><td class="px" bgcolor="#070708" style="background:#070708;padding:46px 40px 12px;">
    <h2 class="f h2">Everything in one place</h2>
    <p class="f p" style="margin:10px 0 26px;">Built for fans who want to be heard and creators who want a better way to talk to their community.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">

      <tr>
        <td class="col" width="50%" valign="top" style="padding:0 7px 14px 0;">
          <table role="presentation" width="100%" bgcolor="#121214" style="background:#121214;border:1px solid #232328;border-radius:16px;"><tr><td style="padding:22px 20px;">
            <div style="font-size:24px;line-height:28px;margin-bottom:10px;">🔴</div>
            <p class="f h3">See who&rsquo;s live, everywhere</p>
            <p class="f p" style="font-size:14px;line-height:21px;">One feed for every creator streaming right now across YouTube, Instagram, Twitch, Kick, X, LinkedIn Live and Facebook.</p>
          </td></tr></table>
        </td>
        <td class="col" width="50%" valign="top" style="padding:0 0 14px 7px;">
          <table role="presentation" width="100%" bgcolor="#121214" style="background:#121214;border:1px solid #232328;border-radius:16px;"><tr><td style="padding:22px 20px;">
            <div style="font-size:24px;line-height:28px;margin-bottom:10px;">⚡</div>
            <p class="f h3">Ask and get noticed</p>
            <p class="f p" style="font-size:14px;line-height:21px;">Pay to send a question that goes to ${creatorName}&rsquo;s review queue, not lost in a chat stream.</p>
          </td></tr></table>
        </td>
      </tr>

      <tr>
        <td class="col" width="50%" valign="top" style="padding:0 7px 14px 0;">
          <table role="presentation" width="100%" bgcolor="#121214" style="background:#121214;border:1px solid #232328;border-radius:16px;"><tr><td style="padding:22px 20px;">
            <div style="font-size:24px;line-height:28px;margin-bottom:10px;">🔔</div>
            <p class="f h3">Never miss your creator</p>
            <p class="f p" style="font-size:14px;line-height:21px;">Get notified when they answer your question, when they go live, and before a scheduled stream starts.</p>
          </td></tr></table>
        </td>
        <td class="col" width="50%" valign="top" style="padding:0 0 14px 7px;">
          <table role="presentation" width="100%" bgcolor="#121214" style="background:#121214;border:1px solid #232328;border-radius:16px;"><tr><td style="padding:22px 20px;">
            <div style="font-size:24px;line-height:28px;margin-bottom:10px;">🛴</div>
            <p class="f h3">Scoot Mode</p>
            <p class="f p" style="font-size:14px;line-height:21px;">Send your question and the screen scoots out of the way, so the stream stays front and centre while you wait.</p>
          </td></tr></table>
        </td>
      </tr>
    </table>
  </td></tr>

  <!-- FINAL CTA -->
  <tr><td class="px" align="center" bgcolor="#FF3B30" style="background:#FF3B30;background-image:linear-gradient(135deg,#FF3B30 0%,#b3150d 100%);padding:52px 40px;">
    <h2 class="f h2" style="font-size:30px;line-height:36px;">Every meaningful question deserves to be heard.</h2>
    <p class="f" style="margin:14px auto 28px;max-width:440px;font-size:16px;line-height:25px;color:#ffe3e0;">Join ${creatorName}&rsquo;s live session now on Ask-me.live.</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;"><tr>
      <td align="center" bgcolor="#ffffff" style="border-radius:999px;background:#ffffff;"><a href="${streamUrl}" class="f btn" style="color:#b3150d;">Join Live Stream Now</a></td>
    </tr></table>
    <p class="f" style="margin:22px 0 0;font-size:14px;color:#fff;">Questions? Write to us at <a href="mailto:hello@ask-me.live" style="color:#fff;font-weight:700;text-decoration:underline;">hello@ask-me.live</a></p>
  </td></tr>

  <!-- FOOTER -->
  <tr><td class="px" align="center" bgcolor="#070708" style="background:#070708;padding:34px 40px 40px;">
    <p class="f" style="margin:0 0 6px;font-size:14px;font-weight:700;color:#fff;">Ask-me.live <span style="color:#7c7c86;font-weight:400;">by FuturePast</span></p>
    <p class="f" style="margin:0 0 14px;font-size:12px;line-height:19px;color:#7c7c86;">FuturePast Ventures LLP &middot; Pune, Maharashtra, India<br>hello@ask-me.live &middot; <a href="${frontendUrl}" style="color:#9a9aa3;">ask-me.live</a></p>
  </td></tr>

</table>
</td></tr>
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


