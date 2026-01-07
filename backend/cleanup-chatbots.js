#!/usr/bin/env node
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import KeywordRule from './src/models/KeywordRule.js';
import PhoneNumber from './src/models/PhoneNumber.js';
import Account from './src/models/Account.js';

dotenv.config();

async function cleanup() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database\n');

    // Show current state
    console.log('📊 CURRENT STATE:');
    console.log('═'.repeat(60));
    
    const chatbots = await KeywordRule.find().lean();
    console.log(`\n🤖 Total Chatbot Rules: ${chatbots.length}`);
    if (chatbots.length > 0) {
      chatbots.forEach((bot, i) => {
        console.log(`  ${i+1}. ${bot.name} (${bot._id})`);
        console.log(`     Account: ${bot.accountId}`);
        console.log(`     Phone: ${bot.phoneNumberId}`);
      });
    }

    const phones = await PhoneNumber.find().lean();
    console.log(`\n📱 Total Phone Numbers: ${phones.length}`);
    if (phones.length > 0) {
      phones.forEach((phone, i) => {
        console.log(`  ${i+1}. ${phone.displayPhone} (${phone._id})`);
        console.log(`     Account: ${phone.accountId}`);
        console.log(`     Status: ${phone.isActive ? '✅ Active' : '❌ Inactive'}`);
      });
    }

    // Delete all chatbots (KeywordRules)
    if (chatbots.length > 0) {
      console.log(`\n🗑️  Deleting ${chatbots.length} chatbot rule(s)...`);
      const result = await KeywordRule.deleteMany({});
      console.log(`✅ Deleted ${result.deletedCount} chatbot rule(s)`);
    }

    // Disconnect all phone numbers
    if (phones.length > 0) {
      console.log(`\n🔌 Disconnecting ${phones.length} phone number(s)...`);
      const result = await PhoneNumber.deleteMany({});
      console.log(`✅ Disconnected ${result.deletedCount} phone number(s)`);
    }

    // Show final state
    console.log('\n✅ CLEANUP COMPLETE!');
    console.log('═'.repeat(60));
    
    const finalChatbots = await KeywordRule.find().lean();
    const finalPhones = await PhoneNumber.find().lean();
    
    console.log(`\n📊 FINAL STATE:`);
    console.log(`  Chatbot Rules: ${finalChatbots.length}`);
    console.log(`  Phone Numbers: ${finalPhones.length}`);

    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

cleanup();
