/**
 * MIGRATION SCRIPT: Convert PhoneNumber.accountId from ObjectId to String
 * 
 * PROBLEM: PhoneNumber model schema defines accountId as String, but existing records
 *          have ObjectId stored due to settingsController bug
 * 
 * SOLUTION: Convert all ObjectId accountIds to corresponding Account.accountId (String)
 */

import mongoose from 'mongoose';
import Account from './src/models/Account.js';
import PhoneNumber from './src/models/PhoneNumber.js';

async function migratePhoneNumbers() {
  try {
    // MongoDB URI from env
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/pixels-whatsapp';
    
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Get ALL phone numbers
    console.log('📱 Fetching all phone numbers...');
    const allPhones = await PhoneNumber.find().lean();
    console.log(`   Found ${allPhones.length} phone numbers\n`);

    if (allPhones.length === 0) {
      console.log('✅ No phone numbers to migrate');
      return;
    }

    // Categorize by accountId type
    const objectIdPhones = [];
    const stringPhones = [];
    const invalidPhones = [];

    for (const phone of allPhones) {
      if (typeof phone.accountId === 'object' && phone.accountId._bsontype === 'ObjectId') {
        objectIdPhones.push(phone);
      } else if (typeof phone.accountId === 'string') {
        stringPhones.push(phone);
      } else {
        invalidPhones.push(phone);
      }
    }

    console.log('📊 Current state:');
    console.log(`   ✅ String accountIds: ${stringPhones.length}`);
    console.log(`   ⚠️  ObjectId accountIds: ${objectIdPhones.length}`);
    console.log(`   ❌ Invalid accountIds: ${invalidPhones.length}\n`);

    if (objectIdPhones.length === 0) {
      console.log('✅ No ObjectId phone numbers to migrate!');
      await mongoose.disconnect();
      return;
    }

    // Migrate ObjectId to String
    console.log('🔄 Migrating ObjectId to String accountIds...\n');

    let migrated = 0;
    let failed = 0;

    for (const phone of objectIdPhones) {
      try {
        // Look up account by ObjectId
        const account = await Account.findById(phone.accountId);
        
        if (!account) {
          console.log(`❌ [${phone._id}] Account NOT FOUND for ObjectId ${phone.accountId}`);
          failed++;
          continue;
        }

        if (!account.accountId) {
          console.log(`❌ [${phone._id}] Account has no accountId field: ${account._id}`);
          failed++;
          continue;
        }

        // Update phone number with String accountId
        await PhoneNumber.updateOne(
          { _id: phone._id },
          { $set: { accountId: account.accountId } }
        );

        console.log(`✅ [${phone.phoneNumberId}] ${account.name}: ObjectId → "${account.accountId}"`);
        migrated++;
      } catch (error) {
        console.log(`❌ [${phone._id}] Error: ${error.message}`);
        failed++;
      }
    }

    console.log(`\n📊 Migration complete:`);
    console.log(`   ✅ Migrated: ${migrated}`);
    console.log(`   ❌ Failed: ${failed}\n`);

    // Verify
    console.log('🔍 Verifying final state...');
    const finalPhones = await PhoneNumber.find().lean();
    
    let finalStringCount = 0;
    let finalObjectIdCount = 0;

    for (const phone of finalPhones) {
      if (typeof phone.accountId === 'string') {
        finalStringCount++;
      } else if (typeof phone.accountId === 'object' && phone.accountId._bsontype === 'ObjectId') {
        finalObjectIdCount++;
      }
    }

    console.log(`✅ String accountIds: ${finalStringCount}`);
    console.log(`⚠️  ObjectId accountIds: ${finalObjectIdCount}`);

    if (finalObjectIdCount === 0) {
      console.log('\n✅ Migration successful! All phone numbers now use String accountId');
    } else {
      console.log('\n⚠️  Some phone numbers still have ObjectId accountIds');
    }

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
}

migratePhoneNumbers();
