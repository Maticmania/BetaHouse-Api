import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';
import User from '../models/user.js'; // Adjust the path according to your project structure
import jwt from 'jsonwebtoken';

dotenv.config();

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  const { id, name, emails } = profile;
  try {
    let user = await User.findOne({ googleId: id });

    if (!user) {
      user = new User({
        googleId: id,
        firstName: name.givenName,
        lastName: name.familyName,
        email: emails[0].value
      });
      await user.save();
    }

    const payload = {
      id: user._id,
      email: user.email
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Return both token and user
    return done(null, { token, user });
  } catch (error) {
    return done(error, false);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

export default passport;
