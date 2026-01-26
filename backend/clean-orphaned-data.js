#!/usr/bin/env node
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Message from './src/models/Message.js';
import Conversation from './src/models/Conversation.js';

dotenv.config();

(async() => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const msgDel = await Message.deleteMany({ 
      accountId: { $regex: '^[a-f0-9]{24}$' } 
    });
    
    const convDel = await Conversation.deleteMany({ 
      accountId: { $regex: '^[a-f0-9]{24}$' } 
    });
    
    console.log('✅ Deleted ' + msgDel.deletedCount + ' messages with ObjectId format');
    console.log('✅ Deleted ' + convDel.deletedCount + ' conversations with ObjectId format');
    console.log('\n🎉 Database is now 100% clean - single source of truth!\n');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch(e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
})();
