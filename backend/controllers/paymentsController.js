const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const axios = require('axios');
const crypto = require('crypto');
const notifications = require('../services/notificationService');
const refundQueue = require('../queues/refundQueue');

/* helper: log event */
async function logEvent({ paymentId, type, gateway, gatewayRef = null, payload }) {
  try {
    return await prisma.paymentEvent.create({
      data: { paymentId, type, gateway, gatewayRef, payload }
    });
  } catch (error) {
    // If it's a duplicate constraint error (P2002), just return null or existing record
    if (error.code === 'P2002') {
      console.log('Duplicate event log attempt prevented:', { gateway, gatewayRef });
      return null;
    }
    throw error;
  }
}


/**
 * Initiate a payment (Paystack only)
 */
exports.initiatePayment = async (req, res, next) => {
  try {
    const { bookingId } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { customer: true }
    });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    // Create Payment record if not exists
    let payment = await prisma.payment.findUnique({ where: { bookingId } });
    if (!payment) {
      payment = await prisma.payment.create({
        data: {
          bookingId,
          providerId: booking.providerId,
          amount: booking.pricing.total,
          status: 'PENDING'
        }
      });
    }

    // Construct the callback URL with booking ID
    const callbackUrl = `${process.env.FRONTEND_URL}/payment-success?reference=${payment.id}&bookingId=${bookingId}`;
    
    const paystackRes = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email: booking.customer.email,
        amount: payment.amount * 100, // Paystack expects kobo
        reference: payment.id,
        callback_url: callbackUrl,
        metadata: { 
          bookingId: booking.id,
          customerId: booking.customerId
        }
      },
      {
        headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET}` }
      }
    );

    // Store the Paystack reference for later verification
    await prisma.payment.update({
      where: { id: payment.id },
      data: { gatewayReference: paystackRes.data.data.reference }
    });

    // Log the initiation event
    await logEvent({
      paymentId: payment.id,
      type: 'PAYMENT_INITIATED',
      gateway: 'PAYSTACK',
      gatewayRef: paystackRes.data.data.reference,
      payload: paystackRes.data.data
    });

    return res.json({
      provider: 'paystack',
      authorizationUrl: paystackRes.data.data.authorization_url,
      reference: payment.id
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Initiate a refund
 */
exports.initiateRefund = async (req, res, next) => {
  try {
    const { paymentId } = req.params;

    const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    if (payment.status !== 'PAID') {
      return res.status(400).json({ error: 'Only PAID payments can be refunded' });
    }

    // Prevent duplicates
    if (payment.refundReference) {
      return res.status(200).json({ message: 'Refund already initiated', payment });
    }

    // Must have Paystack transaction ref
    if (!payment.gatewayReference) {
      return res.status(400).json({ error: 'Missing gateway reference for refund' });
    }

    // Call Paystack refund API
    const refundRes = await axios.post(
      'https://api.paystack.co/refund',
      { transaction: payment.gatewayReference },
      { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET}` } }
    );

    const refundData = refundRes.data.data;

    // Create refund record
    const refund = await prisma.refund.create({
      data: {
        paymentId: payment.id,
        amount: payment.amount,
        gateway: 'PAYSTACK',
        gatewayRef: refundData.reference,
        status: 'INITIATED'
      }
    });

    // Update payment
    await prisma.payment.update({
      where: { id: paymentId },
      data: { refundReference: refundData.reference }
    });

    // Log event
    await logEvent({
      paymentId: payment.id,
      type: 'REFUND_REQUEST',
      gateway: 'PAYSTACK',
      gatewayRef: refundData.reference,
      payload: refundData
    });

    // Enqueue polling job
    await refundQueue.add('refundPoll', {
      refundId: refund.id,
      paymentId: payment.id,
      refundReference: refundData.reference
    });

    res.json({ message: 'Refund initiated and queued for polling', refund });
  } catch (err) {
    next(err);
  }
};


/**
 * Paystack Webhook
 */
exports.paystackWebhook = async (req, res, next) => {
  try {
    const secret = process.env.PAYSTACK_SECRET;
    const rawBody = req.body.toString('utf8'); // convert Buffer to string
    const hash = crypto.createHmac('sha512', secret).update(rawBody).digest('hex');

    if (hash !== req.headers['x-paystack-signature']) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const event = JSON.parse(rawBody);

    if (event.event === 'charge.success') {
      const payment = await prisma.payment.update({
        where: { id: event.data.reference },
        data: { 
          status: 'PAID',
          gatewayReference: event.data.reference
        }
      });

      const booking = await prisma.booking.update({
        where: { id: event.data.metadata.bookingId },
        data: { paymentStatus: 'PAID' }
      });
      
      const customer = await prisma.user.findUnique({ where: { id: booking.customerId } });

      // Log the webhook event
      await logEvent({
        paymentId: payment.id,
        type: 'WEBHOOK_SUCCESS',
        gateway: 'PAYSTACK',
        gatewayRef: event.data.reference,
        payload: event.data
      });

      notifications.notifyPaymentSuccess({ payment, booking, customer });
    }

    res.sendStatus(200);
  } catch (err) {
    next(err);
  }
};


/**
 * Verify Payment
 */
exports.verifyPayment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const payment = await prisma.payment.findUnique({ 
      where: { id },
      include: { booking: true }
    });
    if (!payment) return res.status(404).json({ error: 'Payment not found' });

    // Use gatewayReference if available, otherwise fall back to payment.id
    const referenceToVerify = payment.gatewayReference || payment.id;

    const verifyRes = await axios.get(
      `https://api.paystack.co/transaction/verify/${referenceToVerify}`,
      {
        headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET}` }
      }
    );

    const data = verifyRes.data.data;
    const status = data.status === 'success' ? 'PAID' : 'FAILED';

    // Update DB with verified status
    await prisma.payment.update({
      where: { id },
      data: { 
        status: status,
        gatewayReference: data.reference
      }
    });

    await prisma.booking.update({
      where: { id: payment.bookingId },
      data: { paymentStatus: status },
    });

    // Log verification event
    await logEvent({
      paymentId: id,
      type: 'VERIFICATION',
      gateway: 'PAYSTACK',
      gatewayRef: data.reference,
      payload: data
    });

    res.json({ 
      status, 
      amount: data.amount / 100, 
      reference: data.reference,
      paidAt: data.paid_at,
      bookingId: payment.bookingId
    });
  } catch (err) {
    console.error('Payment verification error:', err.response?.data || err.message);
    next(err);
  }
};


/**
 * Check refund status
 */
exports.checkRefundStatus = async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    const refund = await prisma.refund.findFirst({
      where: { paymentId },
      orderBy: { createdAt: 'desc' }
    });

    if (!refund) return res.status(404).json({ error: 'No refund found for this payment' });
    res.json({ status: refund.status, gatewayRef: refund.gatewayRef });
  } catch (err) {
    next(err);
  }
};