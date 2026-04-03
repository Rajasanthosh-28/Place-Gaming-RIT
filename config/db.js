const mongoose = require('mongoose');

// In-memory mode flag
let inMemoryMode = false;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log('MongoDB not available. Switching to IN-MEMORY mode.');
    inMemoryMode = true;
  }
};

const isInMemory = () => inMemoryMode;

module.exports = { connectDB, isInMemory };
