import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const phoneNumberSchema = new mongoose.Schema({}, { strict: false });
const broadcastSchema = new mongoose.Schema({}, { strict: false });
const PhoneNumber = mongoose.model('PhoneNumber', phoneNumberSchema);
const Broadcast = mongoose.model('Broadcast', broadcastSchema);

async function debugBroadcast() {
  try {
    console.log('\n🔍 BROADCAST DEBUGGING\n');
    await mongoose.connect(process.env.MONGODB_URI);
    
    // 1. Check all phone numbers
    console.log('📱 PHONE NUMBERS IN DATABASE:');
    const phones = await PhoneNumber.find({});
    if (phones.length === 0) {
      console.log('  ❌ NO PHONE NUMBERS CONFIGURED\n');
    } else {
      phones.forEach((p, i) => {
        console.log(`  ${i + 1}. ID: ${p.phoneNumberId}`);
        console.log(`     Account: ${p.accountId}`);
        console.log(`     Phone: ${p.phone}`);
        console.log(`     Active: ${p.isActive}`);
        console.log(`     Has Token: ${!!p.accessToken}`);
      });
      console.log('');
    }

    // 2. Get latest broadcast
    console.log('📢 LATEST BROADCAST:');
    const latestBroadcast = await Broadcast.findOne({}).sort({ createdAt: -1 });
    if (!latestBroadcast) {
      console.log('  ❌ NO BROADCASTS FOUND\n');
    } else {
      console.log(`  Name: ${latestBroadcast.name}`);
      console.log(`  Phone ID: ${latestBroadcast.phoneNumberId}`);
      console.log(`  Account ID: ${latestBroadcast.accountId}`);
      console.log(`  Status: ${latestBroadcast.status}`);
      console.log(`  Message Type: ${latestBroadcast.messageType}`);
      console.log(`  Recipients Type: ${latestBroadcast.recipientList}`);
      console.log(`  Recipients: ${JSON.stringify(latestBroadcast.recipients)}`);
      console.log(`  Content: ${JSON.stringify(latestBroadcast.content)}`);
      console.log('');

      // 3. Check if phone config matches
      console.log('🔗 PHONE CONFIG LOOKUP:');
      const phoneConfig = await PhoneNumber.findOne({
        phoneNumberId: latestBroadcast.phoneNumberId,
        accountId: latestBroadcast.accountId,
        isActive: true
      });
      
      if (phoneConfig) {
        console.log(`  ✅ FOUND - Phone is configured and active`);
        console.log(`     Phone: ${phoneConfig.phone}`);
        console.log(`     Token Length: ${phoneConfig.accessToken?.length || 0}`);
      } else {
        console.log(`  ❌ NOT FOUND`);
        console.log(`  Looking for:`);
        console.log(`    - phoneNumberId: ${latestBroadcast.phoneNumberId}`);
        console.log(`    - accountId: ${latestBroadcast.accountId}`);
        console.log(`    - isActive: true`);
      }
      console.log('');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

debugBroadcast();
