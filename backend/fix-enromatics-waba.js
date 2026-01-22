import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function fixEnromaticsWABA() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;
    
    // Find and delete the malformed WABA (with string accountId)
    const result = await db.collection('phonenumbers').deleteOne({
      accountId: 'eno_2600003'  // Delete WABA with string accountId
    });

    if (result.deletedCount > 0) {
      console.log('✅ Deleted malformed WABA:');
      console.log('   - Phone ID: 1003427786179738');
      console.log('   - Account ID (wrong): eno_2600003\n');
    } else {
      console.log('⚠️ No malformed WABA found');
    }

    // Show remaining WABAs for Enromatics
    const enromatics = await db.collection('accounts').findOne({
      email: 'info@enromatics.com'
    });

    if (enromatics) {
      console.log('Remaining WABAs for Enromatics:');
      const phones = await db.collection('phonenumbers').find({
        accountId: enromatics._id
      }).toArray();

      if (phones.length === 0) {
        console.log('❌ NO WABAs REMAINING');
      } else {
        phones.forEach((p, i) => {
          console.log(`\n${i + 1}. Phone ID: ${p.phoneNumberId}`);
          console.log(`   WABA ID: ${p.wabaId}`);
          console.log(`   Display Name: ${p.displayName}`);
          console.log(`   Phone: ${p.phoneNumber}`);
          console.log(`   Active: ${p.isActive}`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Done');
    process.exit(0);
  }
}

fixEnromaticsWABA();
