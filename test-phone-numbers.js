#!/usr/bin/env node

/**
 * Test Connected Phone Numbers
 * Checks database for connected WhatsApp phone numbers
 */

require('dotenv').config({ path: './backend/.env' });
const mongoose = require('mongoose');

const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  console.error('❌ MONGODB_URI not found in .env');
  process.exit(1);
}

async function testPhoneNumbers() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;

    // 1. Check Phone Numbers Collection
    console.log('📱 PHONE NUMBERS');
    console.log('================\n');

    const phoneNumbers = await db.collection('phonenumbers').find({}).toArray();

    if (phoneNumbers.length === 0) {
      console.log('❌ No phone numbers connected yet!\n');
      console.log('   To add phone numbers:');
      console.log('   1. Go to http://localhost:3000/dashboard/settings');
      console.log('   2. Section: "WhatsApp"');
      console.log('   3. Click "Add Phone Number"');
      console.log('   4. Fill in Phone Number ID, WABA ID, Access Token');
      console.log('   5. Click "Add"\n');
    } else {
      console.log(`✅ Found ${phoneNumbers.length} phone number(s):\n`);

      phoneNumbers.forEach((phone, index) => {
        console.log(`${index + 1}. Phone Number Config`);
        console.log(`   📱 Phone Number ID: ${phone.phoneNumberId}`);
        console.log(`   🏢 WABA ID: ${phone.wabaId}`);
        console.log(`   👤 Account ID: ${phone.accountId}`);
        console.log(`   🟢 Active: ${phone.isActive ? 'YES' : 'NO'}`);
        console.log(`   📅 Created: ${phone.createdAt ? new Date(phone.createdAt).toLocaleString() : 'Unknown'}`);
        console.log(`   🔑 Token length: ${phone.accessToken ? 'Present (encrypted)' : 'MISSING'}`);
        console.log('');
      });
    }

    // 2. Check Conversations
    console.log('\n💬 CONVERSATIONS');
    console.log('================\n');

    const conversations = await db.collection('conversations').find({}).countDocuments();
    console.log(`✅ Total conversations: ${conversations}`);

    if (conversations > 0) {
      const recentConv = await db
        .collection('conversations')
        .find({})
        .sort({ lastMessageAt: -1 })
        .limit(3)
        .toArray();

      console.log('\n   Recent conversations:');
      recentConv.forEach((conv, i) => {
        console.log(`   ${i + 1}. ${conv.userPhone || 'Unknown'} - ${new Date(conv.lastMessageAt).toLocaleString()}`);
      });
    } else {
      console.log('⚠️  No conversations yet (no messages received)');
    }

    // 3. Check Messages
    console.log('\n\n📬 MESSAGES');
    console.log('==========\n');

    const messages = await db.collection('messages').find({}).countDocuments();
    console.log(`✅ Total messages: ${messages}`);

    if (messages > 0) {
      const recentMsgs = await db
        .collection('messages')
        .find({})
        .sort({ createdAt: -1 })
        .limit(3)
        .toArray();

      console.log('\n   Recent messages:');
      recentMsgs.forEach((msg, i) => {
        const direction = msg.direction === 'inbound' ? '📥' : '📤';
        const type = msg.messageType === 'text' ? 'Text' : msg.messageType;
        console.log(`   ${i + 1}. ${direction} ${type} - ${new Date(msg.createdAt).toLocaleString()}`);
        if (msg.content?.text) {
          console.log(`      "${msg.content.text.substring(0, 50)}..."`);
        }
      });
    } else {
      console.log('⚠️  No messages yet (webhook not triggered)');
    }

    // 4. Check Accounts
    console.log('\n\n👥 ACCOUNTS');
    console.log('===========\n');

    const accounts = await db.collection('accounts').find({}).toArray();
    console.log(`✅ Total accounts: ${accounts.length}`);

    accounts.forEach((acc, i) => {
      console.log(`${i + 1}. Account: ${acc.accountId}`);
      console.log(`   Name: ${acc.organizationName || 'Unknown'}`);
      console.log(`   Status: ${acc.status || 'unknown'}`);
      console.log(`   WhatsApp Setup: ${acc.wabaId ? '✅ Yes' : '❌ No'}`);
      console.log('');
    });

    // 5. Webhook Status Check
    console.log('\n🔗 WEBHOOK STATUS');
    console.log('=================\n');

    const webhookConfigs = [
      {
        name: 'Verify Token',
        value: process.env.META_VERIFY_TOKEN,
        expected: 'pixels_webhook_secret_2025'
      },
      {
        name: 'Backend URL',
        value: process.env.BACKEND_URL,
        expected: 'Set to production URL'
      },
      {
        name: 'Webhook Endpoint',
        value: '/api/webhooks/whatsapp',
        expected: 'Should be accessible'
      }
    ];

    webhookConfigs.forEach(config => {
      const ok = config.value ? '✅' : '❌';
      console.log(`${ok} ${config.name}`);
      if (config.value) {
        console.log(`   Value: ${config.value}`);
      } else {
        console.log(`   ❌ MISSING!`);
      }
    });

    // 6. Summary
    console.log('\n\n📊 SUMMARY');
    console.log('==========\n');

    const issues = [];

    if (phoneNumbers.length === 0) {
      issues.push('❌ No phone numbers connected');
    } else {
      const inactivePhones = phoneNumbers.filter(p => !p.isActive);
      if (inactivePhones.length > 0) {
        issues.push(`⚠️  ${inactivePhones.length} phone number(s) inactive`);
      }
    }

    if (conversations === 0) {
      issues.push('⚠️  No conversations (webhook may not be working)');
    }

    if (messages === 0) {
      issues.push('⚠️  No messages received yet');
    }

    if (issues.length === 0) {
      console.log('✅ Everything looks good!');
      console.log('   - Phone numbers connected');
      console.log('   - Webhook receiving messages');
      console.log('   - Ready for testing');
    } else {
      console.log('Issues found:');
      issues.forEach(issue => console.log(`  ${issue}`));

      console.log('\n💡 Next steps:');
      if (phoneNumbers.length === 0) {
        console.log('  1. Add phone number: http://localhost:3000/dashboard/settings');
        console.log('  2. Get Phone Number ID from Meta Business Account');
        console.log('  3. Get WABA ID from Meta Business Account');
      }
      if (conversations === 0 && phoneNumbers.length > 0) {
        console.log('  1. Send a test message from WhatsApp');
        console.log('  2. Check backend logs for webhook activity');
        console.log('  3. Verify webhook URL is accessible');
      }
    }

    console.log('\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

testPhoneNumbers();
