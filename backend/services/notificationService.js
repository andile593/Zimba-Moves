const nodemailer = require('nodemailer');

// Email transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});


async function sendEmail({ to, subject, html }) {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject,
      html
    });
    console.log(`📧 Email sent to ${to}`);
  } catch (err) {
    console.error(`Email failed to ${to}`, err.message);
  }
}
/**
 * Domain-specific notifications
 */

// Booking confirmation
async function notifyBookingCreated({ booking, customer, provider }) {
  const msg = `
    Hi ${customer.firstName}, your booking is confirmed.
    Pickup: ${booking.pickup}, Dropoff: ${booking.dropoff}.
  `;
  await sendEmail({ to: customer.email, subject: 'Booking Confirmation', html: msg });

  const providerMsg = `
    Hi ${provider.company || provider.user.firstName}, new booking assigned.
    Pickup: ${booking.pickup}, Dropoff: ${booking.dropoff}.
  `;
  await sendEmail({ to: provider.user.email, subject: 'New Booking Assigned', html: providerMsg });
}

// Payment success
async function notifyPaymentSuccess({ payment, booking, customer }) {
  const msg = `
    Hi ${customer.firstName}, your payment of ${payment.amount} was successful.
    Booking ID: ${booking.id}.
  `;
  await sendEmail({ to: customer.email, subject: 'Payment Successful', html: msg });
}

// Refund processed
async function notifyRefund({ refund, customer }) {
  const msg = `
    Hi ${customer.firstName}, your refund of ${refund.amount} is ${refund.status}.
    Reference: ${refund.gatewayRef}.
  `;
  await sendEmail({ to: customer.email, subject: 'Refund Update', html: msg });
}

async function notifyRefundFinalized({ refund, payment, customer }) {
  let subject, msg;

  if (refund.status === 'COMPLETED') {
    subject = 'Refund Completed';
    msg = `
      Hi ${customer.firstName}, your refund of ${refund.amount} has been successfully processed.
      Reference: ${refund.gatewayRef}.
    `;
  } else if (refund.status === 'FAILED') {
    subject = 'Refund Failed';
    msg = `
      Hi ${customer.firstName}, your refund of ${refund.amount} could not be processed.
      Please contact support with reference: ${refund.gatewayRef}.
    `;
  }

  await sendEmail({ to: customer.email, subject, html: msg });
}

// Complaint opened
async function notifyComplaintOpened({ complaint, customer }) {
  const msg = `
    Hi ${customer.firstName}, your complaint has been logged.
    Issue: ${complaint.description}.
  `;
  await sendEmail({ to: customer.email, subject: 'Complaint Received', html: msg });
}

module.exports = {
  sendEmail,
  notifyBookingCreated,
  notifyPaymentSuccess,
  notifyRefund,
  notifyRefundFinalized,
  notifyComplaintOpened
};
