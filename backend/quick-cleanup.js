import mongoose from 'mongoose';
import { config } from 'dotenv';
config();

(async () => {
  const db = mongoose.connection.db;
  
  // Connect
  await mongoose.connect(process.env.MONGODB_URI, {
    connectTimeoutMS: 5000,
    serverSelectionTimeoutMS: 5000
  });

  // 1. Fix messageTypes
  await db.collection('messages').updateMany(
    { messageType: 'template' },
    { $set: { messageType: 'text' } }
  );
  await db.collection('messages').updateMany(
    { messageType: 'broadcast' },
    { $set: { messageType: 'text' } }
  );
  console.log('✅ Fixed messageTypes');

  // 2. Delete duplicate conversations  
  const dupes = await db.collection('conversations').aggregate([
    { $group: { _id: '$conversationId', ids: { $push: '$_id' }, c: { $sum: 1 } } },
    { $match: { c: { $gt: 1 } } }
  ]).toArray();
  
  for (const d of dupes) {
    for (const id of d.ids.slice(1)) {
      await db.collection('messages').deleteMany({ conversationId: id });
      await db.collection('conversations').deleteOne({ _id: id });
    }
  }
  console.log(`✅ Deleted ${dupes.reduce((a, d) => a + d.ids.length - 1, 0)} duplicates`);

  process.exit(0);
})();
