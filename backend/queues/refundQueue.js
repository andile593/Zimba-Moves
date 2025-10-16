const { Queue } = require('bullmq');
const connection = { connection: { url: process.env.REDIS_URL } };

const refundQueue = new Queue('refunds', connection);

module.exports = refundQueue;