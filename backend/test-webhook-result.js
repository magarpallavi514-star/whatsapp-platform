import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Message from './src/models/Message.js';
import Conversation from './src/models/Conversation.js';

dotenv.config();

async function checkWebhookResult() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('\n📊 WEBHOOK TEST RESULTS\n');
    
    // Check if message was created
    const message = await Message.findOne({ 
      waMessageId: 'wamid.test123' 
    });
    
    if (message) {
      console.log('✅ TEST MESSAGE WAS SAVED TO DATABASE!');
      console.log('   Message ID:', message._id);
      console.log('   From:', message.from);
      console.log('   Content:', message.content);
      console.log('   Phone:', message.phoneNumberId);
      console.log('   Account:', message.accountId);
    } else {
      console.log('❌ TEST MESSAGE NOT FOUND IN DATABASE');
      console.log('   Webhook received but message not saved');
    }
    
    // Check Enromatics conversations
    const conversations = await Conversation.find({
      phoneNumberId: '1003427786179738'
    });
    
    console.log('\n💬 ENROMATICS CONVERSATIONS:');
    if (conversations.length > 0) {
      console.log(`✅ Found ${conversations.length} conversation(s)`);
      conversations.forEach((conv, i) => {
        console.log(`   Convo ${i+1}: ${conv.conversationId}`);
        console.log('   Participant:', conv.participantPhone);
      });
    } else {
      console.log('❌ No conversations yet');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

checkWebhookResult();
