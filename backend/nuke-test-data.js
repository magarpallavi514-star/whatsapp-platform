#!/usr/bin/env node
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Message from './src/models/Message.js';
import Conversation from './src/models/Conversation.js';

dotenv.config();

(async() => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Delete all test messages/conversations (keep only 2600001 and 2600003)
    const msgResult = await Message.deleteMany({
      accountId: { $nin: ['2600001', '2600003'] }
    });
    
    const convResult = await Conversation.deleteMany({
      accountId: { $nin: ['2600001', '2600003'] }
    });
    
    console.log('✅ Deleted ' + msgResult.deletedCount + ' test messages');
    console.log('✅ Deleted ' + convResult.deletedCount + ' test conversations');
    
    // Show final state
    const finalMsgs = await Message.countDocuments();
    const finalConvs = await Conversation.countDocuments();
    const msgAccounts = await Message.find().distinct('accountId');
    const convAccounts = await Conversation.find().distinct('accountId');
    
    console.log('\n✅ FINAL CLEAN STATE:');
    console.log(`  Messages: ${finalMsgs} (accountIds: ${msgAccounts.join(', ')})`);
    console.log(`  Conversations: ${finalConvs} (accountIds: ${convAccounts.join(', ')})`);
    console.log('\n🎉 Database is 100% clean - Single Source of Truth!\n');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch(e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
})();
