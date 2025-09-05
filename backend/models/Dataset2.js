import mongoose from 'mongoose';

const dataset2Schema = new mongoose.Schema({
  id: String,
  eventDate: String,
  maximumDepthInMeters: Number, // Switched to Number for consistency
  decimalLatitude: Number,
  decimalLongitude: Number,
  scientificName: String, // Added the new field
});

// Mongoose will create a collection named 'dataset2s' from this model
const Dataset2 = mongoose.model('Dataset2', dataset2Schema);

export default Dataset2;

