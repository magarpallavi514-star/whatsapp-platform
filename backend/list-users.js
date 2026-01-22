import mongoose from 'mongoose';
import User from './src/models/User.js';

const MONGODB_URI = 'mongodb+srv://pixelsagency:Pm02072023@pixelsagency.664wxw1.mongodb.net/pixelswhatsapp';

async function listUsers() {
  try {
    await mongoose.connect(MONGODB_URI);
    
    const users = await User.find().select('email name accountId').limit(20);
    
    console.log('=== ALL USERS ===\n');
    users.forEach(u => {
      console.log(`Email: ${u.email}`);
      console.log(`Name: ${u.name}`);
      console.log(`Account: ${u.accountId}`);
      console.log('---');
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

listUsers();
