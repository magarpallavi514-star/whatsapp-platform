import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function findDuplicates() {
  try {
    console.log('🔍 Checking for duplicate phoneNumbers...\n');
    
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error('❌ MONGODB_URI not set in .env');
      process.exit(1);
    }

    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;
    const collection = db.collection('phonenumbers');

    // Get all documents
    const docs = await collection.find({}).toArray();
    console.log(`📱 Total phone numbers: ${docs.length}\n`);

    if (docs.length === 0) {
      console.log('✅ No phone numbers in database yet\n');
      await mongoose.disconnect();
      process.exit(0);
    }

    // Group by phoneNumberId
    const groups = {};
    docs.forEach(doc => {
      if (!groups[doc.phoneNumberId]) {
        groups[doc.phoneNumberId] = [];
      }
      groups[doc.phoneNumberId].push(doc);
    });

    // Show duplicates
    let hasDuplicates = false;
    for (const [phoneId, entries] of Object.entries(groups)) {
      if (entries.length > 1) {
        hasDuplicates = true;
        console.log(`⚠️  DUPLICATE: ${phoneId} (${entries.length} entries)\n`);
        
        entries.forEach((entry, idx) => {
          console.log(`   [${idx}] _id: ${entry._id}`);
          console.log(`       accountId: ${entry.accountId}`);
          console.log(`       Created: ${entry.createdAt}`);
        });
        console.log('');
      }
    }

    if (!hasDuplicates) {
      console.log('✅ No duplicates found!\n');
    }

    // List indexes
    console.log('📋 Current indexes:');
    const indexes = await collection.getIndexes();
    Object.entries(indexes).forEach(([name, spec]) => {
      console.log(`   - ${name}:`, JSON.stringify(spec));
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

findDuplicates();
