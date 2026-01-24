#!/usr/bin/env node
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

// Import models
import Account from './src/models/Account.js';
import Payment from './src/models/Payment.js';
import Subscription from './src/models/Subscription.js';
import Invoice from './src/models/Invoice.js';

async function deleteClient() {
  try {
    const mongoUri = process.env.MONGO_URI;
    console.log('🔗 Connecting to MongoDB...');
    
    await mongoose.connect(mongoUri || 'mongodb://localhost:27017/replysys');
    console.log('✅ Connected!\n');

    const email = 'pixelsadvertise@gmail.com';
    
    // Find Account
    const account = await Account.findOne({ email });
    
    if (!account) {
      console.log('❌ No account found with email:', email);
      await mongoose.disconnect();
      process.exit(1);
    }

    console.log('🗑️  DELETING CLIENT: ', email);
    console.log('━'.repeat(70));
    console.log('Account ID:', account._id);
    console.log('Name:', account.name);
    console.log('Company:', account.company);

    // Count related records
    const paymentCount = await Payment.countDocuments({ accountId: account._id });
    const subCount = await Subscription.countDocuments({ accountId: account._id });
    const invCount = await Invoice.countDocuments({ accountId: account._id });

    console.log('\n📊 Records to delete:');
    console.log('  Payments:', paymentCount);
    console.log('  Subscriptions:', subCount);
    console.log('  Invoices:', invCount);

    // Delete all related records
    console.log('\n⏳ Deleting...');
    
    await Payment.deleteMany({ accountId: account._id });
    console.log('✅ Deleted', paymentCount, 'payments');
    
    await Subscription.deleteMany({ accountId: account._id });
    console.log('✅ Deleted', subCount, 'subscriptions');
    
    await Invoice.deleteMany({ accountId: account._id });
    console.log('✅ Deleted', invCount, 'invoices');
    
    // Delete account
    await Account.deleteOne({ _id: account._id });
    console.log('✅ Deleted account');

    console.log('\n🎉 CLIENT COMPLETELY DELETED!');
    console.log('Ready for fresh onboarding');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

deleteClient();
