import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';

// Import BOTH data models
import Dataset from './models/Dataset.js';
import Dataset2 from './models/Dataset2.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sih';

// Helper function to read and parse a JSON file
const readJsonFile = async (filePath) => {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    // Split by newline and filter out any empty lines
    const lines = data.split('\n').filter(line => line.trim() !== '');
    return lines.map(line => JSON.parse(line));
  } catch (error) {
    console.error(`❌ Error reading or parsing ${filePath}:`, error.message);
    return []; // Return empty array on error
  }
};


const importData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB connected for seeding.');

    // --- Process Dataset 1 ---
    await Dataset.deleteMany();
    console.log('🧹 Previous data in collection 1 has been cleared.');
    const dataset1Records = await readJsonFile(path.resolve('dataset1.json'));
    if (dataset1Records.length > 0) {
      await Dataset.insertMany(dataset1Records);
      console.log(`✅ ${dataset1Records.length} records from dataset1.json successfully imported!`);
    } else {
       console.log('⚠️ No records found in dataset1.json to import.');
    }

    // --- Process Dataset 2 ---
    await Dataset2.deleteMany();
    console.log('🧹 Previous data in collection 2 has been cleared.');
    const dataset2Records = await readJsonFile(path.resolve('dataset2.json'));
     if (dataset2Records.length > 0) {
      await Dataset2.insertMany(dataset2Records);
      console.log(`✅ ${dataset2Records.length} records from dataset2.json successfully imported!`);
    } else {
       console.log('⚠️ No records found in dataset2.json to import.');
    }


  } catch (error) {
    console.error('❌ Error during the seeding process:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed.');
  }
};

importData();

