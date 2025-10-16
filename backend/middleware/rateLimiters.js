const rateLimit = require('express-rate-limit');

exports.payLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5,
  message: { error: 'Too many payment attempts, slow down.' }
});

exports.refundLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 3,                   // max 3 refund attempts per 10 minutes per IP/admin
  message: { error: 'Too many refund attempts, try again later.' }
});
