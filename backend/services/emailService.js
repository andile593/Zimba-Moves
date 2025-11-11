const nodemailer = require("nodemailer");

// Gmail-optimized transporter configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  tls: {
    rejectUnauthorized: false,
  },
  connectionTimeout: 15000,
  greetingTimeout: 15000,
  socketTimeout: 15000,
});

// Verify transporter configuration on startup
transporter.verify((error, success) => {
  if (error) {
    console.error("Email transporter verification failed:");
    console.error("Error:", error.message);
    console.error("Make sure you're using a Gmail App Password!");
  } else {
    console.log("Email server is ready to send messages");
    console.log(`Using: ${process.env.SMTP_USER}`);
  }
});

// Shared email styles and components
const emailStyles = `
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    body {
      margin: 0;
      padding: 0;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
      background-color: #f9fafb;
      -webkit-font-smoothing: antialiased;
    }
    
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    
    .header {
      background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
      padding: 40px 30px;
      text-align: center;
    }
    
    .logo {
    height: 60px;
    margin: 1px auto 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    gap: .2em;
    font-weight: 700;
    color: #000;
    }
    
    .header-title {
      color: white;
      font-size: 28px;
      font-weight: 700;
      margin: 0;
      line-height: 1.3;
    }
    
    .content {
      padding: 40px 30px;
    }
    
    .greeting {
      font-size: 20px;
      font-weight: 600;
      color: #1f2937;
      margin: 0 0 16px 0;
    }
    
    .message {
      font-size: 16px;
      line-height: 1.6;
      color: #4b5563;
      margin: 0 0 20px 0;
    }
    
    .info-card {
      background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
      border: 1px solid #bbf7d0;
      border-radius: 12px;
      padding: 24px;
      margin: 24px 0;
    }
    
    .info-card-title {
      font-size: 18px;
      font-weight: 600;
      color: #166534;
      margin: 0 0 16px 0;
    }
    
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #bbf7d0;
    }
    
    .info-row:last-child {
      border-bottom: none;
    }
    
    .info-label {
      font-weight: 500;
      color: #166534;
      font-size: 14px;
    }
    
    .info-value {
      color: #15803d;
      font-size: 14px;
    }
    
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
      color: white !important;
      text-decoration: none;
      padding: 16px 40px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 16px;
      box-shadow: 0 4px 12px rgba(22, 163, 74, 0.3);
      transition: transform 0.2s;
      text-align: center;
    }
    
    .cta-container {
      text-align: center;
      margin: 32px 0;
    }
    
    .warning-card {
      background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
      border: 1px solid #fecaca;
      border-radius: 12px;
      padding: 24px;
      margin: 24px 0;
    }
    
    .warning-title {
      font-size: 18px;
      font-weight: 600;
      color: #991b1b;
      margin: 0 0 12px 0;
    }
    
    .footer {
      background-color: #f9fafb;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
    }
    
    .footer-text {
      font-size: 14px;
      color: #6b7280;
      margin: 0 0 8px 0;
    }
    
    .footer-brand {
      font-weight: 600;
      color: #16a34a;
    }
    
    .divider {
      height: 1px;
      background: linear-gradient(to right, transparent, #e5e7eb, transparent);
      margin: 24px 0;
    }
    
    .highlight {
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
      padding: 2px 8px;
      border-radius: 4px;
      font-weight: 600;
      color: #92400e;
    }
    
    @media only screen and (max-width: 600px) {
      .content {
        padding: 30px 20px;
      }
      
      .header {
        padding: 30px 20px;
      }
      
      .header-title {
        font-size: 24px;
      }
      
      .greeting {
        font-size: 18px;
      }
      
      .cta-button {
        padding: 14px 30px;
        font-size: 15px;
      }
    }
  </style>
`;

const emailTemplates = {
  applicationSubmitted: (provider) => ({
    subject: "Provider Application Submitted - Detravellers RSA",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          ${emailStyles}
        </head>
        <body>
          <div class="email-container">
            <!-- Header -->
            <div class="header">
              <div class="logo">Detravellers <span style="color: #16a34a;"> RSA</span></div>
              <h1 class="header-title">Application Received!</h1>
            </div>
            
            <!-- Content -->
            <div class="content">
              <p class="greeting">Hi ${provider.user.firstName} ${
      provider.user.lastName
    },</p>
              
              <p class="message">
                Thank you for your interest in becoming a provider on Detravellers RSA! We've successfully received your application and our team is excited to review it.
              </p>
              
              <p class="message">
                Your application is currently <span class="highlight">under review</span> by our verification team. We carefully review each application to ensure quality service for our customers.
              </p>
              
              <!-- Info Card -->
              <div class="info-card">
                <h3 class="info-card-title">Application Details</h3>
                <div class="info-row">
                  <span class="info-label">Application ID:</span>
                  <span class="info-value">#${provider.id
                    .substring(0, 8)
                    .toUpperCase()}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">City:</span>
                  <span class="info-value">${
                    provider.city || "Not specified"
                  }</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Submitted:</span>
                  <span class="info-value">${new Date().toLocaleDateString(
                    "en-ZA",
                    {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    }
                  )}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Expected Response:</span>
                  <span class="info-value">2-3 business days</span>
                </div>
              </div>
              
              <div class="divider"></div>
              
              <p class="message">
                <strong>What happens next?</strong>
              </p>
              
              <p class="message">
                Our team will verify your information<br>
                We'll check your documentation and credentials<br>
                You'll receive an email with the decision<br>
                Once approved, you can start accepting bookings immediately
              </p>
              
              <p class="message">
                If you have any questions in the meantime, feel free to reach out to our support team.
              </p>
            </div>
            
            <!-- Footer -->
            <div class="footer">
              <p class="footer-text">
                <span class="footer-brand">Detravellers RSA</span> - Making moving easier
              </p>
              <p class="footer-text">
                This email was sent to ${provider.user.email}
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  applicationApproved: (provider) => ({
    subject: "Congratulations! Your Provider Application is Approved",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          ${emailStyles}
        </head>
        <body>
          <div class="email-container">
            <!-- Header -->
            <div class="header">
              <div class="logo">Detravellers <span style="color: #16a34a;"> RSA</span></div>
              <h1 class="header-title">Welcome to Detravellers RSA!</h1>
            </div>
            
            <!-- Content -->
            <div class="content">
              <p class="greeting">Congratulations ${
                provider.user.firstName
              }! 🎊</p>
              
              <p class="message">
                We're thrilled to inform you that your provider application has been <strong>approved</strong>! You're now officially part of the Detravellers RSA provider network.
              </p>
              
              <!-- Success Card -->
              <div class="info-card">
                <h3 class="info-card-title">Application Approved</h3>
                <div class="info-row">
                  <span class="info-label">Provider Status:</span>
                  <span class="info-value">Active & Ready</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Approved Date:</span>
                  <span class="info-value">${new Date(
                    provider.reviewedAt
                  ).toLocaleDateString("en-ZA", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Service Area:</span>
                  <span class="info-value">${
                    provider.city || "Multiple locations"
                  }</span>
                </div>
              </div>
              
              <p class="message">
                <strong>You can now:</strong>
              </p>
              
              <p class="message">
                Start accepting booking requests<br>
                Add your vehicles to the platform<br>
                Manage your schedule and availability<br>
                Build your reputation with customer reviews<br>
                Track your earnings in real-time
              </p>
              
              <!-- CTA Button -->
              <div class="cta-container">
                <a href="${
                  process.env.FRONTEND_URL
                }/provider/dashboard" class="cta-button">
                  Go to Your Dashboard
                </a>
              </div>
              
              <div class="divider"></div>
              
              <p class="message">
                <strong>Getting Started Tips:</strong>
              </p>
              
              <p class="message">
                Add professional photos of your vehicles<br>
                Set your availability to maximize bookings<br>
                Respond quickly to customer inquiries<br>
                Deliver excellent service to earn 5-star reviews
              </p>
              
              <p class="message">
                Welcome to the team! We're excited to see you succeed on Detravellers RSA.
              </p>
            </div>
            
            <!-- Footer -->
            <div class="footer">
              <p class="footer-text">
                <span class="footer-brand">Detravellers RSA</span> - Making moving easier
              </p>
              <p class="footer-text">
                Need help? Contact our provider support team
              </p>
              <p class="footer-text">
                This email was sent to ${provider.user.email}
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  applicationRejected: (provider) => ({
    subject: "Provider Application Update - Detravellers RSA",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          ${emailStyles}
        </head>
        <body>
          <div class="email-container">
            <!-- Header -->
            <div class="header">
              <div class="logo">Detravellers <span style="color: #16a34a;"> RSA</span></div>
              <h1 class="header-title">Application Update</h1>
            </div>
            
            <!-- Content -->
            <div class="content">
              <p class="greeting">Hi ${provider.user.firstName},</p>
              
              <p class="message">
                Thank you for your interest in becoming a provider on Detravellers RSA. After careful review, we're unable to approve your application at this time.
              </p>
              
              ${
                provider.rejectionReason
                  ? `
                <!-- Warning Card -->
                <div class="warning-card">
                  <h3 class="warning-title">Reason for Decision</h3>
                  <p class="message" style="margin-bottom: 0; color: #7f1d1d;">
                    ${provider.rejectionReason}
                  </p>
                </div>
              `
                  : ""
              }
              
              <p class="message">
                <strong>What you can do:</strong>
              </p>
              
              <p class="message">
                Review the requirements and reapply once you've addressed the issues<br>
                Contact our support team if you have questions<br>
                Ensure all documentation is complete and accurate
              </p>
              
              <div class="divider"></div>
              
              <p class="message">
                We appreciate your understanding and encourage you to reapply in the future when you're ready.
              </p>
              
              <!-- CTA Button -->
              <div class="cta-container">
                <a href="${
                  process.env.FRONTEND_URL
                }/become-provider" class="cta-button" style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);">
                  Learn About Requirements
                </a>
              </div>
            </div>
            
            <!-- Footer -->
            <div class="footer">
              <p class="footer-text">
                <span class="footer-brand">Detravellers RSA</span> - Making moving easier
              </p>
              <p class="footer-text">
                Questions? Contact our support team
              </p>
              <p class="footer-text">
                This email was sent to ${provider.user.email}
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  passwordResetRequest: (user, resetUrl) => ({
    subject: "Password Reset Request - Detravellers RSA",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          ${emailStyles}
        </head>
        <body>
          <div class="email-container">
            <!-- Header -->
            <div class="header"">
              <div class="logo">Detravellers <span style="color: #16a34a;"> RSA</span></div>
              <h1 class="header-title">Reset Your Password</h1>
            </div>
            
            <!-- Content -->
            <div class="content">
              <p class="greeting">Hi ${user.firstName},</p>
              
              <p class="message">
                We received a request to reset your password for your Detravellers RSA account. If this was you, click the button below to create a new password.
              </p>
              
              <!-- CTA Button -->
              <div class="cta-container">
                <a href="${resetUrl}" class="cta-button">
                  Reset My Password
                </a>
              </div>
              
              <!-- Info Card -->
              <div class="info-card">
                <h3 class="info-card-title" >Important Information</h3>
                <p class="message" style="margin-bottom: 12px; ">
                  This password reset link will expire in <span class="highlight">15 minutes</span> for security reasons.
                </p>
                <p class="message" style="margin-bottom: 0;">
                  If the button doesn't work, copy and paste this link into your browser:<br>
                  <span class="info-label" style="word-break: break-all; font-size: 12px;">${resetUrl}</span>
                </p>
              </div>
              
              <div class="divider"></div>
              
              <p class="message">
                <strong>Didn't request this?</strong>
              </p>
              
              <p class="message">
                If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged and your account is secure.
              </p>
              
              <p class="message">
                For security reasons, we recommend that you:
              </p>
              
              <p class="message">
                Use a strong, unique password<br>
                Never share your password with anyone<br>
                Contact support if you notice suspicious activity
              </p>
            </div>
            
            <!-- Footer -->
            <div class="footer">
              <p class="footer-text">
                <span class="footer-brand">Detravellers RSA</span> - Making moving easier
              </p>
              <p class="footer-text">
                This is an automated security email
              </p>
              <p class="footer-text">
                This email was sent to ${user.email}
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  passwordResetSuccess: (user) => ({
    subject: " Password Successfully Reset - Detravellers RSA",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          ${emailStyles}
        </head>
        <body>
          <div class="email-container">
            <!-- Header -->
            <div class="header">
              <div class="logo">Detravellers <span style="color: #16a34a;"> RSA</span></div>
              <h1 class="header-title">Password Reset Successful!</h1>
            </div>
            
            <!-- Content -->
            <div class="content">
              <p class="greeting">Hi ${user.firstName},</p>
              
              <p class="message">
                Your password has been successfully reset. You can now log in to your Detravellers RSA account using your new password.
              </p>
              
              <!-- Success Card -->
              <div class="info-card">
                <h3 class="info-card-title">Security Update</h3>
                <div class="info-row">
                  <span class="info-label">Action:</span>
                  <span class="info-value">Password Reset</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Date & Time:</span>
                  <span class="info-value">${new Date().toLocaleString(
                    "en-ZA",
                    {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Account: </span>
                  <span class="info-value">${user.email}</span>
                </div>
              </div>
              
              <!-- CTA Button -->
              <div class="cta-container">
                <a href="${process.env.FRONTEND_URL}/login" class="cta-button">
                  Log In Now
                </a>
              </div>
              
              <div class="divider"></div>
              
              <!-- Warning Section -->
              <div class="warning-card">
                <h3 class="warning-title"> Didn't Make This Change?</h3>
                <p class="message" style="margin-bottom: 0; color: #7f1d1d;">
                  If you did not reset your password, your account may be compromised. Please contact our support team immediately at <strong>support@Detravellers RSA.com</strong> or call us right away.
                </p>
              </div>
              
              <p class="message">
                <strong>Security Tips:</strong>
              </p>
              
              <p class="message">
                Keep your password confidential<br>
                Use a unique password for Detravellers RSA<br>
                Enable two-factor authentication if available<br>
                Be cautious of phishing emails
              </p>
            </div>
            
            <!-- Footer -->
            <div class="footer">
              <p class="footer-text">
                <span class="footer-brand">Detravellers RSA</span> - Making moving easier
              </p>
              <p class="footer-text">
                This is an automated security notification
              </p>
              <p class="footer-text">
                This email was sent to ${user.email}
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),
};

async function sendEmail(to, template, options = {}) {
  try {
    // Check if SMTP is configured
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn("SMTP not configured. Email would have been sent to:", to);
      console.warn("   Subject:", template.subject);
      return { success: false, error: "SMTP not configured" };
    }

    if (!template?.subject || !template?.html) {
      throw new Error("Invalid email template provided");
    }

    const mailOptions = {
      from: `"Detravellers RSA" <${process.env.SMTP_USER}>`,
      to,
      subject: template.subject,
      html: template.html,
      cc: options.cc,
      bcc: options.bcc,
      attachments: options.attachments || [],
      headers: options.headers || {},
    };

    const info = await transporter.sendMail(mailOptions);

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`Failed to send email to ${to}`);
    console.error(`   Error: ${error.message}`);
    if (error.code) {
      console.error(`   Code: ${error.code}`);
    }
    if (error.command) {
      console.error(`   Command: ${error.command}`);
    }

    return {
      success: false,
      error: error.message,
      code: error.code,
      command: error.command,
    };
  }
}

module.exports = {
  sendEmail,
  transporter,

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
