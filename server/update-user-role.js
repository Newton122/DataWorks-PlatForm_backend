const mongoose = require('mongoose');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function main() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('✓ Connected');

    // Import User model  
    const User = require('./models/User');
    
    // Update c@test.com to be a client
    console.log('Updating user c@test.com to role: client...');
    const result = await User.findOneAndUpdate(
      { email: 'c@test.com' },
      { $set: { role: 'client' } },
      { new: true, lean: true }
    );

    if (result) {
      console.log('✅ SUCCESS! Updated user:');
      console.log('  Email:', result.email);
      console.log('  Name:', result.name);
      console.log('  New Role:', result.role);
    } else {
      console.log('❌ User c@test.com not found');
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
