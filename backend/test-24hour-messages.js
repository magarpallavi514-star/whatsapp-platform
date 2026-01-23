import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Message from './src/models/Message.js';
import Conversation from './src/models/Conversation.js';

dotenv.config();

async function test24HourMessages() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('\n📨 TESTING 24-HOUR MESSAGE FETCH\n');
    
    // Enromatics account details
    const accountId = '6971e3a706837a5539992bee';
    const phoneNumberId = '1003427786179738';
    const userPhone = '919209270811';
    
    console.log('Account Details:');
    console.log(`  Account ID: ${accountId}`);
    console.log(`  Phone Number ID: ${phoneNumberId}`);
    console.log(`  User Phone: ${userPhone}\n`);
    
    // Get conversation
    const conversation = await Conversation.findOne({
      accountId,
      phoneNumberId,
      userPhone
    });
    
    if (!conversation) {
      console.log('❌ No conversation found\n');
      await mongoose.connection.close();
      return;
    }
    
    console.log('✅ Conversation Found:');
    console.log(`  Conversation ID: ${conversation.conversationId}`);
    console.log(`  Created: ${conversation.createdAt}`);
    console.log(`  Last Message: ${conversation.lastMessageAt}\n`);
    
    // Calculate 24 hours ago
    const hoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    console.log(`⏰ Fetching messages from: ${hoursAgo.toLocaleString()}`);
    console.log(`   To: ${new Date().toLocaleString()}\n`);
    
    // Fetch messages from last 24 hours
    const messages24h = await Message.find({
      accountId,
      phoneNumberId,
      recipientPhone: userPhone,
      createdAt: { $gte: hoursAgo }
    }).sort({ createdAt: 1 });
    
    console.log(`📊 MESSAGES FROM LAST 24 HOURS: ${messages24h.length}\n`);
    
    if (messages24h.length > 0) {
      messages24h.forEach((msg, i) => {
        const timeStr = new Date(msg.createdAt).toLocaleTimeString();
        const direction = msg.direction === 'inbound' ? '📥' : '📤';
        console.log(`${i + 1}. ${direction} [${timeStr}] ${msg.direction.toUpperCase()}`);
        console.log(`   From: ${msg.senderPhone || 'System'}`);
        console.log(`   To: ${msg.recipientPhone}`);
        console.log(`   Type: ${msg.type}`);
        console.log(`   Text: ${msg.text?.substring(0, 50) || msg.mediaUrl || 'N/A'}`);
        console.log(`   Status: ${msg.status}`);
        console.log('');
      });
    } else {
      console.log('❌ No messages found in last 24 hours\n');
    }
    
    // Also show total messages (all time)
    const totalMessages = await Message.countDocuments({
      accountId,
      phoneNumberId,
      recipientPhone: userPhone
    });
    
    console.log(`\n📈 TOTAL MESSAGES (ALL TIME): ${totalMessages}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

test24HourMessages();
