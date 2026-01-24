/**
 * Fix duplicate phoneNumberId issue
 * - Drop old global unique index on phoneNumberId
 * - Show duplicate entries
 * - Allow cleanup of old entries
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const phoneNumberSchema = new mongoose.Schema({
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: true,
    index: true
  },
  phoneNumberId: {
    type: String,
    required: true
  },
  wabaId: String,
  accountId_display: String, // For debugging
  createdAt: Date,
  updatedAt: Date
});

const PhoneNumber = mongoose.model('PhoneNumber', phoneNumberSchema, 'phonenumbers');

async function fixDuplicatePhoneNumbers() {
  try {
    console.log('🔍 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get all phone numbers
    const allPhones = await PhoneNumber.find().populate('accountId', 'name email');
    console.log(`\n📱 Total phone numbers in database: ${allPhones.length}\n`);

    // Find duplicates
    const duplicateMap = new Map();
    allPhones.forEach(phone => {
      if (!duplicateMap.has(phone.phoneNumberId)) {
        duplicateMap.set(phone.phoneNumberId, []);
      }
      duplicateMap.get(phone.phoneNumberId).push(phone);
    });

    // Show duplicates
    let duplicateCount = 0;
    console.log('🔴 DUPLICATE PHONE NUMBERS:\n');
    
    for (const [phoneNumberId, entries] of duplicateMap.entries()) {
      if (entries.length > 1) {
        duplicateCount++;
        console.log(`\n📞 phoneNumberId: ${phoneNumberId}`);
        console.log(`   Appears ${entries.length} times:\n`);
        
        entries.forEach((entry, idx) => {
          console.log(`   [${idx}] _id: ${entry._id}`);
          console.log(`       Account: ${entry.accountId?.name || 'Unknown'} (${entry.accountId?.email || 'N/A'})`);
          console.log(`       Created: ${entry.createdAt?.toISOString() || 'N/A'}`);
          console.log(`       WABA: ${entry.wabaId || 'N/A'}`);
        });
        
        console.log(`\n   ⚠️  RECOMMENDATION: Keep NEWEST (highest _id), delete others`);
      }
    }

    if (duplicateCount === 0) {
      console.log('✅ No duplicate phone numbers found!');
    } else {
      console.log(`\n\n❌ Found ${duplicateCount} duplicate phone number IDs\n`);
      
      console.log('🔧 FIXING DUPLICATES:\n');
      
      // Auto-fix: keep newest, delete older duplicates
      let deleted = 0;
      let errors = 0;
      
      for (const [phoneNumberId, entries] of duplicateMap.entries()) {
        if (entries.length > 1) {
          // Sort by created date, keep newest
          const sorted = entries.sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
          );
          
          const keep = sorted[0];
          const deleteThese = sorted.slice(1);
          
          console.log(`\n   Phone: ${phoneNumberId}`);
          console.log(`   Keeping: ${keep._id} (Account: ${keep.accountId?.name || 'Unknown'})`);
          console.log(`   Deleting: ${deleteThese.length} old entries...`);
          
          for (const oldEntry of deleteThese) {
            try {
              await PhoneNumber.deleteOne({ _id: oldEntry._id });
              console.log(`      ✅ Deleted ${oldEntry._id}`);
              deleted++;
            } catch (err) {
              console.log(`      ❌ Error deleting ${oldEntry._id}: ${err.message}`);
              errors++;
            }
          }
        }
      }
      
      console.log(`\n\n📊 CLEANUP RESULTS:`);
      console.log(`   ✅ Deleted: ${deleted} duplicate entries`);
      console.log(`   ❌ Errors: ${errors}`);
    }

    // Drop old unique index on phoneNumberId
    console.log(`\n🗑️  Dropping old unique index on phoneNumberId...`);
    try {
      const db = mongoose.connection.db;
      const collection = db.collection('phonenumbers');
      const indexes = await collection.getIndexes();
      
      console.log('\n📋 Current indexes:');
      Object.entries(indexes).forEach(([name, spec]) => {
        console.log(`   - ${name}:`, JSON.stringify(spec.key || spec));
      });
      
      // Drop the unique index if it exists
      if (indexes.phoneNumberId_1) {
        await collection.dropIndex('phoneNumberId_1');
        console.log('\n   ✅ Dropped phoneNumberId_1 (global unique index)');
      }
      
      // Ensure compound index exists
      await collection.createIndex({ accountId: 1, phoneNumberId: 1 }, { unique: true });
      console.log('   ✅ Created compound unique index: (accountId, phoneNumberId)');
      
    } catch (err) {
      console.log(`\n   ⚠️  Index management note: ${err.message}`);
    }

    console.log('\n\n✅ PHONE NUMBER FIX COMPLETE!');
    console.log(`\n📝 NEXT STEPS:`);
    console.log(`   1. Test adding phone number again`);
    console.log(`   2. Phone numbers are now unique per account, not globally`);
    console.log(`   3. Different accounts can have same phone number\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

fixDuplicatePhoneNumbers();
