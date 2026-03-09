const nodemailer = require("nodemailer");
const axios = require("axios");

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function createTransporter() {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.SMTP_PORT) || 465;
  const isSecure = port === 465;

  return nodemailer.createTransport({
    host,
    port,
    secure: isSecure,
    // CRITICAL: Force IPv4 to bypass Render's IPv6 networking bugs (ENETUNREACH)
    family: 4,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

/**
 * Sends OTP via SMTP (Gmail) or Resend API if SMTP is missing.
 * Gmail is prioritized because it allows arbitrary recipients without a domain.
 */
async function sendOTP(email, otp) {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const resendKey = process.env.RESEND_API_KEY;

  if (!smtpUser && !resendKey) {
    throw new Error("Email service not configured. Please set SMTP_USER/PASS or RESEND_API_KEY.");
  }

  const htmlContent = `
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:480px;margin:0 auto;background:#0a0a0f;color:#e2e2f0;border-radius:20px;overflow:hidden;border:1px solid #2a2a3d;">
      <div style="padding:32px 28px;text-align:center;">
        <h1 style="margin:0 0 6px;font-size:28px;font-weight:800;color:#e2e2f0;">
          Code<span style="color:#7c3aed;">Sensei</span>
        </h1>
        <p style="color:#6b6b8a;font-size:13px;margin:0 0 28px;">Debug. Trace. Level Up.</p>
        <p style="font-size:14px;color:#b0b0cc;margin:0 0 20px;">Your verification code is:</p>
        <div style="background:#1c1c28;border:2px solid #7c3aed;border-radius:14px;padding:20px;margin:0 auto 20px;max-width:280px;">
          <div style="font-family:'Courier New',monospace;font-size:36px;font-weight:800;letter-spacing:8px;color:#7c3aed;">
            ${otp}
          </div>
        </div>
        <p style="font-size:12px;color:#6b6b8a;margin:0 0 8px;">This code expires in <strong style="color:#f59e0b;">10 minutes</strong>.</p>
        <p style="font-size:11px;color:#4a4a60;margin:0;">If you didn't create an account, ignore this email.</p>
      </div>
      <div style="background:#13131a;padding:16px;text-align:center;border-top:1px solid #2a2a3d;">
        <p style="font-size:10px;color:#4a4a60;margin:0;">© CodeSensei – Learn. Debug. Level Up.</p>
      </div>
    </div>
  `;

  // Helper for hard timeout
  const timeout = (ms) => new Promise((_, reject) => setTimeout(() => reject(new Error("Email timeout")), ms));

  // 1. Try SMTP (Gmail) First - Better for free tier (no domain needed)
  if (smtpUser && smtpPass) {
    console.log(`📨 Attempting SMTP (Gmail) delivery to ${email}...`);
    const transporter = createTransporter();
    try {
      await Promise.race([
        transporter.sendMail({
          from: `"CodeSensei" <${smtpUser}>`,
          to: email,
          subject: "CodeSensei – Verify Your Email",
          html: htmlContent
        }),
        timeout(10000)
      ]);
      console.log("✅ Email sent via SMTP");
      return;
    } catch (smtpErr) {
      console.error("❌ SMTP Error:", smtpErr.message);
      if (!resendKey) throw new Error(`SMTP Failed: ${smtpErr.message}`);
      console.log("➡️ Falling back to Resend API...");
    }
  }

  // 2. Fallback to Resend API
  if (resendKey) {
    console.log(`📨 Attempting Resend API delivery to ${email}...`);
    try {
      await Promise.race([
        axios.post("https://api.resend.com/emails", {
          from: "CodeSensei <onboarding@resend.dev>",
          to: email,
          subject: "CodeSensei – Verify Your Email",
          html: htmlContent
        }, {
          headers: { "Authorization": `Bearer ${resendKey}`, "Content-Type": "application/json" }
        }),
        timeout(10000)
      ]);
      console.log("✅ Email sent via Resend");
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      console.error("❌ Resend API Error:", errorMsg);
      throw new Error(`Email failed: ${errorMsg}`);
    }
  }
}

module.exports = { generateOTP, sendOTP };
