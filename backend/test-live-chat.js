import mongoose from 'mongoose';
import Conversation from './src/models/Conversation.js';
import Message from './src/models/Message.js';

const MONGODB_URI = 'mongodb+srv://pixelsagency:Pm02072023@pixelsagency.664wxw1.mongodb.net/pixelswhatsapp';

async function testLiveChat() {
  try {
    await mongoose.connect(MONGODB_URI);
    
    console.log('=== LIVE CHAT STATUS CHECK ===\n');
    
    // Check conversations for both accounts
    const superAdminConvs = await Conversation.find({ accountId: 'pixels_internal' }).select('conversationId userPhone userName phoneNumberId').limit(5);
    const enromaticsConvs = await Conversation.find({ accountId: '2600003' }).select('conversationId userPhone userName phoneNumberId').limit(5);
    
    console.log('📱 Superadmin Conversations:', superAdminConvs.length);
    if (superAdminConvs.length > 0) {
      console.log(JSON.stringify(superAdminConvs, null, 2));
    }
    
    console.log('\n📱 Enromatics Conversations:', enromaticsConvs.length);
    if (enromaticsConvs.length > 0) {
      console.log(JSON.stringify(enromaticsConvs, null, 2));
    }
    
    // Check recent messages
    const recentMessages = await Message.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('accountId from to messageType direction createdAt');
    
    console.log('\n📨 Recent Messages:', recentMessages.length);
    console.log(JSON.stringify(recentMessages, null, 2));
    
    console.log('\n✅ Database Status:');
    console.log(`   - Superadmin has ${superAdminConvs.length} conversations`);
    console.log(`   - Enromatics has ${enromaticsConvs.length} conversations`);
    console.log(`   - Total recent messages: ${recentMessages.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

testLiveChat();
