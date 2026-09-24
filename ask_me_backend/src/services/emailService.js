const nodemailer = require("nodemailer");

/**
 * Configure Nodemailer Transport from environment variables with fallback
 */
const getTransporter = () => {
  const host = process.env.SMTP_HOST || process.env.MAIL_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }
  return null;
};

/**
 * Generate Responsive HTML Email Template tailored by role
 */
const buildWelcomeEmailHtml = ({ name, role }) => {
  const isCreator = String(role).toLowerCase() === "creator";
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  const dashboardUrl = isCreator ? `${frontendUrl}/creators/dashboard` : `${frontendUrl}/viewers/dashboard`;
  const recipientName = name || (isCreator ? "Creator" : "Viewer");

  if (isCreator) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #0A0A0F; color: #F5F5F7; margin: 0; padding: 20px; }
        .container { max-width: 580px; margin: 0 auto; background-color: #13131A; border: 1px solid #1C1C26; border-radius: 20px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #EB1000 0%, #990A00 100%); padding: 30px 24px; text-align: center; }
        .header h1 { color: #FFFFFF; font-size: 26px; margin: 0; font-weight: 900; letter-spacing: -0.5px; }
        .header p { color: rgba(255,255,255,0.85); font-size: 13px; margin-top: 6px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
        .body { padding: 32px 28px; }
        .greeting { font-size: 20px; font-weight: 800; color: #FFFFFF; margin-bottom: 16px; }
        .text { font-size: 14px; line-height: 1.6; color: #A0A0B2; margin-bottom: 24px; }
        .box { background-color: #0A0A0F; border: 1px solid #222236; border-radius: 14px; padding: 20px; margin-bottom: 24px; }
        .step { display: flex; align-items: flex-start; margin-bottom: 14px; }
        .step:last-child { margin-bottom: 0; }
        .step-icon { background-color: rgba(235, 16, 0, 0.15); color: #EB1000; border: 1px solid rgba(235, 16, 0, 0.3); font-weight: bold; font-size: 12px; width: 24px; height: 24px; border-radius: 50%; display: inline-block; text-align: center; line-height: 24px; margin-right: 12px; shrink: 0; }
        .step-text { font-size: 13px; color: #E2E8F0; line-height: 1.5; }
        .step-text strong { color: #FFFFFF; }
        .cta-btn { display: block; width: 100%; text-align: center; background: linear-gradient(90deg, #EB1000 0%, #CC0E00 100%); color: #FFFFFF !important; font-weight: 800; font-size: 14px; padding: 15px 0; border-radius: 12px; text-decoration: none; margin-top: 28px; box-shadow: 0 4px 20px rgba(235, 16, 0, 0.35); }
        .footer { border-top: 1px solid #1C1C26; padding: 20px 28px; text-align: center; font-size: 11px; color: #64748B; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>AskMe CREATOR PRO</h1>
          <p>Welcome to the Future of Live Monetization</p>
        </div>
        <div class="body">
          <div class="greeting">Welcome, ${recipientName}! 🚀</div>
          <div class="text">
            Thank you for registering as a Creator on <strong>AskMe PRO</strong>! You now have access to real-time live stream Q&A monetization, instant UPI payout settlements, and customized OBS stream overlays.
          </div>
          
          <div class="box">
            <div class="step">
              <span class="step-icon">1</span>
              <div class="step-text"><strong>Launch Broadcasts:</strong> Create live sessions to generate branded UPI QR codes & payment links.</div>
            </div>
            <div class="step" style="margin-top:12px;">
              <span class="step-icon">2</span>
              <div class="step-text"><strong>OBS Studio Overlay:</strong> Add your overlay link to display live questions & superchat shoutouts directly on stream.</div>
            </div>
            <div class="step" style="margin-top:12px;">
              <span class="step-icon">3</span>
              <div class="step-text"><strong>Complete KYC & Bank Payouts:</strong> Verify details to enjoy 100% automated payout settlements directly to your bank account.</div>
            </div>
          </div>

          <a href="${dashboardUrl}" class="cta-btn">Open Creator Dashboard &rarr;</a>
        </div>
        <div class="footer">
          AskMe PRO Platform &bull; Powered by Instant UPI Settlement &bull; Support &amp; Help Desk
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
    <style>
      body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #0A0A0F; color: #F5F5F7; margin: 0; padding: 20px; }
      .container { max-width: 580px; margin: 0 auto; background-color: #13131A; border: 1px solid #1C1C26; border-radius: 20px; overflow: hidden; }
      .header { background: linear-gradient(135deg, #00F5D4 0%, #00B894 100%); padding: 30px 24px; text-align: center; }
      .header h1 { color: #0A0A0F; font-size: 26px; margin: 0; font-weight: 900; letter-spacing: -0.5px; }
      .header p { color: #0A0A0F; font-size: 13px; margin-top: 6px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
      .body { padding: 32px 28px; }
      .greeting { font-size: 20px; font-weight: 800; color: #FFFFFF; margin-bottom: 16px; }
      .text { font-size: 14px; line-height: 1.6; color: #A0A0B2; margin-bottom: 24px; }
      .box { background-color: #0A0A0F; border: 1px solid #222236; border-radius: 14px; padding: 20px; margin-bottom: 24px; }
      .step { display: flex; align-items: flex-start; margin-bottom: 14px; }
      .step:last-child { margin-bottom: 0; }
      .step-icon { background-color: rgba(0, 245, 212, 0.15); color: #00F5D4; border: 1px solid rgba(0, 245, 212, 0.3); font-weight: bold; font-size: 12px; width: 24px; height: 24px; border-radius: 50%; display: inline-block; text-align: center; line-height: 24px; margin-right: 12px; shrink: 0; }
      .step-text { font-size: 13px; color: #E2E8F0; line-height: 1.5; }
      .step-text strong { color: #FFFFFF; }
      .cta-btn { display: block; width: 100%; text-align: center; background: linear-gradient(90deg, #00F5D4 0%, #00B894 100%); color: #0A0A0F !important; font-weight: 900; font-size: 14px; padding: 15px 0; border-radius: 12px; text-decoration: none; margin-top: 28px; box-shadow: 0 4px 20px rgba(0, 245, 212, 0.3); }
      .footer { border-top: 1px solid #1C1C26; padding: 20px 28px; text-align: center; font-size: 11px; color: #64748B; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Welcome to AskMe!</h1>
      </div>
      <div class="body">
        <div class="greeting">Welcome aboard, ${recipientName}! 👋</div>
        <div class="text">
          Thank you for joining <strong>AskMe</strong>. You are now ready to interact with top live streamers, ask questions live on broadcast, and join VIP creator memberships!
        </div>
        
        <div class="box">
          <div class="step">
            <span class="step-icon">1</span>
            <div class="step-text"><strong>Discover Live Streams:</strong> Watch live broadcasts from top gaming &amp; content creators.</div>
          </div>
          <div class="step" style="margin-top:12px;">
            <span class="step-icon">2</span>
            <div class="step-text"><strong>Ask Questions &amp; Superchats:</strong> Submit questions via instant UPI payment to pop up on stream overlays.</div>
          </div>
          <div class="step" style="margin-top:12px;">
            <span class="step-icon">3</span>
            <div class="step-text"><strong>VIP Priority Badges:</strong> Subscribe to creator VIP passes for top priority queue placement.</div>
          </div>
        </div>

        <a href="${dashboardUrl}" class="cta-btn">Explore Live Streams &rarr;</a>
      </div>
      <div class="footer">
        AskMe Live Stream Community &bull; Support &amp; Help Desk
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

  // Execute asynchronously via setImmediate (non-blocking)
  setImmediate(async () => {
    try {
      const transporter = getTransporter();
      const isCreator = String(role).toLowerCase() === "creator";

      const subject = isCreator
        ? "Welcome to AskMe – Your Creator Account Has Been Registered"
        : "Welcome to AskMe – Registration Successful";

      const html = buildWelcomeEmailHtml({ name, role });
      const fromEmail = process.env.SMTP_FROM || process.env.MAIL_FROM || "AskMe Platform <noreply@askme.live>";

      if (transporter) {
        await transporter.sendMail({
          from: fromEmail,
          to: email,
          subject,
          html,
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

module.exports = {
  sendWelcomeEmailAsync,
};
