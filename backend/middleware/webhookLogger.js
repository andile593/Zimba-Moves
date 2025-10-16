const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Logs incoming webhook payload + headers
 * Usage: place before your webhook controller
 */
const webhookLogger = (gateway) => async (req, res, next) => {
  try {
    await prisma.webhookLog.create({
      data: {
        gateway,
        payload: req.body,
        headers: req.headers
      }
    });
  } catch (err) {
    console.error('Webhook logging failed:', err.message);
    // Don't block processing
  } finally {
    next();
  }
};

module.exports = webhookLogger;
