import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Broadcast from './src/models/Broadcast.js';

dotenv.config();

async function testBroadcast() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected\n');

    // Find recent broadcasts
    const broadcasts = await Broadcast.find({}).sort({ createdAt: -1 }).limit(5);
    
    console.log('📢 RECENT BROADCASTS:\n');
    for (const bc of broadcasts) {
      console.log(`Broadcast: ${bc.name}`);
      console.log(`  Status: ${bc.status}`);
      console.log(`  Type: ${bc.messageType}`);
      console.log(`  Stats:`, {
        pending: bc.stats.pending,
        sent: bc.stats.sent,
        failed: bc.stats.failed,
        delivered: bc.stats.delivered,
        inProgress: bc.stats.inProgress
      });
      console.log(`  Started: ${bc.startedAt ? 'Yes' : 'No'}`);
      console.log(`  Completed: ${bc.completedAt ? 'Yes' : 'No'}\n`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

testBroadcast();
