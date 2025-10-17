const { Worker } = require('bullmq');
const axios = require('axios');
const prisma = require('../prisma');
const notifications = require('../services/notificationService');

const refundWorker = new Worker(
    'refunds',
    async job => {
        const { refundId, paymentId, refundReference } = job.data;

        console.log(`🔄 Polling refund ${refundReference} for payment ${paymentId}`);

        const resp = await axios.get(
            `https://api.paystack.co/refund/${refundReference}`,
            { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET}` } }
        );

        const refundData = resp.data.data;

        // Map Paystack refund status
        const statusMap = {
            pending: 'INITIATED',
            processing: 'INITIATED',
            success: 'COMPLETED',
            failed: 'FAILED'
        };
        const mappedStatus = statusMap[refundData.status] || refundData.status.toUpperCase();

        // Update Refund record
        await prisma.refund.update({
            where: { id: refundId },
            data: { status: mappedStatus, gatewayRef: refundReference }
        });

        // If COMPLETED, update Payment as REFUNDED
        if (mappedStatus === 'COMPLETED') {
            await prisma.payment.update({
                where: { id: paymentId },
                data: { status: 'REFUNDED' }
            });
        }

        // If COMPLETED or FAILED, notify customer
        if (['COMPLETED', 'FAILED'].includes(mappedStatus)) {
            const refund = await prisma.refund.findUnique({ where: { id: refundId } });
            const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
            const booking = await prisma.booking.findUnique({ where: { id: payment.bookingId } });
            const customer = await prisma.user.findUnique({ where: { id: booking.customerId } });

            notifications.notifyRefundFinalized({ refund, payment, customer });
        }


        // Re-enqueue if still not final
        if (['PENDING', 'INITIATED'].includes(mappedStatus)) {
            console.log(`Refund ${refundReference} still ${mappedStatus}, re-queueing...`);
            await job.queue.add('refundPoll', { refundId, paymentId, refundReference }, { delay: 60 * 1000 });
        } else {
            console.log(`Refund ${refundReference} finalized as ${mappedStatus}`);
        }

        return { refundStatus: mappedStatus };
    },
);

refundWorker.on('completed', job => {
    console.log(`Refund poll job ${job.id} completed`);
});

refundWorker.on('failed', (job, err) => {
    console.error(`Refund poll job ${job.id} failed:`, err.message);
});

module.exports = refundWorker;
