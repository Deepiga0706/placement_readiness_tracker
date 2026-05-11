const mongoose = require('mongoose');

async function testConnection() {
  try {
    await mongoose.connect('mongodb://localhost:27017/placement_tracker');
    console.log('Successfully connected to MongoDB!');
    process.exit(0);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
}

testConnection();
