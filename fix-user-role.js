const mongoose = require('mongoose');
require('dotenv').config({ path: './server/.env' });

const User = require('./server/models/User');

async function updateUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const result = await User.findOneAndUpdate(
      { email: 'c@test.com' },
      { role: 'client' },
      { new: true }
    );
    
    if (result) {
      console.log('✅ Updated user:', result.email);
      console.log('   Name:', result.name);
      console.log('   Role:', result.role);
    } else {
      console.log('❌ User not found');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

updateUser();
