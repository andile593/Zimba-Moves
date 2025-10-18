const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const jwt = require('jsonwebtoken');
const { userSignupSchema, userLoginSchema } = require('../validators/schema');
const authController = require('../controllers/userController');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');

router.post('/signup', validate(userSignupSchema), authController.createUser);
router.post('/login', validate(userLoginSchema), authController.login);

router.get(
  '/google',
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    session: false 
  })
);

// Google OAuth callback
router.get(
  '/google/callback',
  passport.authenticate('google', { 
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=auth_failed`,
    session: false 
  }),
  (req, res) => {
    try {
      const token = jwt.sign(
        { 
          userId: req.user.id, 
          role: req.user.role 
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.redirect(
        `${process.env.FRONTEND_URL}/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify({
          id: req.user.id,
          email: req.user.email,
          role: req.user.role,
          firstName: req.user.firstName,
          lastName: req.user.lastName
        }))}`
      );
    } catch (err) {
      console.error('Google auth callback error:', err);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=token_generation_failed`);
    }
  }
);

router.get('/me', authenticate, (req, res) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });
  res.json(req.user);
});

module.exports = router;