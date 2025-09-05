import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Import BOTH of your data models
import Dataset from './models/Dataset.js';
import Dataset2 from './models/Dataset2.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sih';

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB connected successfully.'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// --- API Route for the FIRST dataset ---
app.get('/api/datasets', async (req, res) => {
  try {
    const data = await Dataset.find({});
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching dataset 1.' });
  }
});

// --- API Route for the SECOND dataset ---
app.get('/api/datasets2', async (req, res) => {
  try {
    const data = await Dataset2.find({});
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching dataset 2.' });
  }
});


// Root Route for testing
app.get('/', (req, res) => {
  res.send('IndOBIS Backend API is running...');
});

// Start Server
app.listen(PORT, () => console.log(`🚀 Server is running on port: ${PORT}`));

