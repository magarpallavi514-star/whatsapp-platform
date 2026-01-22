import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function checkUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;

    // Check User collection
    const user = await db.collection('users').findOne({ email: 'info@enromatics.com' });
    
    if (user) {
      console.log('🔍 Enromatics User:');
      console.log(`  Email: ${user.email}`);
      console.log(`  AccountId in User: "${user.accountId}"`);
      console.log(`  Name: ${user.name}`);
    } else {
      console.log('❌ User not found');
    }

    // Check Account collection
    const account = await db.collection('accounts').findOne({ email: 'info@enromatics.com' });
    
    if (account) {
      console.log('\n🏢 Enromatics Account:');
      console.log(`  Email: ${account.email}`);
      console.log(`  AccountId in Account: "${account.accountId}"`);
      console.log(`  Name: ${account.name}`);
    } else {
      console.log('\n❌ Account not found');
    }

    console.log('\n🔗 Connection Issue:');
    if (user && account) {
      if (user.accountId === account.accountId) {
        console.log('  ✅ Both use same accountId');
      } else {
        console.log(`  ❌ MISMATCH!`);
        console.log(`     User has: "${user.accountId}"`);
        console.log(`     Account has: "${account.accountId}"`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

checkUser();
