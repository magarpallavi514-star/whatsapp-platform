import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function checkAccount() {
  try {
    console.log('\n🔍 ACCOUNT 2600001 DETAILED CHECK\n');
    console.log('='.repeat(70));
    
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    
    const account = await db.collection('accounts').findOne({ accountId: '2600001' });
    
    if (!account) {
      console.log('❌ Account 2600001 NOT FOUND');
      await mongoose.connection.close();
      process.exit(0);
    }
    
    console.log('\n📊 Account Details:');
    console.log('─'.repeat(70));
    console.log('Account ID:', account.accountId);
    console.log('Account _id:', account._id);
    console.log('Name:', account.name);
    console.log('Email:', account.email);
    console.log('WABA ID:', account.wabaId || '❌ NONE');
    console.log('Business ID:', account.businessId || '❌ NONE');
    console.log('Created:', account.createdAt);
    console.log('Updated:', account.updatedAt);
    
    const phones = await db.collection('phonenumbers').find({ accountId: '2600001' }).toArray();
    
    console.log('\n📱 Phone Numbers:');
    console.log('─'.repeat(70));
    console.log('Total:', phones.length);
    
    if (phones.length > 0) {
      phones.forEach(p => {
        console.log(`\n${p.displayPhone || p.phoneNumberId}`);
        console.log('  WABA:', p.wabaId);
        console.log('  Active:', p.isActive ? '✅' : '❌');
        console.log('  Phone ID:', p.phoneNumberId);
      });
    } else {
      console.log('❌ NO PHONES LINKED');
    }
    
    console.log('\n' + '='.repeat(70) + '\n');
    
    await mongoose.connection.close();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkAccount();
