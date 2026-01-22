import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Account from './src/models/Account.js';
import PhoneNumber from './src/models/PhoneNumber.js';

dotenv.config();

async function checkDuplicateWABA() {
  try {
    console.log('🔐 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected\n');

    const phoneNumberId = '1003427786179738';

    console.log('🔍 Checking for duplicate WABA records');
    console.log('='.repeat(60));
    console.log('Phone Number ID:', phoneNumberId);

    // Check global (across all accounts)
    const allRecords = await PhoneNumber.find({ phoneNumberId });
    console.log(`\n📊 Found ${allRecords.length} record(s) globally:\n`);
    
    allRecords.forEach((record, i) => {
      console.log(`${i+1}. Account: ${record.accountId}`);
      console.log(`   Display: ${record.displayName}`);
      console.log(`   Active: ${record.isActive ? '✅' : '❌'}`);
      console.log(`   Created: ${record.createdAt?.toLocaleDateString()}`);
      console.log('');
    });

    // Check for Enromatics
    const enromatics = await Account.findOne({ email: 'info@enromatics.com' });
    if (enromatics) {
      console.log('='.repeat(60));
      console.log('📱 Enromatics Account Check:');
      console.log(`Account ID: ${enromatics.accountId}`);
      
      const enroWABA = await PhoneNumber.findOne({
        accountId: enromatics.accountId,
        phoneNumberId
      });
      
      if (enroWABA) {
        console.log('✅ WABA already exists for Enromatics');
        console.log(`  Display: ${enroWABA.displayName}`);
        console.log(`  Active: ${enroWABA.isActive ? '✅' : '❌'}`);
        console.log('\n🗑️ Deleting duplicate...');
        await PhoneNumber.deleteOne({ _id: enroWABA._id });
        console.log('✅ Deleted! Now try adding via Settings again');
      } else {
        console.log('❌ No WABA found for Enromatics with this phone ID');
      }
    }

    console.log('\n' + '='.repeat(60) + '\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

checkDuplicateWABA();
