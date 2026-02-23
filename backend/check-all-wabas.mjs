import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function checkAllWABAs() {
  try {
    console.log('\n🔍 SCANNING ALL WABAS IN SYSTEM\n');
    console.log('='.repeat(70));
    
    await mongoose.connect(process.env.MONGODB_URI);
    
    const db = mongoose.connection.db;
    
    // Get all accounts with WABA ID
    console.log('\n📊 ACCOUNTS WITH WABA IDs:\n');
    console.log('─'.repeat(70));
    
    const accountsWithWABA = await db.collection('accounts')
      .find({ wabaId: { $ne: null, $exists: true } })
      .toArray();
    
    console.log('Found:', accountsWithWABA.length, 'account(s) with WABA\n');
    
    if (accountsWithWABA.length === 0) {
      console.log('❌ NO ACCOUNTS WITH WABA ID!');
    } else {
      accountsWithWABA.forEach(a => {
        console.log(`✅ [${a.accountId}] ${a.name || a.email}`);
        console.log('   WABA ID:', a.wabaId);
        console.log('   Business ID:', a.businessId || '(not set)');
        console.log('   Updated:', new Date(a.updatedAt).toLocaleString());
      });
    }
    
    // Get ALL phone numbers in system
    console.log('\n\n📱 ALL PHONE NUMBERS IN SYSTEM:\n');
    console.log('─'.repeat(70));
    
    const allPhones = await db.collection('phonenumbers')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    
    console.log('Total phones:', allPhones.length, '\n');
    
    if (allPhones.length === 0) {
      console.log('❌ NO PHONE NUMBERS IN SYSTEM!');
    } else {
      // Group by WABA
      const wabaGroups = {};
      allPhones.forEach(p => {
        if (!wabaGroups[p.wabaId]) {
          wabaGroups[p.wabaId] = [];
        }
        wabaGroups[p.wabaId].push(p);
      });
      
      Object.entries(wabaGroups).forEach(([wabaId, phones]) => {
        console.log(`\n🔗 WABA: ${wabaId}`);
        phones.forEach(p => {
          console.log(`   ✅ ${p.displayPhone || p.phoneNumberId}`);
          console.log(`      Account: ${p.accountId}`);
          console.log(`      Active: ${p.isActive ? '✅' : '❌'}`);
          console.log(`      Phone ID: ${p.phoneNumberId}`);
        });
      });
    }
    
    // Summary
    console.log('\n' + '='.repeat(70));
    console.log('📋 SUMMARY:\n');
    
    if (accountsWithWABA.length === 0 && allPhones.length === 0) {
      console.log('🟡 SYSTEM IS EMPTY - Ready for new connection!');
    } else if (accountsWithWABA.length > 0 && allPhones.length > 0) {
      console.log('🟢 SYSTEM HAS ACTIVE WABA CONNECTIONS');
      console.log(`   Accounts with WABA: ${accountsWithWABA.length}`);
      console.log(`   Phone numbers: ${allPhones.length}`);
    } else {
      console.log('🟡 PARTIAL CONNECTION - Missing data');
    }
    
    console.log('\n' + '='.repeat(70) + '\n');
    
    await mongoose.connection.close();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkAllWABAs();
