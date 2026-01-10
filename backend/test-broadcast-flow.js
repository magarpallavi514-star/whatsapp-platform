import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const phoneNumberSchema = new mongoose.Schema({}, { strict: false });
const broadcastSchema = new mongoose.Schema({}, { strict: false });
const PhoneNumber = mongoose.model('PhoneNumber', phoneNumberSchema);
const Broadcast = mongoose.model('Broadcast', broadcastSchema);

async function testBroadcastFlow() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('\n🔍 BROADCAST DIAGNOSTIC TEST\n');

    // Get account ID (use first broadcast to find the account)
    const sampleBroadcast = await Broadcast.findOne({}).limit(1);
    if (!sampleBroadcast) {
      console.log('❌ No broadcasts found in database');
      process.exit(0);
    }

    const accountId = sampleBroadcast.accountId;
    console.log(`✅ Testing Account ID: ${accountId}\n`);

    // Check configured phone numbers
    console.log('📱 CONFIGURED PHONE NUMBERS:');
    const phones = await PhoneNumber.find({ accountId });
    if (phones.length === 0) {
      console.log('❌ No phone numbers configured for this account!\n');
    } else {
      phones.forEach((p, i) => {
        console.log(`\n${i + 1}. Phone ID: ${p.phoneNumberId}`);
        console.log(`   Active: ${p.isActive}`);
        console.log(`   Phone: ${p.phone || 'N/A'}`);
        console.log(`   Has Token: ${!!p.accessToken}`);
      });
    }

    // Check active phone number
    const activePhone = await PhoneNumber.findOne({ accountId, isActive: true });
    if (!activePhone) {
      console.log('\n❌ NO ACTIVE PHONE NUMBER CONFIGURED!\n');
    } else {
      console.log(`\n✅ Active Phone ID: ${activePhone.phoneNumberId}\n`);
    }

    // Check recent broadcasts
    console.log('📊 RECENT BROADCASTS:');
    const broadcasts = await Broadcast.find({ accountId }).sort({ createdAt: -1 }).limit(5);
    broadcasts.forEach((b, i) => {
      console.log(`\n${i + 1}. Name: ${b.name}`);
      console.log(`   Status: ${b.status}`);
      console.log(`   Phone ID: ${b.phoneNumberId}`);
      console.log(`   Recipients: ${b.recipientList}`);
      console.log(`   Recipient Count: ${b.recipients?.phoneNumbers?.length || 0}`);
      console.log(`   Stats Sent: ${b.stats?.sent || 0}`);
      if (b.recipients?.phoneNumbers?.length) {
        console.log(`   Sample Number: ${b.recipients.phoneNumbers[0]}`);
      }
    });

    // Check if phone IDs match
    if (broadcasts.length > 0 && activePhone) {
      const broadcast = broadcasts[0];
      console.log('\n🔗 BROADCAST & PHONE MATCHING:');
      console.log(`   Broadcast Phone ID: ${broadcast.phoneNumberId}`);
      console.log(`   Active Phone ID: ${activePhone.phoneNumberId}`);
      if (broadcast.phoneNumberId === activePhone.phoneNumberId) {
        console.log('   ✅ MATCH - Should work!\n');
      } else {
        console.log('   ❌ MISMATCH - Fix needed!\n');
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testBroadcastFlow();
