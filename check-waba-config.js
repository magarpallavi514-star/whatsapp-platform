#!/usr/bin/env node

const mongoose = require('mongoose');
require('dotenv').config();

const accountSchema = new mongoose.Schema({
  accountId: String,
  name: String,
  company: String,
  email: String,
  wabaId: String,
  role: String
});

const phoneNumberSchema = new mongoose.Schema({
  accountId: String,
  phoneNumberId: String,
  wabaId: String,
  isActive: Boolean,
  createdAt: Date
});

const Account = mongoose.model('Account', accountSchema);
const PhoneNumber = mongoose.model('PhoneNumber', phoneNumberSchema);

async function checkWabaConfig() {
  try {
    console.log('🔍 Checking WABA Configuration...\n');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB\n');

    // Check .env WABA config
    console.log('📋 .ENV CONFIGURATION:');
    console.log(`   WHATSAPP_APP_ID: ${process.env.WHATSAPP_APP_ID || '❌ NOT SET'}`);
    console.log(`   WHATSAPP_ACCESS_TOKEN: ${process.env.WHATSAPP_ACCESS_TOKEN ? '✅ SET' : '❌ NOT SET'}`);
    console.log(`   WHATSAPP_PHONE_NUMBER_ID: ${process.env.WHATSAPP_PHONE_NUMBER_ID || '❌ COMMENTED OUT (this is correct - use dashboard)'}`);
    console.log(`   WHATSAPP_BUSINESS_ACCOUNT_ID: ${process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '❌ COMMENTED OUT (this is correct - use dashboard)'}\n`);

    // Check database accounts
    console.log('🏢 ACCOUNTS IN DATABASE:');
    const accounts = await Account.find({}).select('accountId name company email wabaId role');
    
    if (accounts.length === 0) {
      console.log('   ❌ No accounts found\n');
    } else {
      accounts.forEach((acc, idx) => {
        console.log(`   ${idx + 1}. Account ID: ${acc.accountId}`);
        console.log(`      Name: ${acc.name || 'N/A'}`);
        console.log(`      Company: ${acc.company || 'N/A'}`);
        console.log(`      Email: ${acc.email}`);
        console.log(`      Role: ${acc.role}`);
        console.log(`      WABA ID: ${acc.wabaId ? `✅ ${acc.wabaId}` : '❌ NOT SET'}\n`);
      });
    }

    // Check phone numbers
    console.log('📱 PHONE NUMBERS CONFIGURED:');
    const phones = await PhoneNumber.find({});
    
    if (phones.length === 0) {
      console.log('   ❌ No phone numbers connected\n');
    } else {
      phones.forEach((phone, idx) => {
        console.log(`   ${idx + 1}. Phone Number ID: ${phone.phoneNumberId}`);
        console.log(`      Account ID: ${phone.accountId}`);
        console.log(`      WABA ID: ${phone.wabaId}`);
        console.log(`      Active: ${phone.isActive ? '✅ Yes' : '❌ No'}\n`);
      });
    }

    // Diagnosis
    console.log('🔧 DIAGNOSIS:');
    
    let hasIssues = false;

    if (!process.env.WHATSAPP_APP_ID) {
      console.log('   ❌ WHATSAPP_APP_ID is not set in .env');
      hasIssues = true;
    } else {
      console.log(`   ✅ WHATSAPP_APP_ID is set (${process.env.WHATSAPP_APP_ID})`);
    }

    if (!process.env.WHATSAPP_ACCESS_TOKEN) {
      console.log('   ❌ WHATSAPP_ACCESS_TOKEN is not set in .env');
      hasIssues = true;
    } else {
      console.log('   ✅ WHATSAPP_ACCESS_TOKEN is set');
    }

    const accountsWithWaba = accounts.filter(a => a.wabaId);
    if (accountsWithWaba.length === 0) {
      console.log('   ⚠️  No accounts have WABA ID - you need to set them in database');
      hasIssues = true;
    } else {
      console.log(`   ✅ ${accountsWithWaba.length} account(s) have WABA ID configured`);
    }

    if (phones.length === 0) {
      console.log('   ⚠️  No phone numbers connected - add via dashboard');
      hasIssues = true;
    } else {
      const activePhones = phones.filter(p => p.isActive);
      console.log(`   ✅ ${phones.length} phone number(s) configured, ${activePhones.length} active`);
    }

    if (!hasIssues) {
      console.log('   ✅ All WABA configuration looks good!\n');
    } else {
      console.log('\n⚠️  ISSUES FOUND - See fixes below:\n');
      
      if (!process.env.WHATSAPP_APP_ID) {
        console.log('   FIX: Add WHATSAPP_APP_ID to .env (provided by Meta)');
      }
      
      if (accountsWithWaba.length === 0) {
        console.log('   FIX: For each account, update database:');
        console.log('   db.accounts.updateOne({ accountId: "YOUR_ACCOUNT_ID" }, { $set: { wabaId: "YOUR_WABA_ID" } })');
      }
      
      if (phones.length === 0) {
        console.log('   FIX: Connect phone numbers via dashboard:');
        console.log('   1. Go to http://localhost:3000/dashboard/settings');
        console.log('   2. Click "Add Phone Number"');
        console.log('   3. Paste Phone Number ID, WABA ID, Access Token');
      }
      console.log();
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkWabaConfig();
