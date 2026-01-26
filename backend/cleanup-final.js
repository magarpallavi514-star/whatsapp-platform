#!/usr/bin/env node
/**
 * Final Cleanup - Fix remaining references
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Invoice from './src/models/Invoice.js';
import Subscription from './src/models/Subscription.js';
import Payment from './src/models/Payment.js';

dotenv.config();

async function finalCleanup() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/whatsapp-platform');
    console.log('Connected to MongoDB');

    // Fix remaining references to old account names
    
    // 1. Delete invoices with eno_2600003 (old name - should be 2600003)
    const inv1 = await Invoice.deleteMany({ accountId: 'eno_2600003' });
    console.log(`✅ Deleted ${inv1.deletedCount} invoices with old accountId`);

    // 2. Delete subscriptions with old account names
    const sub1 = await Subscription.deleteMany({ accountId: 'eno_2600003' });
    console.log(`✅ Deleted ${sub1.deletedCount} subscriptions with eno_2600003`);

    const sub2 = await Subscription.deleteMany({ accountId: 'pixels_internal' });
    console.log(`✅ Deleted ${sub2.deletedCount} subscriptions with pixels_internal`);

    // 3. Delete payment with ObjectId format
    const pay1 = await Payment.deleteMany({ accountId: '6974512b1a58120a716b6437' });
    console.log(`✅ Deleted ${pay1.deletedCount} payments with ObjectId format`);

    console.log('\n✅ Final cleanup complete!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

finalCleanup();
