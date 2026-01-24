import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Message from './src/models/Message.js';

dotenv.config();

async function fixMessageSendAccountId() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected\n');

    // Find all messages with String accountId
    const stringAccountIdMessages = await Message.find({ 
      accountId: { $type: 'string' } 
    });
    
    console.log(`Found ${stringAccountIdMessages.length} messages with String accountId\n`);

    if (stringAccountIdMessages.length === 0) {
      console.log('✅ No issues found - all accountIds are ObjectId');
      process.exit(0);
    }

    // Fix: Convert each String accountId to ObjectId
    let fixed = 0;
    for (const msg of stringAccountIdMessages) {
      try {
        const objectId = new mongoose.Types.ObjectId(msg.accountId);
        await Message.updateOne(
          { _id: msg._id },
          { $set: { accountId: objectId } }
        );
        fixed++;
        console.log(`  ✅ Fixed message ${msg._id}: ${msg.accountId} → ${objectId}`);
      } catch (error) {
        console.log(`  ⚠️ Could not convert "${msg.accountId}" - invalid ObjectId format`);
      }
    }

    console.log(`\n✅ Fixed ${fixed} messages`);

    // Verify
    const remaining = await Message.find({ accountId: { $type: 'string' } });
    if (remaining.length === 0) {
      console.log('✅ All messages now have ObjectId accountId');
    } else {
      console.log(`⚠️ ${remaining.length} messages still have String accountId`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

fixMessageSendAccountId();
