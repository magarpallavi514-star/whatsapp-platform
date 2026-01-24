import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Message from './src/models/Message.js';
import Conversation from './src/models/Conversation.js';
import Account from './src/models/Account.js';

dotenv.config();

async function fixAccountIdTypes() {
  try {
    console.log('\n' + '='.repeat(70));
    console.log('🔧 FIX: Convert String accountIds to ObjectIds');
    console.log('='.repeat(70));
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected\n');
    
    // Build map of string accountId → ObjectId
    const accounts = await Account.find({});
    const stringToObjectId = {};
    
    accounts.forEach(acc => {
      // acc._id is ObjectId, acc.accountId is String
      stringToObjectId[acc._id.toString()] = acc._id;
    });
    
    console.log(`📊 Account mapping created for ${accounts.length} accounts\n`);
    
    // Fix Messages
    console.log('🔧 Fixing Messages...');
    const badMessages = await Message.find({ 
      accountId: { $type: 'string' }
    });
    
    let messagesFixed = 0;
    for (const msg of badMessages) {
      const objectId = stringToObjectId[msg.accountId];
      if (objectId) {
        await Message.updateOne(
          { _id: msg._id },
          { $set: { accountId: objectId } }
        );
        messagesFixed++;
      }
    }
    console.log(`✅ Fixed ${messagesFixed} messages\n`);
    
    // Fix Conversations
    console.log('🔧 Fixing Conversations...');
    const badConversations = await Conversation.find({ 
      accountId: { $type: 'string' }
    });
    
    let conversationsFixed = 0;
    for (const conv of badConversations) {
      const objectId = stringToObjectId[conv.accountId];
      if (objectId) {
        await Conversation.updateOne(
          { _id: conv._id },
          { $set: { accountId: objectId } }
        );
        conversationsFixed++;
      }
    }
    console.log(`✅ Fixed ${conversationsFixed} conversations\n`);
    
    console.log('='.repeat(70));
    console.log(`✅ Migration complete! Fixed ${messagesFixed + conversationsFixed} records`);
    console.log('='.repeat(70) + '\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

fixAccountIdTypes();
