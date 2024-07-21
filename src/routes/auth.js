import express from 'express';
import passport from 'passport';
import { isLoggedIn } from '../middlewares/auth.js';

const router = express.Router();

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', passport.authenticate('google', { session: false }), (req, res) => {
  const { token, user } = req.user;
  // Send user information as a query parameter
  res.redirect(`http://localhost:5173/oauth-callback?token=${token}&user=${encodeURIComponent(JSON.stringify(user))}`);
});

router.get('/me', isLoggedIn, (req, res) => {
  res.json({ user: req.user });
});

export default router;
