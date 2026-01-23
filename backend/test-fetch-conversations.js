import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Conversation from './src/models/Conversation.js';

dotenv.config();

async function testConversations() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('\n🔍 TESTING CONVERSATION FETCH (LIKE API)\n');
    
    // Enromatics account ID
    const accountId = '6971e3a706837a5539992bee';
    
    console.log(`Account ID: ${accountId}\n`);
    
    // Fetch conversations like the API does
    const conversations = await Conversation.find({ accountId })
      .sort({ lastMessageAt: -1 })
      .limit(50)
      .lean();
    
    console.log(`📊 FOUND ${conversations.length} CONVERSATIONS\n`);
    
    if (conversations.length > 0) {
      conversations.forEach((conv, i) => {
        console.log(`${i + 1}. Conversation ${conv.conversationId}`);
        console.log(`   User Phone: ${conv.userPhone}`);
        console.log(`   Phone Number ID: ${conv.phoneNumberId}`);
        console.log(`   User Name: ${conv.userName || 'N/A'}`);
        console.log(`   Last Message: ${conv.lastMessageAt}`);
        console.log(`   Last Message Preview: ${conv.lastMessagePreview || 'N/A'}`);
        console.log(`   Status: ${conv.status}`);
        console.log(`   Created: ${conv.createdAt}`);
        console.log('');
      });
    } else {
      console.log('❌ No conversations found!\n');
      
      // Check if any conversations exist for this account
      const allConvs = await Conversation.find({ accountId: accountId });
      console.log(`Total conversations in DB for this account: ${allConvs.length}`);
      
      if (allConvs.length > 0) {
        console.log('\nAll conversations:');
        allConvs.forEach(c => {
          console.log(`- ${c.conversationId} (${c.userPhone})`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

testConversations();
