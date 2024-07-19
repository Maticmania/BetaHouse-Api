import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'; // Importing CORS
import { connectDB } from './src/configs/db.config.js';
import AuthRoutes from './src/routes/user.js';

dotenv.config();

const app = express();

const dbUrl = process.env.MONGODB_URL;
const port = process.env.PORT || 8080;

app.use(express.json());

// Enabling CORS for all routes
app.use(cors());

// const corsOptions = {
//   origin: 'http://your-frontend-domain.com',
//   optionsSuccessStatus: 200 // For legacy browser support
// };

// app.use(cors(corsOptions));

// Connect to the database
connectDB(dbUrl);

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the BetaHouse API');
});

app.use('/api/auth', AuthRoutes);

// Error handling for undefined routes
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Start the server
app.listen(port, () => {
  console.log(`BetaHouse API listening on port ${port}`);
});