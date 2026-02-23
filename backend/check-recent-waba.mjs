import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function checkRecentWABA() {
  try {
    console.log('\n🔍 CHECKING RECENTLY ADDED BUSINESS ACCOUNTS\n');
    console.log('='.repeat(70));
    
    await mongoose.connect(process.env.MONGODB_URI);
    
    const db = mongoose.connection.db;
    
    // Check for the webhook WABA ID: 1179018337647970
    console.log('\n📍 Searching for WABA: 1179018337647970 (from webhook)\n');
    console.log('─'.repeat(70));
    
    // Search in accounts
    const accountsWithWABA = await db.collection('accounts')
      .find({ wabaId: '1179018337647970' })
      .toArray();
    
    console.log('In Accounts collection:', accountsWithWABA.length, 'found');
    if (accountsWithWABA.length > 0) {
      accountsWithWABA.forEach(a => {
        console.log('  ✅ Account:', a.accountId, '(' + a.email + ')');
        console.log('     WABA:', a.wabaId);
        console.log('     Business ID:', a.businessId);
      });
    }
    
    // Search in phones
    const phonesWithWABA = await db.collection('phonenumbers')
      .find({ wabaId: '1179018337647970' })
      .toArray();
    
    console.log('\nIn PhoneNumbers collection:', phonesWithWABA.length, 'found');
    if (phonesWithWABA.length > 0) {
      phonesWithWABA.forEach(p => {
        console.log('  ✅ Phone:', p.displayPhone);
        console.log('     Phone ID:', p.phoneNumberId);
        console.log('     Account ID:', p.accountId);
        console.log('     WABA:', p.wabaId);
      });
    }
    
    // Check for Business ID from webhook: 631302064701398
    console.log('\n\n📍 Searching for Business ID: 631302064701398 (from webhook)\n');
    console.log('─'.repeat(70));
    
    const accountsWithBusiness = await db.collection('accounts')
      .find({ businessId: '631302064701398' })
      .toArray();
    
    console.log('In Accounts collection:', accountsWithBusiness.length, 'found');
    if (accountsWithBusiness.length > 0) {
      accountsWithBusiness.forEach(a => {
        console.log('  ✅ Account:', a.accountId, '(' + a.email + ')');
        console.log('     Business ID:', a.businessId);
        console.log('     WABA ID:', a.wabaId);
      });
    }
    
    // Check ALL accounts for your email
    console.log('\n\n📧 All accounts for mpiyush2727@gmail.com\n');
    console.log('─'.repeat(70));
    
    const allAccounts = await db.collection('accounts')
      .find({ email: 'mpiyush2727@gmail.com' })
      .toArray();
    
    console.log('Total accounts:', allAccounts.length);
    allAccounts.forEach(a => {
      console.log(`\n[${a.accountId}] ${a.name}`);
      console.log('   WABA ID:', a.wabaId || '❌ NOT SET');
      console.log('   Business ID:', a.businessId || '❌ NOT SET');
      console.log('   Updated:', a.updatedAt);
      console.log('   MetaSync:', a.metaSync ? '✅' : '❌');
    });
    
    // Check ALL phone numbers for your email's accounts
    console.log('\n\n📱 ALL PHONE NUMBERS\n');
    console.log('─'.repeat(70));
    
    const accountIds = allAccounts.map(a => a.accountId);
    const allPhones = await db.collection('phonenumbers')
      .find({ accountId: { $in: accountIds } })
      .toArray();
    
    console.log('Total phones:', allPhones.length);
    allPhones.forEach(p => {
      console.log(`\n${p.displayPhone || p.phoneNumberId}`);
      console.log('   Account ID:', p.accountId);
      console.log('   WABA ID:', p.wabaId);
      console.log('   Active:', p.isActive ? '✅' : '❌');
      console.log('   Created:', p.createdAt);
    });
    
    console.log('\n' + '='.repeat(70) + '\n');
    
    await mongoose.connection.close();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkRecentWABA();
