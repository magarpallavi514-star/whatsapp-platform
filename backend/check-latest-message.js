#!/usr/bin/env node

/**
 * Check Latest Incoming Message
 * Shows the most recent message received via webhook
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Message from './src/models/Message.js';
import Conversation from './src/models/Conversation.js';

dotenv.config();

console.log('🔍 ========== CHECKING LATEST MESSAGE ==========\n');

async function checkLatestMessage() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Get latest inbound message
    const latestMessage = await Message.findOne({ 
      direction: 'inbound' 
    })
    .sort({ createdAt: -1 })
    .limit(1);
    
    if (!latestMessage) {
      console.log('❌ No incoming messages found yet.');
      console.log('\n💡 Tips:');
      console.log('1. Send a message to your WhatsApp Business number');
      console.log('2. Make sure webhook is configured in Meta dashboard');
      console.log('3. Check backend logs for webhook hits');
      process.exit(0);
    }
    
    console.log('📨 LATEST INCOMING MESSAGE:');
    console.log('═'.repeat(60));
    console.log('Message ID:', latestMessage._id);
    console.log('WhatsApp Message ID:', latestMessage.waMessageId);
    console.log('From:', latestMessage.recipientPhone);
    console.log('Type:', latestMessage.messageType);
    console.log('Status:', latestMessage.status);
    console.log('Direction:', latestMessage.direction);
    console.log('Received:', latestMessage.createdAt);
    console.log('═'.repeat(60));
    
    console.log('\n📄 MESSAGE CONTENT:');
    console.log(JSON.stringify(latestMessage.content, null, 2));
    
    // Check for media
    if (latestMessage.content.mediaUrl) {
      console.log('\n📷 MEDIA INFORMATION:');
      console.log('═'.repeat(60));
      console.log('Media Type:', latestMessage.content.mediaType);
      console.log('S3 URL:', latestMessage.content.mediaUrl);
      console.log('S3 Key:', latestMessage.content.s3Key);
      console.log('Filename:', latestMessage.content.filename);
      console.log('File Size:', latestMessage.content.fileSize, 'bytes');
      console.log('MIME Type:', latestMessage.content.mimeType);
      if (latestMessage.content.caption) {
        console.log('Caption:', latestMessage.content.caption);
      }
      console.log('═'.repeat(60));
      
      console.log('\n✅ MEDIA SUCCESSFULLY SAVED TO S3!');
      console.log('\n🔗 Access URL (copy and paste in browser):');
      console.log(latestMessage.content.mediaUrl);
      
      console.log('\n💡 Note: If URL shows 403 Forbidden, the bucket is private.');
      console.log('Use signed URLs for access (they work for 1 hour).');
    }
    
    // Get conversation stats
    const conversationCount = await Conversation.countDocuments({ 
      accountId: latestMessage.accountId 
    });
    const messageCount = await Message.countDocuments({ 
      accountId: latestMessage.accountId 
    });
    
    console.log('\n📊 ACCOUNT STATISTICS:');
    console.log('═'.repeat(60));
    console.log('Account ID:', latestMessage.accountId);
    console.log('Total Conversations:', conversationCount);
    console.log('Total Messages:', messageCount);
    console.log('═'.repeat(60));
    
    // Get latest 5 messages
    const recentMessages = await Message.find({ 
      direction: 'inbound',
      accountId: latestMessage.accountId
    })
    .sort({ createdAt: -1 })
    .limit(5)
    .select('messageType recipientPhone createdAt content.text content.mediaType');
    
    console.log('\n📜 RECENT MESSAGES (Last 5):');
    console.log('═'.repeat(60));
    recentMessages.forEach((msg, index) => {
      const preview = msg.content.text 
        ? msg.content.text.substring(0, 50) 
        : `[${msg.messageType}${msg.content.mediaType ? ': ' + msg.content.mediaType : ''}]`;
      console.log(`${index + 1}. ${msg.messageType.toUpperCase()} from ${msg.recipientPhone}`);
      console.log(`   ${preview}`);
      console.log(`   ${msg.createdAt.toLocaleString()}`);
      console.log();
    });
    
    console.log('═'.repeat(60));
    console.log('✅ ALL CHECKS COMPLETE!');
    console.log('═'.repeat(60));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

checkLatestMessage();
