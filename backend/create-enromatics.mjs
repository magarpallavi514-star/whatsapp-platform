import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import User from './src/models/User.js';
import Account from './src/models/Account.js';
import Counter from './src/models/Counter.js';

async function create() {
  try {
    await mongoose.connect('mongodb://localhost:27017/pixelswhatsapp');
    
    // Get next account ID
    const counter = await Counter.findByIdAndUpdate(
      'accountId',
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    const accountId = String(Math.floor(Date.now() / 1000000)).slice(-2) + String(counter.seq).padStart(5, '0');
    
    const password = '22442232';
    const hashedPassword = await bcryptjs.hash(password, 10);
    
    // Create User
    const user = new User({
      name: 'Enromatics',
      email: 'info@enromatics.com',
      password: hashedPassword,
      accountId: accountId,
      phone: '+918087131777',
      phoneNumber: '8087131777',
      countryCode: '+91',
      plan: 'pro',
      status: 'active',
      billingCycle: 'annual',
      role: 'user',
      totalPayments: 0
    });
    
    await user.save();
    console.log('✅ User created:', user.email, 'accountId:', accountId);
    
    // Create Account
    const account = new Account({
      accountId: accountId,
      name: 'Enromatics',
      email: 'info@enromatics.com',
      plan: 'pro',
      status: 'active',
      billingCycle: 'annual',
      type: 'client'
    });
    
    await account.save();
    console.log('✅ Account created:', account.email, 'accountId:', accountId);
    console.log('\n✅ Login with: info@enromatics.com / 22442232');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

create();
