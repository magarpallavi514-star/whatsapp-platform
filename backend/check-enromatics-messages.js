import mongoose from 'mongoose';
import Conversation from './src/models/Conversation.js';
import Message from './src/models/Message.js';

const MONGODB_URI = 'mongodb+srv://pixelsagency:Pm02072023@pixelsagency.664wxw1.mongodb.net/pixelswhatsapp';

async function check() {
  try {
    await mongoose.connect(MONGODB_URI);
    
    // Check enromatics
    const convs = await Conversation.countDocuments({ accountId: '2600003' });
    const msgs = await Message.countDocuments({ accountId: '2600003' });
    
    console.log('Enromatics (2600003):');
    console.log('  Conversations:', convs);
    console.log('  Messages:', msgs);
    
    // Get details if any exist
    if (convs > 0) {
      const conv = await Conversation.findOne({ accountId: '2600003' }).select('conversationId userPhone phoneNumberId');
      console.log('\nConversation details:', JSON.stringify(conv, null, 2));
    }
    
    if (msgs > 0) {
      const msg = await Message.findOne({ accountId: '2600003' }).select('from to body direction');
      console.log('\nMessage details:', JSON.stringify(msg, null, 2));
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

check();
