import mongoose from 'mongoose';

// Define the structure (schema) for each record in your dataset
const DatasetSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true // Ensures no duplicate records based on ID
  },
  individualCount: {
    type: Number,
    required: true
  },
  maximumDepthInMeters: {
    type: Number
  },
  decimalLatitude: {
    type: Number,
    required: true
  },
  decimalLongitude: {
    type: Number,
    required: true
  },
  dateIdentified: {
    type: String
  },
  scientificName: {
    type: String,
    required: true
  }
});

// Create a Mongoose model from the schema
const Dataset = mongoose.model('Dataset', DatasetSchema);

// Export the model so other files can use it
export default Dataset;

