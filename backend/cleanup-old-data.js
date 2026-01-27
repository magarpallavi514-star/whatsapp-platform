import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function cleanup() {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    const db = conn.connection.db;

    console.log('🔧 CLEANING UP OLD DATA...\n');

    // 1. Fix old broadcast messages
    console.log('📋 Finding messages with unsupported types...');
    const badMessages = await db.collection('messages').find({
      messageType: { $in: ['template', 'media', 'broadcast'] }
    }).toArray();

    console.log(`Found ${badMessages.length} messages with unsupported types`);

    if (badMessages.length > 0) {
      const r1 = await db.collection('messages').updateMany(
        { messageType: 'template' },
        { $set: { messageType: 'text' } }
      );
      console.log(`✅ Fixed ${r1.modifiedCount} template → text`);

      const r2 = await db.collection('messages').updateMany(
        { messageType: 'broadcast' },
        { $set: { messageType: 'text' } }
      );
      console.log(`✅ Fixed ${r2.modifiedCount} broadcast → text`);
    }

    // 2. Find duplicate conversations
    console.log('\n🔍 Finding duplicate conversations...');
    const dupeConvos = await db.collection('conversations').aggregate([
      {
        $group: {
          _id: '$conversationId',
          count: { $sum: 1 },
          ids: { $push: '$_id' }
        }
      },
      { $match: { count: { $gt: 1 } } }
    ]).toArray();

    console.log(`Found ${dupeConvos.length} conversation groups with duplicates`);
    
    let totalDeleted = 0;
    for (const group of dupeConvos) {
      const toDelete = group.ids.slice(1);
      for (const id of toDelete) {
        await db.collection('messages').deleteMany({ conversationId: id });
        await db.collection('conversations').deleteOne({ _id: id });
        totalDeleted++;
      }
    }
    console.log(`✅ Deleted ${totalDeleted} duplicate conversations`);

    console.log('\n✅ CLEANUP COMPLETE');
    await conn.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('ERROR:', err.message);
    process.exit(1);
  }
}

cleanup();
