import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './src/models/User.js';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('✅ MongoDB Connected\n');
  
  try {
    const user = await User.findOne({ email: 'info@enromatics.com' });
    
    if (!user) {
      console.log('❌ User not found');
      process.exit(1);
    }
    
    console.log('📱 Enromatics WhatsApp Setup:');
    console.log('  Phone Number:', user.phoneNumber || user.phone || '(not set)');
    console.log('  Phone Country Code:', user.countryCode || '(not set)');
    console.log('  Account ID:', user.accountId);
    console.log('  Full User Data Keys:', Object.keys(user.toObject()));
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}).catch(err => {
  console.error('❌ MongoDB Connection Error:', err.message);
  process.exit(1);
});
