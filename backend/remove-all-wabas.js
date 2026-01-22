import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function removeAllWABAs() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;
    
    // Get all WABAs before deletion
    const phonesBeforeDelete = await db.collection('phonenumbers').find({}).toArray();
    
    console.log('WABAs to be deleted:');
    phonesBeforeDelete.forEach((p, i) => {
      console.log(`${i + 1}. Phone ID: ${p.phoneNumberId}`);
      console.log(`   WABA ID: ${p.wabaId}`);
      console.log(`   Display: ${p.displayName}`);
      console.log(`   Phone: ${p.phoneNumber}\n`);
    });

    // Delete all phone numbers
    const result = await db.collection('phonenumbers').deleteMany({});

    console.log(`\n✅ DELETED: ${result.deletedCount} WABA(s)`);
    
    // Verify deletion
    const phonesAfterDelete = await db.collection('phonenumbers').find({}).toArray();
    console.log(`✅ Remaining WABAs: ${phonesAfterDelete.length}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Done');
    process.exit(0);
  }
}

removeAllWABAs();
