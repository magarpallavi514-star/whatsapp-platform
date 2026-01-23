import mongoose from 'mongoose';
import Conversation from './src/models/Conversation.js';
import Message from './src/models/Message.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkEnromaticsChat() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log('\n' + '═'.repeat(70));
    console.log('📱 ENROMATICS LIVE CHAT CHECK');
    console.log('═'.repeat(70));

    const accountId = '6971e3a706837a5539992bee';
    const phoneNumberId = '1003427786179738';

    // Check conversations
    console.log('\n1️⃣  CONVERSATIONS');
    console.log('─'.repeat(70));

    const conversations = await Conversation.find({
      accountId,
      phoneNumberId
    }).sort({ lastMessageAt: -1 });

    console.log(`✅ Found ${conversations.length} conversation(s)`);

    conversations.forEach((conv, i) => {
      console.log(`\n   ${i + 1}. ${conv.userPhone} (${conv.userName || 'Unknown'})`);
      console.log(`      Last message: ${new Date(conv.lastMessageAt).toLocaleString()}`);
      console.log(`      Preview: ${conv.lastMessagePreview || '[No preview]'}`);
      console.log(`      Unread: ${conv.unreadCount}`);
    });

    // Check messages in last 24 hours
    console.log('\n2️⃣  MESSAGES (LAST 24 HOURS)');
    console.log('─'.repeat(70));

    const hoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const messages = await Message.find({
      accountId,
      phoneNumberId,
      createdAt: { $gte: hoursAgo }
    }).sort({ createdAt: -1 });

    console.log(`✅ Found ${messages.length} message(s) in last 24 hours`);

    messages.forEach((msg, i) => {
      if (i < 5) { // Show first 5
        console.log(`\n   ${i + 1}. [${msg.direction}] From: ${msg.recipientPhone}`);
        console.log(`      Time: ${new Date(msg.createdAt).toLocaleString()}`);
        console.log(`      Status: ${msg.status}`);
        if (msg.content?.text) {
          console.log(`      Text: ${msg.content.text.substring(0, 60)}...`);
        }
      }
    });

    if (messages.length > 5) {
      console.log(`\n   ... and ${messages.length - 5} more messages`);
    }

    // Summary
    console.log('\n' + '═'.repeat(70));
    console.log('✅ SUMMARY');
    console.log('─'.repeat(70));

    if (conversations.length > 0 && messages.length > 0) {
      console.log('✅ Conversations AND messages found!');
      console.log('✅ Live chat should be showing everything correctly');
    } else if (conversations.length > 0) {
      console.log('✅ Conversations found but NO messages in last 24h');
      console.log('⚠️  Customers may have messaged more than 24 hours ago');
    } else {
      console.log('❌ No conversations found');
      console.log('❌ Check if messages are being received from Meta webhook');
    }

    console.log('\n' + '═'.repeat(70));
    process.exit(0);

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

checkEnromaticsChat();
