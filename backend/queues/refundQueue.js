const { Queue } = require('bullmq');

let refundQueue = null;

if (process.env.REDIS_URL) {
  try {
    refundQueue = new Queue('refunds', {
      connection: { url: process.env.REDIS_URL },
    });
    console.log('✅ BullMQ refund queue connected.');
  } catch (err) {
    console.warn('Failed to connect to Redis:', err.message);
  }
} else {
  console.warn('Skipping BullMQ initialization — REDIS_URL not set.');
}

module.exports = refundQueue;
