import 'dotenv/config.js';
import mongoose from 'mongoose';
import PhoneNumber from './src/models/PhoneNumber.js';
import Broadcast from './src/models/Broadcast.js';
import Account from './src/models/Account.js';

async function checkBroadcastConfig() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all accounts
    const accounts = await Account.find().limit(3);
    console.log(`📊 Found ${accounts.length} accounts\n`);

    for (const account of accounts) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`Account: ${account._id}`);
      console.log(`${'='.repeat(60)}`);

      // Get all phone numbers for this account
      const phones = await PhoneNumber.find({ accountId: account._id });
      console.log(`\n📱 Phone Numbers (${phones.length} total):`);
      phones.forEach(phone => {
        console.log(`  - ID: ${phone.phoneNumberId}`);
        console.log(`    Display: ${phone.displayPhoneNumber}`);
        console.log(`    Active: ${phone.isActive}`);
        console.log(`    WABA ID: ${phone.wabaId}`);
      });

      // Get active phone
      const activePhone = await PhoneNumber.findOne({ 
        accountId: account._id, 
        isActive: true 
      });
      
      if (activePhone) {
        console.log(`\n✅ Active Phone: ${activePhone.phoneNumberId} (${activePhone.displayPhoneNumber})`);
      } else {
        console.log(`\n⚠️  No active phone found for this account!`);
      }

      // Get broadcasts for this account
      const broadcasts = await Broadcast.find({ accountId: account._id }).sort({ createdAt: -1 }).limit(5);
      console.log(`\n📢 Recent Broadcasts (${broadcasts.length} shown):`);
      broadcasts.forEach((b, idx) => {
        console.log(`  [${idx + 1}] ${b.title}`);
        console.log(`      ID: ${b._id}`);
        console.log(`      Phone ID: ${b.phoneNumberId}`);
        console.log(`      Recipients: ${b.recipients.length}`);
        console.log(`      Status: ${b.status}`);
        console.log(`      Stats: sent=${b.stats.sent}, delivered=${b.stats.delivered}`);
      });

      // Check if broadcast phoneNumberId matches active phone
      if (activePhone && broadcasts.length > 0) {
        const broadcast = broadcasts[0];
        console.log(`\n🔍 Phone ID Matching:`);
        console.log(`  Broadcast using: ${broadcast.phoneNumberId}`);
        console.log(`  Active phone is: ${activePhone.phoneNumberId}`);
        console.log(`  Match: ${broadcast.phoneNumberId === activePhone.phoneNumberId ? '✅ YES' : '❌ NO'}`);
      }
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log('✅ Diagnostic complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkBroadcastConfig();
