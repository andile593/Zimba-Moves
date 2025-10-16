const nodemailer = require("nodemailer");

// Create email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Email templates
const emailTemplates = {
  applicationSubmitted: (provider) => ({
    subject: "Provider Application Submitted",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #16a34a;">Application Submitted Successfully!</h2>
        <p>Dear ${provider.user.firstName} ${provider.user.lastName},</p>
        <p>Thank you for applying to become a provider on our platform.</p>
        <p>Your application has been received and is currently under review. Our team will review your documents and get back to you within 2-3 business days.</p>
        
        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Application Details:</h3>
          <p><strong>Application ID:</strong> ${provider.id}</p>
          <p><strong>Business Name:</strong> ${
            provider.businessName || "N/A"
          }</p>
          <p><strong>City:</strong> ${provider.city || "N/A"}</p>
          ${
            provider.inspectionRequested
              ? `
            <p><strong>Inspection Requested:</strong> Yes</p>
            <p><strong>Inspection Address:</strong> ${provider.inspectionAddress}</p>
          `
              : ""
          }
        </div>
        
        <p><strong>What happens next?</strong></p>
        <ol>
          <li>Our team will review your submitted documents</li>
          <li>We'll verify your identity and vehicle information</li>
          ${
            provider.inspectionRequested
              ? "<li>We'll schedule a vehicle inspection at your requested location</li>"
              : ""
          }
          <li>You'll receive an email notification with our decision</li>
        </ol>
        
        <p>If you have any questions, please contact us at support@moveease.com</p>
        
        <p>Best regards,<br>The MoveEase Team</p>
      </div>
    `,
  }),

  applicationApproved: (provider) => ({
    subject: "Provider Application Approved! 🎉",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #16a34a;">Congratulations! Your Application is Approved</h2>
        <p>Dear ${provider.user.firstName} ${provider.user.lastName},</p>
        <p>Great news! Your provider application has been approved. You can now start accepting bookings on our platform.</p>
        
        <div style="background: #dcfce7; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #16a34a;">✅ Application Approved</h3>
          <p><strong>Approved Date:</strong> ${new Date(
            provider.reviewedAt
          ).toLocaleDateString()}</p>
        </div>
        
        <p><strong>Next Steps:</strong></p>
        <ol>
          <li>Log in to your provider dashboard</li>
          <li>Complete your profile if you haven't already</li>
          <li>Add your vehicles and set your rates</li>
          <li>Start receiving booking requests!</li>
        </ol>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/provider/dashboard" 
             style="background: #16a34a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">
            Go to Dashboard
          </a>
        </div>
        
        <p>If you need any assistance getting started, our support team is here to help.</p>
        
        <p>Welcome to the team!<br>The MoveEase Team</p>
      </div>
    `,
  }),

  applicationRejected: (provider) => ({
    subject: "Provider Application Update",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Application Update</h2>
        <p>Dear ${provider.user.firstName} ${provider.user.lastName},</p>
        <p>Thank you for your interest in becoming a provider on our platform.</p>
        
        <div style="background: #fee2e2; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p>After careful review, we're unable to approve your application at this time.</p>
          ${
            provider.rejectionReason
              ? `
            <p><strong>Reason:</strong> ${provider.rejectionReason}</p>
          `
              : ""
          }
        </div>
        
        <p><strong>You can reapply by:</strong></p>
        <ol>
          <li>Addressing the issues mentioned above</li>
          <li>Ensuring all required documents are valid and clear</li>
          <li>Submitting a new application through your account</li>
        </ol>
        
        <p>If you have questions or need clarification, please contact us at support@moveease.com</p>
        
        <p>Best regards,<br>The MoveEase Team</p>
      </div>
    `,
  }),

  inspectionScheduled: (provider, inspectionDate) => ({
    subject: "Vehicle Inspection Scheduled",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #16a34a;">Vehicle Inspection Scheduled</h2>
        <p>Dear ${provider.user.firstName} ${provider.user.lastName},</p>
        <p>Your vehicle inspection has been scheduled!</p>
        
        <div style="background: #dbeafe; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Inspection Details:</h3>
          <p><strong>Date & Time:</strong> ${new Date(
            inspectionDate
          ).toLocaleString()}</p>
          <p><strong>Location:</strong> ${provider.inspectionAddress}</p>
        </div>
        
        <p><strong>What to prepare:</strong></p>
        <ul>
          <li>Ensure the vehicle is clean and accessible</li>
          <li>Have all vehicle documents ready (registration, license disk)</li>
          <li>Be present at the scheduled time</li>
        </ul>
        
        <p>Our inspector will verify:</p>
        <ul>
          <li>Vehicle condition and cleanliness</li>
          <li>Safety features and equipment</li>
          <li>License disk validity</li>
          <li>Vehicle capacity and specifications</li>
        </ul>
        
        <p>If you need to reschedule, please contact us at least 24 hours in advance.</p>
        
        <p>Best regards,<br>The MoveEase Team</p>
      </div>
    `,
  }),

  documentsRequired: (provider, missingDocuments) => ({
    subject: "Additional Documents Required",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f59e0b;">Additional Documents Required</h2>
        <p>Dear ${provider.user.firstName} ${provider.user.lastName},</p>
        <p>We're reviewing your provider application and need some additional documents to complete the process.</p>
        
        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Missing Documents:</h3>
          <ul>
            ${missingDocuments.map((doc) => `<li>${doc}</li>`).join("")}
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/provider/documents" 
             style="background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">
            Upload Documents
          </a>
        </div>
        
        <p>Please upload these documents within 7 days to avoid delays in your application review.</p>
        
        <p>Best regards,<br>The MoveEase Team</p>
      </div>
    `,
  }),
};

// Send email function
async function sendEmail(to, template) {
  try {
    const mailOptions = {
      from: `"MoveEase" <${process.env.SMTP_USER}>`,
      to,
      subject: template.subject,
      html: template.html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("📧 Email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Email failed:", error.message);
    return { success: false, error: error.message };
  }
}

// Exported functions
module.exports = {
  sendApplicationSubmitted: async (provider) => {
    return sendEmail(
      provider.user.email,
      emailTemplates.applicationSubmitted(provider)
    );
  },

  sendApplicationApproved: async (provider) => {
    return sendEmail(
      provider.user.email,
      emailTemplates.applicationApproved(provider)
    );
  },

  sendApplicationRejected: async (provider) => {
    return sendEmail(
      provider.user.email,
      emailTemplates.applicationRejected(provider)
    );
  },

  sendInspectionScheduled: async (provider, inspectionDate) => {
    return sendEmail(
      provider.user.email,
      emailTemplates.inspectionScheduled(provider, inspectionDate)
    );
  },

  sendDocumentsRequired: async (provider, missingDocuments) => {
    return sendEmail(
      provider.user.email,
      emailTemplates.documentsRequired(provider, missingDocuments)
    );
  },
};
