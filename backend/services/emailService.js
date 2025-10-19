const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const emailTemplates = {
  applicationSubmitted: (provider) => ({
    subject: "Provider Application Submitted",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2 style="color: #16a34a;">Application Submitted Successfully!</h2>
        <p>Dear ${provider.user.firstName} ${provider.user.lastName},</p>
        <p>Thank you for applying to become a provider on our platform. Your application is under review.</p>
        <p>We'll get back to you within 2–3 business days.</p>

        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3>Application Details:</h3>
          <p><strong>Application ID:</strong> ${provider.id}</p>
          <p><strong>Business Name:</strong> ${
            provider.businessName || "N/A"
          }</p>
          <p><strong>City:</strong> ${provider.city || "N/A"}</p>
        </div>

        <p>Best regards,<br>The MoveEase Team</p>
      </div>
    `,
  }),

  applicationApproved: (provider) => ({
    subject: "Hooray, Provider Application Approved.",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2 style="color: #16a34a;">Congratulations! Your Application is Approved</h2>
        <p>Dear ${provider.user.firstName} ${provider.user.lastName},</p>
        <p>You can now start accepting bookings on our platform.</p>

        <div style="background: #dcfce7; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Approved Date:</strong> ${new Date(
            provider.reviewedAt
          ).toLocaleDateString()}</p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/provider/dashboard"
             style="background: #16a34a; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none;">
            Go to Dashboard
          </a>
        </div>

        <p>Welcome to the team!<br>The MoveEase Team</p>
      </div>
    `,
  }),

  applicationRejected: (provider) => ({
    subject: "Provider Application Update",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2 style="color: #dc2626;">Application Update</h2>
        <p>Dear ${provider.user.firstName} ${provider.user.lastName},</p>
        <p>Unfortunately, we are unable to approve your application at this time.</p>
        ${
          provider.rejectionReason
            ? `<p><strong>Reason:</strong> ${provider.rejectionReason}</p>`
            : ""
        }
        <p>You can reapply after addressing the issues mentioned.</p>
        <p>Best,<br>The MoveEase Team</p>
      </div>
    `,
  }),

  passwordResetRequest: (user, resetUrl) => ({
    subject: "Password Reset Request",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2 style="color: #2563eb;">Password Reset Request</h2>
        <p>Hi ${user.firstName},</p>
        <p>We received a request to reset your password. If this was you, click below to proceed:</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background: #2563eb; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none;">
            Reset Password
          </a>
        </div>

        <p>This link will expire in <strong>15 minutes</strong>. If you didn’t request this, you can ignore this email.</p>
        <p>– The MoveEase Team</p>
      </div>
    `,
  }),

  passwordResetSuccess: (user) => ({
    subject: "Your Password Has Been Reset",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2 style="color: #16a34a;">Password Reset Successful</h2>
        <p>Hi ${user.firstName},</p>
        <p>Your password has been successfully reset.</p>
        <p>If you didn’t perform this action, contact our support immediately.</p>
        <p>– The MoveEase Team</p>
      </div>
    `,
  }),
};

async function sendEmail(to, template, options = {}) {
  try {
    if (!template?.subject || !template?.html) {
      throw new Error("Invalid email template provided");
    }

    const mailOptions = {
      from: `"MoveEase" <${process.env.SMTP_USER}>`,
      to,
      subject: template.subject,
      html: template.html,
      cc: options.cc,
      bcc: options.bcc,
      attachments: options.attachments || [],
      headers: options.headers || {},
    };

    const info = await transporter.sendMail(mailOptions);

    console.log(
      `[${template.subject}] sent to ${to} — MessageID: ${info.messageId}`
    );
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
}

module.exports = {
  sendEmail,

  sendApplicationSubmitted: (provider) =>
    sendEmail(
      provider.user.email,
      emailTemplates.applicationSubmitted(provider)
    ),

  sendApplicationApproved: (provider) =>
    sendEmail(
      provider.user.email,
      emailTemplates.applicationApproved(provider)
    ),

  sendApplicationRejected: (provider) =>
    sendEmail(
      provider.user.email,
      emailTemplates.applicationRejected(provider)
    ),

  sendPasswordResetEmail: (user, resetUrl) =>
    sendEmail(user.email, emailTemplates.passwordResetRequest(user, resetUrl)),

  sendPasswordResetSuccessEmail: (user) =>
    sendEmail(user.email, emailTemplates.passwordResetSuccess(user)),
};
