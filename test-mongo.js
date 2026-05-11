const mongoose = require('mongoose');

async function testConnection() {
  try {
    await mongoose.connect('mongodb://localhost:27017/');
    console.log('Successfully connected to MongoDB.');
    process.exit(0);
  } catch (error) {
    console.error('Connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();
