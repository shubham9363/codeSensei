const nodemailer = require("nodemailer");

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function createTransporter() {
  // Use env vars for SMTP config. Works with Gmail, Outlook, or any SMTP provider.
  // For Gmail: enable "App Passwords" in Google Account → Security
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false,
    connectionTimeout: 3000, // Quick fail if port is blocked
    greetingTimeout: 3000,
    socketTimeout: 3000,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

async function sendOTP(email, otp) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`\n======================================================`);
    console.log(`📧 MOCKED EMAIL (SMTP credentials not configured)`);
    console.log(`To: ${email}`);
    console.log(`Subject: 🥋 CodeSensei – Verify Your Email`);
    console.log(`🔑 Verification OTP: ${otp}`);
    console.log(`======================================================\n`);
    return; // Do not attempt to send real email
  }

  const transporter = createTransporter();

  const mailOptions = {
    from: `"CodeSensei" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "🥋 CodeSensei – Verify Your Email",
    html: `
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
          <p style="font-size:11px;color:#4a4a60;margin:0;">If you didn't create an account on CodeSensei, ignore this email.</p>
        </div>
        <div style="background:#13131a;padding:16px;text-align:center;border-top:1px solid #2a2a3d;">
          <p style="font-size:10px;color:#4a4a60;margin:0;">© CodeSensei – Learn. Debug. Level Up.</p>
        </div>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
}

module.exports = { generateOTP, sendOTP };
