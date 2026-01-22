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

async function fixEnromaticsRelationships() {
  try {
    console.log('🔧 FIXING ENROMATICS RELATIONSHIPS');
    console.log('═'.repeat(70) + '\n');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find Enromatics account
    const enromatics = await Account.findOne({ name: 'Enromatics' });
    if (!enromatics) {
      console.error('❌ Enromatics account not found!');
      process.exit(1);
    }

    console.log(`✅ Found Enromatics: ${enromatics._id}`);
    console.log(`   accountId: ${enromatics.accountId}\n`);

    // Fix Phone Numbers Association
    console.log('📱 FIXING PHONE ASSOCIATIONS...');
    console.log('─'.repeat(70));
    
    const phones = await PhoneNumber.find();
    console.log(`Found ${phones.length} phones\n`);
    
    let phonesFixed = 0;
    for (const phone of phones) {
      console.log(`Checking phone: ${phone.phoneNumber || phone.phoneNumberId}`);
      console.log(`  Current accountId: ${phone.accountId}`);
      
      if (!phone.accountId || phone.accountId.toString() !== enromatics._id.toString()) {
        // Update phone to link to Enromatics
        await PhoneNumber.updateOne(
          { _id: phone._id },
          { $set: { accountId: enromatics._id } }
        );
        phonesFixed++;
        console.log(`  ✅ Updated to: ${enromatics._id}`);
      } else {
        console.log(`  ✅ Already linked`);
      }
      console.log();
    }

    console.log(`\n✅ Fixed ${phonesFixed} phone associations\n`);

    // Fix Subscription Association
    console.log('📦 FIXING SUBSCRIPTION ASSOCIATION...');
    console.log('─'.repeat(70));

    let sub = await Subscription.findOne({ accountId: enromatics._id });
    
    if (!sub) {
      console.log('❌ No subscription found for Enromatics');
      console.log('Creating new subscription...\n');
      
      const newSub = new Subscription({
        accountId: enromatics._id,
        customerId: enromatics._id,
        plan: 'free',
        billingCycle: 'monthly',
        status: 'active',
        amount: 0,
        currency: 'INR',
        startDate: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });
      
      await newSub.save();
      console.log(`✅ Created new subscription for Enromatics\n`);
    } else {
      console.log(`✅ Subscription already exists for Enromatics`);
      console.log(`   Status: ${sub.status}`);
      console.log(`   Plan: ${sub.plan}\n`);
    }

    // Final verification
    console.log('\n✅ VERIFICATION:');
    console.log('─'.repeat(70));
    
    const updatedPhones = await PhoneNumber.find();
    const enromaticsPhones = updatedPhones.filter(p => 
      p.accountId?.toString() === enromatics._id.toString()
    );
    
    const updatedSub = await Subscription.findOne({ accountId: enromatics._id });
    
    console.log(`Enromatics Phones: ${enromaticsPhones.length}`);
    enromaticsPhones.forEach(p => {
      console.log(`  ✅ ${p.phoneNumber || p.phoneNumberId} (${p.phoneNumberId})`);
    });
    
    console.log(`\nEnromatics Subscription: ${updatedSub ? '✅ ACTIVE' : '❌ MISSING'}`);
    if (updatedSub) {
      console.log(`  Status: ${updatedSub.status}`);
      console.log(`  Plan: ${updatedSub.plan}`);
    }

    console.log('\n✨ All Enromatics relationships fixed!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

fixEnromaticsRelationships();
