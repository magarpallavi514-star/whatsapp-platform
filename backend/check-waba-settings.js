import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function checkWABASettings() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all accounts
    const db = mongoose.connection.db;
    const accounts = await db.collection('accounts').find({}).toArray();
    
    console.log('📋 ALL ACCOUNTS:\n');
    for (const account of accounts) {
      console.log(`Account: ${account.name || 'N/A'}`);
      console.log(`  Email: ${account.email}`);
      console.log(`  Type: ${account.type}`);
      console.log(`  ID: ${account._id}`);
      console.log(`  String ID: ${account.accountId || 'none'}\n`);
    }

    // Check phone numbers for each account
    console.log('\n📱 WABA CONNECTIONS (from PhoneNumber collection):\n');
    
    const phoneNumbers = await db.collection('phonenumbers').find({}).toArray();
    
    if (phoneNumbers.length === 0) {
      console.log('❌ NO PHONE NUMBERS CONFIGURED IN ANY ACCOUNT');
    } else {
      for (const phone of phoneNumbers) {
        // Find which account this belongs to
        const account = accounts.find(a => a._id.toString() === phone.accountId.toString());
        
        console.log(`📌 Phone Number Found:`);
        console.log(`  Account: ${account ? account.name : 'UNKNOWN'}`);
        console.log(`  Account Email: ${account ? account.email : 'UNKNOWN'}`);
        console.log(`  Account ID (MongoDB): ${phone.accountId}`);
        console.log(`  Phone Number ID: ${phone.phoneNumberId}`);
        console.log(`  WABA ID: ${phone.wabaId || 'N/A'}`);
        console.log(`  Display Name: ${phone.displayName || 'N/A'}`);
        console.log(`  Phone Number: ${phone.phoneNumber || 'N/A'}`);
        console.log(`  Is Active: ${phone.isActive}`);
        console.log(`  Created At: ${phone.createdAt}\n`);
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 SUMMARY:');
    console.log('='.repeat(60));
    
    for (const account of accounts) {
      const hasPhone = phoneNumbers.some(p => p.accountId.toString() === account._id.toString());
      const status = hasPhone ? '✅ WABA Connected' : '❌ NO WABA';
      console.log(`${account.name || 'Unknown'} (${account.email}): ${status}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    process.exit(0);
  }
}

checkWABASettings();
