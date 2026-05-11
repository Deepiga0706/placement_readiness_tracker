const mongoose = require('mongoose');

async function testConnection() {
  try {
    const uri = "mongodb+srv://deepi:deepi123@cluster0.90i62te.mongodb.net/placement_tracker?appName=Cluster0";
    console.log("Connecting to:", uri.replace(/:([^:@]+)@/, ':****@'));
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('Successfully connected to MongoDB Atlas.');
    process.exit(0);
  } catch (error) {
    console.error('Connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();
