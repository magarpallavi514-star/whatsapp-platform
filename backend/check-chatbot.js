import mongoose from 'mongoose';
import dotenv from 'dotenv';
import KeywordRule from './src/models/KeywordRule.js';

dotenv.config();

async function checkChatbot() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check for Enromatics chatbots
    const enromaticsBots = await KeywordRule.find({ accountId: 'eno_2600003' });
    
    console.log('🤖 Chatbots for Enromatics (eno_2600003):');
    console.log(`Total: ${enromaticsBots.length}\n`);
    
    if (enromaticsBots.length > 0) {
      enromaticsBots.forEach(bot => {
        console.log(`✅ Bot: ${bot.name}`);
        console.log(`   ID: ${bot._id}`);
        console.log(`   Keywords: ${bot.keywords.join(', ')}`);
        console.log(`   Reply Type: ${bot.replyType}`);
        console.log(`   Active: ${bot.isActive}`);
        console.log(`   Created: ${bot.createdAt}\n`);
      });
    } else {
      console.log('❌ No chatbots found for Enromatics\n');
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkChatbot();
