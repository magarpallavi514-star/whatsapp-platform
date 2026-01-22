import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function cleanupCorruptedWABAs() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;
    
    // Delete ALL phone numbers - nuclear option
    const result = await db.collection('phonenumbers').deleteMany({});

    console.log(`✅ DELETED ALL WABA RECORDS: ${result.deletedCount}`);
    
    // Verify deletion
    const remaining = await db.collection('phonenumbers').find({}).toArray();
    console.log(`✅ Remaining WABAs: ${remaining.length}`);
    
    if (remaining.length === 0) {
      console.log('\n🎉 DATABASE IS CLEAN - ALL WABAS DELETED');
      console.log('Ready to reconnect from frontend!');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Done');
    process.exit(0);
  }
}

cleanupCorruptedWABAs();
