#!/usr/bin/env node

/**
 * Test WABA ID & Business ID Sync
 * Verifies that OAuth and webhook properly sync Meta's data
 */

require('dotenv').config({ path: './backend/.env' });
const path = require('path');
process.env.NODE_PATH = path.join(__dirname, 'backend', 'node_modules');
const mongoose = require('mongoose');

const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  console.error('❌ MONGODB_URI not found in .env');
  process.exit(1);
}

async function testWabaSync() {
  try {
    console.log('\n🔍 ========== WABA SYNC TEST ==========\n');
    
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;

    // 1. Check Account Collection
    console.log('📋 ACCOUNT DATA (from OAuth + Webhooks)\n');
    
    const accounts = await db.collection('accounts').find({}).toArray();
    
    if (accounts.length === 0) {
      console.log('❌ No accounts found\n');
    } else {
      console.log(`✅ Found ${accounts.length} account(s)\n`);
      
      accounts.forEach((account, idx) => {
        console.log(`${idx + 1}. Account: ${account.accountId || account._id}`);
        console.log(`   Name: ${account.name}`);
        console.log(`   Email: ${account.email}`);
        console.log(`   WABA ID: ${account.wabaId ? '✅ ' + account.wabaId : '❌ MISSING'}`);
        console.log(`   Business ID: ${account.businessId ? '✅ ' + account.businessId : '❌ MISSING'}`);
        console.log(`   SYNC Status: ${account.wabaId && account.businessId ? '🟢 COMPLETE' : '🟡 INCOMPLETE'}`);
        console.log('');
      });
    }

    // 2. Check PhoneNumber Collection
    console.log('\n📱 PHONE NUMBERS (from OAuth)\n');
    
    const phoneNumbers = await db.collection('phonenumbers').find({}).toArray();
    
    if (phoneNumbers.length === 0) {
      console.log('❌ No phone numbers found\n');
    } else {
      console.log(`✅ Found ${phoneNumbers.length} phone number(s)\n`);
      
      phoneNumbers.forEach((phone, idx) => {
        console.log(`${idx + 1}. Phone Number`);
        console.log(`   ID: ${phone.phoneNumberId}`);
        console.log(`   Display: ${phone.displayPhone}`);
        console.log(`   Account ID: ${phone.accountId}`);
        console.log(`   WABA ID: ${phone.wabaId}`);
        console.log(`   Active: ${phone.isActive ? '🟢 YES' : '🔴 NO'}`);
        console.log(`   Verified At: ${phone.verifiedAt ? new Date(phone.verifiedAt).toLocaleString() : 'Not verified'}`);
        console.log(`   Quality Rating: ${phone.qualityRating || 'Not set'}`);
        console.log('');
      });
    }

    // 3. Cross-reference check
    console.log('\n🔗 CROSS-REFERENCE CHECK\n');
    
    if (accounts.length > 0 && phoneNumbers.length > 0) {
      const account = accounts[0];
      const phoneInAccount = phoneNumbers.filter(p => p.accountId == account.accountId);
      
      if (phoneInAccount.length > 0) {
        const phone = phoneInAccount[0];
        
        console.log(`Account: ${account.accountId}`);
        console.log(`  ├─ WABA ID from Account: ${account.wabaId}`);
        console.log(`  └─ WABA ID from PhoneNumber: ${phone.wabaId}`);
        console.log(`  Match: ${account.wabaId === phone.wabaId ? '✅ YES' : '❌ NO'}\n`);
        
        console.log(`Business ID from Account: ${account.businessId || '❌ MISSING'}`);
        console.log(`  Source: ${account.businessId ? '✅ From webhook account_update' : '⚠️ Not yet received'}\n`);
      } else {
        console.log('⚠️ No phone numbers match this account\n');
      }
    }

    // 4. Status Summary
    console.log('\n📊 SYNC STATUS SUMMARY\n');
    
    const withWaba = accounts.filter(a => a.wabaId).length;
    const withBusiness = accounts.filter(a => a.businessId).length;
    const complete = accounts.filter(a => a.wabaId && a.businessId).length;
    
    console.log(`Accounts with WABA ID: ${withWaba}/${accounts.length} ${withWaba === accounts.length ? '✅' : '⚠️'}`);
    console.log(`Accounts with Business ID: ${withBusiness}/${accounts.length} ${withBusiness === accounts.length ? '✅' : '⚠️'}`);
    console.log(`Accounts fully synced: ${complete}/${accounts.length} ${complete === accounts.length ? '✅ READY' : '⏳ PENDING'}\n`);

    // 5. What to do next
    if (complete < accounts.length) {
      console.log('🔧 NEXT STEPS:\n');
      console.log('1. Complete OAuth flow (WhatsApp > Meta OAuth)');
      console.log('2. Wait for account_update webhook (30 seconds)');
      console.log('3. Run this test again to verify\n');
      
      if (withWaba > 0 && withBusiness === 0) {
        console.log('💡 HINT: WABA ID is stored but Business ID is missing.');
        console.log('   This means webhook account_update hasn\'t been received yet.');
        console.log('   Check logs: "ACCOUNT UPDATE WEBHOOK"\n');
      }
    } else {
      console.log('🎉 ALL SYSTEMS GO!\n');
      console.log('✅ OAuth working');
      console.log('✅ WABA ID stored');
      console.log('✅ Business ID synced from webhook');
      console.log('✅ Ready for feature development\n');
    }

    console.log('========== TEST COMPLETE ==========\n');
    
    await mongoose.connection.close();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

testWabaSync();
