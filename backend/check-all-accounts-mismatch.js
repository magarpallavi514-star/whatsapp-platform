import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function checkAllAccounts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;

    // Get all users
    const users = await db.collection('users').find({}).toArray();
    const accounts = await db.collection('accounts').find({}).toArray();

    console.log(`📊 Found ${users.length} users and ${accounts.length} accounts\n`);
    console.log('🔍 Checking accountId mismatches:\n');

    let hasErrors = false;

    for (const user of users) {
      const account = accounts.find(a => a.email === user.email);
      
      if (account) {
        const match = user.accountId === account.accountId;
        if (!match) {
          console.log(`❌ ${user.email}:`);
          console.log(`   User:    "${user.accountId}"`);
          console.log(`   Account: "${account.accountId}"`);
          hasErrors = true;
        }
      } else {
        console.log(`⚠️  ${user.email}: No matching account found`);
      }
    }

    if (!hasErrors) {
      console.log('✅ All users have matching accountIds!');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

checkAllAccounts();
