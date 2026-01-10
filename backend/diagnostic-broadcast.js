import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const phoneNumberSchema = new mongoose.Schema({}, { strict: false });
const PhoneNumber = mongoose.model('PhoneNumber', phoneNumberSchema);

const broadcastSchema = new mongoose.Schema({}, { strict: false });
const Broadcast = mongoose.model('Broadcast', broadcastSchema);

const accountSchema = new mongoose.Schema({}, { strict: false });
const Account = mongoose.model('Account', accountSchema);

async function debugBroadcast() {
  try {
    console.log('🔍 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected\n');

    // 1. Check Accounts
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('1️⃣  ACCOUNTS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const accounts = await Account.find({}).limit(3);
    if (accounts.length === 0) {
      console.log('❌ No accounts found\n');
    } else {
      accounts.forEach(acc => {
        console.log(`Account ID: ${acc._id}`);
        console.log(`Name: ${acc.name}`);
        console.log(`Phone Numbers: ${acc.phoneNumbers?.length || 0}`);
        console.log('');
      });
    }

    // 2. Check Phone Numbers
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('2️⃣  PHONE NUMBERS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const phones = await PhoneNumber.find({});
    if (phones.length === 0) {
      console.log('❌ No phone numbers configured\n');
    } else {
      phones.forEach((p, i) => {
        console.log(`${i + 1}. Phone Number ID: ${p.phoneNumberId}`);
        console.log(`   Account ID: ${p.accountId}`);
        console.log(`   Phone: ${p.phone}`);
        console.log(`   Active: ${p.isActive}`);
        console.log(`   Token Encrypted: ${p.accessToken ? '✅ Yes' : '❌ No'}`);
        console.log(`   Created: ${new Date(p.createdAt).toLocaleString()}`);
        console.log('');
      });
    }

    // 3. Check Recent Broadcasts
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('3️⃣  RECENT BROADCASTS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const broadcasts = await Broadcast.find({}).sort({ createdAt: -1 }).limit(5);
    if (broadcasts.length === 0) {
      console.log('❌ No broadcasts found\n');
    } else {
      broadcasts.forEach((b, i) => {
        console.log(`${i + 1}. ${b.name}`);
        console.log(`   ID: ${b._id}`);
        console.log(`   Account ID: ${b.accountId}`);
        console.log(`   Phone Number ID: ${b.phoneNumberId}`);
        console.log(`   Status: ${b.status}`);
        console.log(`   Recipients: ${b.recipientList}`);
        console.log(`   Recipient Count: ${b.recipients?.phoneNumbers?.length || 0}`);
        console.log(`   Stats: Sent=${b.stats?.sent || 0}, Failed=${b.stats?.failed || 0}`);
        console.log(`   Created: ${new Date(b.createdAt).toLocaleString()}`);
        console.log('');
      });
    }

    // 4. Test: Find mismatch
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('4️⃣  MISMATCH CHECK');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    if (broadcasts.length > 0 && phones.length > 0) {
      const latestBroadcast = broadcasts[0];
      const matchingPhone = phones.find(
        p => p.phoneNumberId === latestBroadcast.phoneNumberId && 
             p.accountId === latestBroadcast.accountId
      );

      if (matchingPhone) {
        console.log(`✅ Latest broadcast phone config FOUND`);
        console.log(`   Phone is Active: ${matchingPhone.isActive}`);
        console.log(`   Has Token: ${matchingPhone.accessToken ? 'Yes' : 'No'}`);
      } else {
        console.log(`❌ Latest broadcast phone config NOT FOUND`);
        console.log(`   Looking for: ID=${latestBroadcast.phoneNumberId}, Account=${latestBroadcast.accountId}`);
        console.log(`   Available phone IDs: ${phones.map(p => p.phoneNumberId).join(', ')}`);
      }
    }

    console.log('\n✅ Diagnostic complete\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

debugBroadcast();
