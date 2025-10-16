// backend/routes/health.js
router.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ 
      status: 'healthy', 
      database: 'connected',
      redis: redisClient.status === 'ready' ? 'connected' : 'disconnected'
    });
  } catch (err) {
    res.status(503).json({ status: 'unhealthy', error: err.message });
  }
});
