import Account from './src/models/Account.js';
import db from './src/config/database.js';
import mongoose from 'mongoose';

async function checkAccount() {
  try {
    // Connect with timeout
    const conn = await mongoose.connect('mongodb+srv://pixels:bnVtYmVyMjU5OA@pixelswhatsapp.7u1vk.mongodb.net/pixelswhatsapp?retryWrites=true&w=majority', {
      serverSelectionTimeoutMS: 3000,
      socketTimeoutMS: 3000
    });
    
    console.log('✅ Connected to MongoDB\n');
    
    // Check if Enromatics account exists
    const enromatics = await Account.findOne({ email: 'info@enromatics.com' });
    
    console.log('📊 Enromatics Account:');
    if (enromatics) {
      console.log('  _id:', enromatics._id);
      console.log('  accountId:', enromatics.accountId);
      console.log('  name:', enromatics.name);
      console.log('  email:', enromatics.email);
      console.log('  type:', enromatics.type);
      console.log('  plan:', enromatics.plan);
      console.log('  status:', enromatics.status);
      console.log('\n✅ Account HAS accountId field:', !!enromatics.accountId);
    } else {
      console.log('  ❌ NOT FOUND');
    }
    
    // Check pixels_internal account
    console.log('\n📊 Superadmin Account (pixels_internal):');
    const superadmin = await Account.findOne({ accountId: 'pixels_internal' });
    if (superadmin) {
      console.log('  _id:', superadmin._id);
      console.log('  accountId:', superadmin.accountId);
      console.log('  name:', superadmin.name);
      console.log('  type:', superadmin.type);
      console.log('  ✅ Found');
    } else {
      console.log('  ❌ NOT FOUND - This is the problem!');
    }
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

checkAccount();
