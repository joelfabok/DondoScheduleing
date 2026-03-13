const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const STATUS_LABELS = {
  pending: 'Pending Review',
  approved: 'Approved',
  active: 'Active / In Progress',
  complete: 'Completed',
  cancelled: 'Cancelled',
};

const sendStatusUpdate = async ({ toEmail, toName, eventTitle, newStatus, adminNote }) => {
  if (!process.env.SMTP_USER) return; // skip if email not configured

  const label = STATUS_LABELS[newStatus] || newStatus;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: toEmail,
      subject: `Event Update: "${eventTitle}" is now ${label}`,
      html: `
        <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
          <h2 style="margin-bottom: 4px;">Event Status Update</h2>
          <p>Hi ${toName},</p>
          <p>The status of your event <strong>${eventTitle}</strong> has been updated.</p>
          <div style="background: #f4f4f4; border-left: 4px solid #333; padding: 12px 16px; margin: 16px 0; border-radius: 4px;">
            <strong>New Status:</strong> ${label}
          </div>
          ${adminNote ? `<p><strong>Admin note:</strong> ${adminNote}</p>` : ''}
          <p style="color: #666; font-size: 13px; margin-top: 32px;">— Dondo Scheduler</p>
        </div>
      `,
    });
  } catch (err) {
    console.warn('Email send failed (non-fatal):', err.message);
  }
};

module.exports = { sendStatusUpdate };
