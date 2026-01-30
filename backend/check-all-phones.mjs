#!/usr/bin/env node

/**
 * Check all phone numbers for account
 * See what was connected via OAuth
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const mongoUri = process.env.MONGODB_URI;

async function checkAllPhones() {
  try {
    console.log('\n' + '='.repeat(70));
    console.log('📱 ALL PHONE NUMBERS FOR info@enromatics.com');
    console.log('='.repeat(70) + '\n');
    
    await mongoose.connect(mongoUri);
    const db = mongoose.connection.db;
    
    // Find account
    const account = await db.collection('accounts').findOne({ email: 'info@enromatics.com' });
    
    if (!account) {
      console.log('❌ Account not found\n');
      process.exit(0);
    }
    
    console.log(`Account: ${account.name}`);
    console.log(`Email: ${account.email}`);
    console.log(`Account ID: ${account.accountId}\n`);
    
    // Get ALL phone numbers for this account
    const phones = await db.collection('phonenumbers')
      .find({ accountId: account.accountId })
      .sort({ createdAt: -1 })
      .toArray();
    
    console.log(`Total phone numbers connected: ${phones.length}\n`);
    
    if (phones.length === 0) {
      console.log('❌ No phone numbers found\n');
      process.exit(0);
    }
    
    // Show each phone number
    phones.forEach((phone, idx) => {
      console.log(`${idx + 1}. PHONE NUMBER`);
      console.log(`   ─────────────────────────────────────`);
      console.log(`   Display: ${phone.displayPhone}`);
      console.log(`   Phone ID: ${phone.phoneNumberId}`);
      console.log(`   WABA ID: ${phone.wabaId}`);
      console.log(`   Status: ${phone.isActive ? '🟢 ACTIVE' : '🔴 INACTIVE'}`);
      console.log(`   Quality: ${phone.qualityRating || 'Not set'}`);
      console.log(`   Created: ${phone.createdAt ? new Date(phone.createdAt).toLocaleString() : 'Unknown'}`);
      console.log(`   Updated: ${phone.updatedAt ? new Date(phone.updatedAt).toLocaleString() : 'Unknown'}`);
      console.log(`   Has Token: ${phone.accessToken ? '✅ YES' : '❌ NO'}`);
      console.log('');
    });
    
    // Check which number is the new one
    console.log('\n' + '='.repeat(70));
    console.log('🔍 CHECKING FOR NEW NUMBER: +919766504856\n');
    
    const newPhone = phones.find(p => p.displayPhone.includes('919766504856'));
    
    if (newPhone) {
      console.log('✅ NEW NUMBER FOUND!\n');
      console.log(`   Display: ${newPhone.displayPhone}`);
      console.log(`   Phone ID: ${newPhone.phoneNumberId}`);
      console.log(`   Connected at: ${new Date(newPhone.createdAt).toLocaleString()}`);
      console.log(`   Status: ${newPhone.isActive ? '🟢 ACTIVE' : '🔴 INACTIVE'}\n`);
    } else {
      console.log('❌ NEW NUMBER NOT FOUND\n');
      console.log('What we have instead:\n');
      phones.forEach((p, i) => {
        console.log(`   ${i+1}. ${p.displayPhone} (connected: ${new Date(p.createdAt).toLocaleString()})`);
      });
      console.log('');
    }
    
    // Summary
    console.log('='.repeat(70));
    console.log('\n📊 SUMMARY\n');
    console.log(`Account: ${account.name} (${account.accountId})`);
    console.log(`WABA ID: ${account.wabaId || '❌ NOT SET'}`);
    console.log(`Business ID: ${account.businessId || '⏳ WAITING FOR WEBHOOK'}`);
    console.log(`Phone Numbers: ${phones.length} total`);
    console.log(`New Number (+919766504856): ${newPhone ? '✅ Connected' : '❌ Not connected'}`);
    console.log('\n' + '='.repeat(70) + '\n');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

checkAllPhones();
