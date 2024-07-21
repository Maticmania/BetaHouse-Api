import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'; 
import { connectDB } from './src/configs/db.config.js';
import passport from './src/configs/passport.js'; // Import passport configuration
import AuthRoutes from './src/routes/user.js';
import SocialRoutes from './src/routes/auth.js';
import ProductRoutes from './src/routes/product.js';

dotenv.config();

const app = express();

const dbUrl = process.env.MONGODB_URL;
const port = process.env.PORT || 8080;

app.use(express.json());

// Enabling CORS for all routes
app.use(cors());

// Initialize Passport
app.use(passport.initialize());

// Connect to the database
connectDB(dbUrl);

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the BetaHouse API');
});

app.use('/api/auth', AuthRoutes);
app.use('/auth', SocialRoutes);
app.use('/api/product', ProductRoutes);

// Error handling for undefined routes
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Start the server
app.listen(port, () => {
  console.log(`BetaHouse API listening on port ${port}`);
});
