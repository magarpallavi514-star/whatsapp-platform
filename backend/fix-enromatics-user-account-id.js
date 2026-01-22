import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function fixAccountId() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;

    // Update User's accountId to match Account
    const result = await db.collection('users').updateOne(
      { email: 'info@enromatics.com' },
      { $set: { accountId: 'eno_2600003' } }
    );

    console.log('📝 Updating Enromatics User accountId:');
    console.log(`  From: "2600003"`);
    console.log(`  To: "eno_2600003"`);
    console.log(`  Updated: ${result.modifiedCount} document(s)\n`);

    // Verify
    const user = await db.collection('users').findOne({ email: 'info@enromatics.com' });
    const account = await db.collection('accounts').findOne({ email: 'info@enromatics.com' });

    console.log('✅ After Fix:');
    console.log(`  User accountId: "${user.accountId}"`);
    console.log(`  Account accountId: "${account.accountId}"`);
    console.log(`  Match: ${user.accountId === account.accountId ? '✅ YES' : '❌ NO'}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

fixAccountId();
