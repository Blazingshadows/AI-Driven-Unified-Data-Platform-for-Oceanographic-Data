import express from 'express';
import Dataset from '../models/Dataset.js'; // Import the data model

// Create a new router object to handle requests
const router = express.Router();

// --- Define the API Route ---
// This handles GET requests to the root of this router (which is '/api/datasets')
router.get('/', async (req, res) => {
  try {
    // 1. Fetch all documents from the 'datasets' collection in your database
    const allData = await Dataset.find({});

    // 2. If successful, send the data back as a JSON response
    res.json(allData);
    
  } catch (error) {
    // 3. If an error occurs, log it and send a 500 server error status
    console.error('Error fetching data:', error);
    res.status(500).json({ message: 'Server error while fetching data.' });
  }
});

// Export the router so it can be used in server.js
export default router;