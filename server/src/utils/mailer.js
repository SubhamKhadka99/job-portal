import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_SECURE === "true", // true only for port 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ── Send verification email ───────────────────────────────────────────────────
export async function sendVerificationEmail(toEmail, toName, code) {
  const appName = "HireCraft";
  const fromName = process.env.EMAIL_FROM_NAME || appName;
  const fromAddr = process.env.EMAIL_USER;

  await transporter.sendMail({
    from: `"${fromName}" <${fromAddr}>`,
    to: toEmail,
    subject: `${appName} — Your verification code`,
    text: `Hi ${toName},\n\nYour verification code is: ${code}\n\nIt expires in 15 minutes.\n\nIf you didn't create an account, ignore this email.`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#f9f9f6;border-radius:12px;">
        <h2 style="margin:0 0 4px;color:#1a1a18;font-size:22px;">${appName}</h2>
        <p style="margin:0 0 28px;color:#888;font-size:13px;">Email verification</p>

        <p style="margin:0 0 8px;color:#3a3a35;font-size:15px;">Hi <strong>${toName}</strong>,</p>
        <p style="margin:0 0 28px;color:#3a3a35;font-size:15px;">
          Use the code below to verify your email address. It expires in <strong>15 minutes</strong>.
        </p>

        <div style="text-align:center;margin:0 0 28px;">
          <span style="display:inline-block;letter-spacing:10px;font-size:36px;font-weight:700;color:#1a1a18;background:#fff;border:1px solid #e5e5e0;border-radius:10px;padding:18px 28px 18px 38px;">
            ${code}
          </span>
        </div>

        <p style="margin:0;color:#aaa;font-size:12px;text-align:center;">
          If you didn't create a ${appName} account, you can safely ignore this email.
        </p>
      </div>
    `,
  });
}
