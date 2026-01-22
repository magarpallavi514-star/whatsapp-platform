import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './src/models/User.js';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('✅ MongoDB Connected');
  
  try {
    const user = await User.findOne({ email: 'info@enromatics.com' });
    
    if (!user) {
      console.log('❌ User not found');
      process.exit(1);
    }
    
    console.log('\n📊 Enromatics User Details:');
    console.log('  Email:', user.email);
    console.log('  Name:', user.name);
    console.log('  AccountId:', user.accountId);
    console.log('  Password stored:', user.password ? '✅ Yes' : '❌ No');
    console.log('  Password value:', user.password || '(empty)');
    console.log('  Role:', user.role || '(not set)');
    console.log('  Status:', user.status || '(not set)');
    console.log('  Created:', user.createdAt);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}).catch(err => {
  console.error('❌ MongoDB Connection Error:', err.message);
  process.exit(1);
});
