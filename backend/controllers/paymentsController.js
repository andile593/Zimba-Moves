const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const axios = require('axios');
const crypto = require('crypto');
const notifications = require('../services/notificationService');
const refundQueue = require('../queues/refundQueue');

/* helper: log event */
async function logEvent({ paymentId, type, gateway, gatewayRef = null, payload }) {
  return prisma.paymentEvent.create({
    data: { paymentId, type, gateway, gatewayRef, payload }
  });
}


/**
 * Initiate a payment (Paystack or Ozow)
 */
exports.initiatePayment = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const { gateway } = req.query; // ?gateway=paystack | ozow

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

    // Gateway-specific logic
    if (gateway === 'paystack') {
      const paystackRes = await axios.post(
        'https://api.paystack.co/transaction/initialize',
        {
          email: booking.customer.email,
          amount: payment.amount * 100, // Paystack expects kobo
          reference: payment.id,
          metadata: { bookingId: booking.id }
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

      return res.json({
        provider: 'paystack',
        authorizationUrl: paystackRes.data.data.authorization_url,
        reference: payment.id
      });
    }

    if (gateway === 'ozow') {
      const payload = {
        siteCode: process.env.OZOW_SITE_CODE,
        countryCode: 'ZA',
        currencyCode: 'ZAR',
        amount: payment.amount.toFixed(2),
        transactionReference: payment.id,
        bankReference: `BOOK-${booking.id.slice(0, 6)}`,
        cancelUrl: process.env.OZOW_CANCEL_URL,
        errorUrl: process.env.OZOW_ERROR_URL,
        successUrl: process.env.OZOW_SUCCESS_URL,
        notifyUrl: `${process.env.API_URL}/payments/ozow-webhook`
      };

      // Generate Ozow hash
      const concatStr = `${payload.siteCode}${payload.countryCode}${payload.currencyCode}${payload.amount}${payload.transactionReference}${payload.bankReference}${payload.cancelUrl}${payload.errorUrl}${payload.successUrl}${payload.notifyUrl}${process.env.OZOW_PRIVATE_KEY}`;
      const hash = crypto.createHash('sha512').update(concatStr).digest('hex').toUpperCase();

      return res.json({
        provider: 'ozow',
        redirectUrl: `https://pay.ozow.com/?${new URLSearchParams({ ...payload, hash }).toString()}`
      });
    }

    return res.status(400).json({ error: 'Unsupported gateway' });
  } catch (err) {
    next(err);
  }
};

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
    await prisma.paymentEvent.create({
      data: {
        paymentId: payment.id,
        type: 'REFUND_REQUEST',
        gateway: 'PAYSTACK',
        gatewayRef: refundData.reference,
        payload: refundData
      }
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

      notifications.notifyPaymentSuccess({ payment, booking, customer });
    }

    res.sendStatus(200);
  } catch (err) {
    next(err);
  }
};


/**
 * Ozow Webhook
 */
exports.ozowWebhook = async (req, res, next) => {
  try {
    const rawBody = req.body.toString('utf8');
    const event = JSON.parse(rawBody);

    const {
      transactionReference,
      status,
      siteCode,
      amount,
      currencyCode,
      bankReference
    } = event;

    // Rebuild the string for verification
    const concatStr = `${siteCode}${transactionReference}${amount}${currencyCode}${bankReference}${process.env.OZOW_PRIVATE_KEY}`;
    const hash = crypto.createHash('sha512').update(concatStr).digest('hex').toUpperCase();

    if (hash !== event.hash) {
      return res.status(400).json({ error: 'Invalid Ozow signature' });
    }

    if (status === 'Completed') {
      await prisma.payment.update({
        where: { id: transactionReference },
        data: { status: 'PAID' }
      });

      const payment = await prisma.payment.findUnique({ where: { id: transactionReference } });

      await prisma.booking.update({
        where: { id: payment.bookingId },
        data: { paymentStatus: 'PAID' }
      });
    }

    if (status === 'Failed') {
      await prisma.payment.update({
        where: { id: transactionReference },
        data: { status: 'FAILED' }
      });
    }

    await prisma.paymentEvent.create({
      data: {
        paymentId: transactionReference,
        type: 'WEBHOOK',
        gateway: 'OZOW',
        payload: event
      }
    });

    res.sendStatus(200);
  } catch (err) {
    next(err);
  }
};


/**
 * Verify Payment - FIXED to handle both reference types
 */
exports.verifyPayment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const payment = await prisma.payment.findUnique({ where: { id } });
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

    await prisma.paymentEvent.create({
      data: {
        paymentId: id,
        type: 'VERIFICATION',
        gateway: 'PAYSTACK',
        payload: data
      }
    });

    res.json({ 
      status, 
      amount: data.amount / 100, 
      reference: data.reference,
      paidAt: data.paid_at
    });
  } catch (err) {
    console.error('Payment verification error:', err.response?.data || err.message);
    next(err);
  }
};


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