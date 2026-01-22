#!/usr/bin/env node
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const accountSchema = new mongoose.Schema({}, { strict: false });
const Account = mongoose.model('Account', accountSchema, 'accounts');

const phoneSchema = new mongoose.Schema({}, { strict: false });
const PhoneNumber = mongoose.model('PhoneNumber', phoneSchema, 'phonenumbers');

const subscriptionSchema = new mongoose.Schema({}, { strict: false });
const Subscription = mongoose.model('Subscription', subscriptionSchema, 'subscriptions');

async function diagnosticCheck() {
  try {
    console.log('🔍 DATABASE DIAGNOSTIC CHECK');
    console.log('═'.repeat(70));
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check Accounts
    console.log('📋 ACCOUNTS:');
    console.log('─'.repeat(70));
    const accounts = await Account.find().lean();
    console.log(`Total accounts: ${accounts.length}\n`);
    
    accounts.forEach((acc, i) => {
      console.log(`${i + 1}. ${acc.name || 'Unknown'}`);
      console.log(`   _id: ${acc._id}`);
      console.log(`   accountId: ${acc.accountId}`);
      console.log(`   email: ${acc.email}`);
      console.log(`   type: ${acc.type || 'N/A'}`);
      console.log(`   plan: ${acc.plan || 'N/A'}`);
      console.log();
    });

    // Check Phone Numbers
    console.log('\n📱 PHONE NUMBERS:');
    console.log('─'.repeat(70));
    const phones = await PhoneNumber.find().lean();
    console.log(`Total phones: ${phones.length}\n`);
    
    phones.forEach((phone, i) => {
      const accountName = accounts.find(a => a._id.toString() === phone.accountId?.toString())?.name || 'Unknown Account';
      console.log(`${i + 1}. ${phone.phoneNumber || phone.phoneNumberId}`);
      console.log(`   Account: ${accountName}`);
      console.log(`   phoneNumberId: ${phone.phoneNumberId}`);
      console.log(`   isActive: ${phone.isActive}`);
      console.log(`   status: ${phone.status || 'N/A'}`);
      console.log();
    });

    // Check Subscriptions
    console.log('\n📦 SUBSCRIPTIONS:');
    console.log('─'.repeat(70));
    const subscriptions = await Subscription.find().lean();
    console.log(`Total subscriptions: ${subscriptions.length}\n`);
    
    subscriptions.forEach((sub, i) => {
      const accountName = accounts.find(a => a._id.toString() === sub.accountId?.toString())?.name || 'Unknown Account';
      console.log(`${i + 1}. ${accountName}`);
      console.log(`   status: ${sub.status}`);
      console.log(`   plan: ${sub.plan || 'N/A'}`);
      console.log(`   expiresAt: ${sub.expiresAt ? new Date(sub.expiresAt).toLocaleDateString() : 'N/A'}`);
      console.log();
    });

    // Summary
    console.log('\n📊 SUMMARY:');
    console.log('─'.repeat(70));
    const enromatics = accounts.find(a => a.name?.toLowerCase() === 'enromatics');
    if (enromatics) {
      console.log('✅ ENROMATICS ACCOUNT EXISTS');
      console.log(`   _id: ${enromatics._id}`);
      console.log(`   accountId: ${enromatics.accountId}`);
      console.log(`   email: ${enromatics.email}`);
      
      const enromaticsPhones = phones.filter(p => p.accountId?.toString() === enromatics._id.toString());
      console.log(`   Phones: ${enromaticsPhones.length}`);
      enromaticsPhones.forEach(p => {
        console.log(`     - ${p.phoneNumber} (${p.phoneNumberId})`);
      });

      const enroSub = subscriptions.find(s => s.accountId?.toString() === enromatics._id.toString());
      if (enroSub) {
        console.log(`   Subscription: ${enroSub.status} ${enroSub.plan} plan`);
      } else {
        console.log('   Subscription: ❌ MISSING');
      }
    } else {
      console.log('❌ ENROMATICS ACCOUNT NOT FOUND!');
      console.log('\nAvailable accounts:');
      accounts.forEach(a => console.log(`  - ${a.name} (${a.email})`));
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

diagnosticCheck();
