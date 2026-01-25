import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Message from './src/models/Message.js';
import Conversation from './src/models/Conversation.js';
import Account from './src/models/Account.js';

dotenv.config();

async function checkMessageIssues() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const account = await Account.findOne({}).limit(1);
    const accountId = account._id;
    
    console.log(`\n🔍 Checking Message Issues\n`);
    
    // Find messages WITHOUT conversationId
    const messagesWithoutConvId = await Message.find({
      accountId,
      conversationId: { $exists: false }
    }).limit(5).lean();
    
    if (messagesWithoutConvId.length > 0) {
      console.log(`Found ${messagesWithoutConvId.length} messages without conversationId:\n`);
      
      for (const msg of messagesWithoutConvId) {
        console.log(`Message ID: ${msg._id}`);
        console.log(`  Type: ${msg.messageType}`);
        console.log(`  Direction: ${msg.direction}`);
        console.log(`  Campaign: ${msg.campaign}`);
        console.log(`  Recipient: ${msg.recipientPhone}`);
        console.log(`  Created: ${msg.createdAt}`);
        
        // Try to find conversation manually
        const conv = await Conversation.findOne({
          accountId,
          phoneNumberId: msg.phoneNumberId,
          userPhone: msg.recipientPhone
        }).lean();
        
        if (conv) {
          console.log(`  ✅ Matching conversation found: ${conv._id}`);
        } else {
          console.log(`  ❌ No matching conversation`);
        }
        console.log();
      }
    } else {
      console.log('✅ All recent messages have conversationId');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkMessageIssues();
