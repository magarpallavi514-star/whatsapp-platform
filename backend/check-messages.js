import mongoose from 'mongoose';
import Message from './src/models/Message.js';
import Conversation from './src/models/Conversation.js';

const MONGODB_URI = 'mongodb+srv://pixelsagency:Pm02072023@pixelsagency.664wxw1.mongodb.net/pixelswhatsapp';

async function checkMessages() {
  try {
    await mongoose.connect(MONGODB_URI);
    
    // Check messages for enromatics account
    const messages = await Message.find({ accountId: '2600003' }).select('from to body createdAt').sort({ createdAt: -1 }).limit(10);
    
    console.log('=== MESSAGES FOR ENROMATICS (2600003) ===');
    console.log(`Total: ${messages.length}`);
    console.log(JSON.stringify(messages, null, 2));
    
    // Check conversations
    const conversations = await Conversation.find({ accountId: '2600003' }).select('participantPhone participantName lastMessageTime').sort({ lastMessageTime: -1 }).limit(10);
    
    console.log('\n=== CONVERSATIONS FOR ENROMATICS (2600003) ===');
    console.log(`Total: ${conversations.length}`);
    console.log(JSON.stringify(conversations, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkMessages();
