// config/db.js
// MongoDB connection logic

const mongoose = require('mongoose');

const connectDB = async (retries = 3) => {
  const maxRetries = retries;
  
  // Debug: Log connection string (mask password)
  const uri = process.env.MONGO_URI || '';
  const maskedUri = uri.replace(/:([^@]+)@/, ':****@');
  console.log('🔍 MONGO_URI:', maskedUri);
  console.log('🔍 NODE_ENV:', process.env.NODE_ENV);
  
  while (retries > 0) {
    try {
      console.log(`Attempting MongoDB connection... (attempt ${maxRetries - retries + 1}/${maxRetries})`);
      await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        bufferCommands: false,
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('✅ MongoDB connected successfully');
      console.log('📊 Database:', mongoose.connection.name);
      console.log('📊 Host:', mongoose.connection.host);
      return;
    } catch (err) {
      console.error(`❌ MongoDB connection failed (attempt ${maxRetries - retries + 1}/${maxRetries}):`, err.message);
      retries -= 1;
      if (retries === 0) throw err;
      console.log(`Retrying in 5s... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
};

module.exports = { connectDB };
