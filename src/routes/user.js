import express from 'express';
import { forgetPassword, login, resetPassword, SignUp } from '../controllers/auth.js';
import { deleteUser, getAllUsers, getUserByID, updateUser } from '../controllers/user.js';
import { isLoggedIn } from '../middlewares/auth.js';
import { upload } from '../helpers/multer.js';
import passport from 'passport';


const router = express.Router()

router.post('/register', SignUp)
router.post('/login', login)
router.post('/forgot-password', forgetPassword)
router.put('/reset-password/:token', resetPassword);
router.get('/users', getAllUsers)
router.get('/user/:userId', getUserByID)
router.put('/user/update', isLoggedIn, upload.single("image"), updateUser)
router.delete('/user/delete', isLoggedIn, deleteUser);

// Google routes
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

router.get('/google/callback', passport.authenticate('google', { session: false }), (req, res) => {
  const { token, user } = req.user;
  // Send user information as a query parameter
  res.redirect(`https://localhost:5173/oauth-callback?token=${token}&user=${encodeURIComponent(JSON.stringify(user))}`);
});

router.get('/me', isLoggedIn, (req, res) => {
  res.json({ user: req.user });
});

  

export default router