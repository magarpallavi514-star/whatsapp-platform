import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const phoneNumberSchema = new mongoose.Schema({}, { strict: false });
const broadcastSchema = new mongoose.Schema({}, { strict: false });
const PhoneNumber = mongoose.model('PhoneNumber', phoneNumberSchema);
const Broadcast = mongoose.model('Broadcast', broadcastSchema);

async function fixAccountMismatch() {
  try {
    console.log('🔧 FIXING BROADCAST ACCOUNT MISMATCH\n');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get the correct user account ID
    const userAccountId = '695a15a5c526dbe7c085ece2';
    const phoneNumberId = '889344924259692';

    console.log('📋 BEFORE FIX:');
    console.log('━'.repeat(50));
    
    // Check current state
    const oldPhone = await PhoneNumber.findOne({ phoneNumberId });
    const oldBroadcasts = await Broadcast.find({ phoneNumberId });
    
    console.log(`Phone Number Account: ${oldPhone?.accountId || 'NONE'}`);
    console.log(`Broadcasts Count: ${oldBroadcasts.length}`);
    console.log(`Broadcasts Account IDs: ${[...new Set(oldBroadcasts.map(b => b.accountId))].join(', ')}`);
    console.log('');

    // FIX 1: Update phone number to correct account
    console.log('🔄 FIX 1: Updating phone number account...');
    const phoneResult = await PhoneNumber.updateOne(
      { phoneNumberId },
      { $set: { accountId: userAccountId } }
    );
    console.log(`   ✅ Modified: ${phoneResult.modifiedCount} phone number(s)\n`);

    // FIX 2: Update all broadcasts to correct account
    console.log('🔄 FIX 2: Updating broadcasts to correct account...');
    const broadcastResult = await Broadcast.updateMany(
      { phoneNumberId },
      { $set: { accountId: userAccountId } }
    );
    console.log(`   ✅ Modified: ${broadcastResult.modifiedCount} broadcast(s)\n`);

    // VERIFY FIX
    console.log('📋 AFTER FIX:');
    console.log('━'.repeat(50));
    
    const newPhone = await PhoneNumber.findOne({ phoneNumberId });
    const newBroadcasts = await Broadcast.find({ phoneNumberId });
    
    console.log(`Phone Number Account: ${newPhone?.accountId || 'NONE'}`);
    console.log(`Phone is Active: ${newPhone?.isActive}`);
    console.log(`Has Access Token: ${newPhone?.accessToken ? '✅ Yes' : '❌ No'}`);
    console.log(`Broadcasts Count: ${newBroadcasts.length}`);
    console.log(`All broadcasts now in correct account: ${newBroadcasts.every(b => b.accountId === userAccountId) ? '✅ YES' : '❌ NO'}\n`);

    console.log('✅ ACCOUNT MISMATCH FIXED!\n');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

fixAccountMismatch();
