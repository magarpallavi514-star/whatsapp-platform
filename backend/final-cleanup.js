#!/usr/bin/env node
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Message from './src/models/Message.js';
import Conversation from './src/models/Conversation.js';

dotenv.config();

(async() => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Delete all bad accountIds
    const msgDel = await Message.deleteMany({
      $or: [
        { accountId: null },
        { accountId: undefined },
        { accountId: { $regex: '^[a-f0-9]{24}$' } }
      ]
    });
    
    const convDel = await Conversation.deleteMany({
      $or: [
        { accountId: null },
        { accountId: undefined },
        { accountId: { $regex: '^[a-f0-9]{24}$' } }
      ]
    });
    
    console.log('✅ Deleted ' + msgDel.deletedCount + ' messages (bad accountIds)');
    console.log('✅ Deleted ' + convDel.deletedCount + ' conversations (bad accountIds)');
    console.log('\n🎉 Perfect! All data now uses single source of truth!\n');
    
    // Verify
    const msgCount = await Message.countDocuments();
    const convCount = await Conversation.countDocuments();
    const msgAccounts = await Message.find().distinct('accountId');
    const convAccounts = await Conversation.find().distinct('accountId');
    
    console.log('Final State:');
    console.log(`  Messages: ${msgCount} (accountIds: ${msgAccounts.join(', ')})`);
    console.log(`  Conversations: ${convCount} (accountIds: ${convAccounts.join(', ')})`);
    
    await mongoose.disconnect();
    process.exit(0);
  } catch(e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
})();
