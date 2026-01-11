import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const broadcastSchema = new mongoose.Schema({}, { strict: false });
const Broadcast = mongoose.model('Broadcast', broadcastSchema);

async function check() {
  try {
    console.log('🔍 Checking broadcast execution details...\n');
    await mongoose.connect(process.env.MONGODB_URI);
    
    const broadcasts = await Broadcast.find({}).sort({ createdAt: -1 }).limit(3);
    
    broadcasts.forEach((b, i) => {
      console.log(`${i + 1}. ${b.name}`);
      console.log(`   Status: ${b.status}`);
      console.log(`   Phone ID: ${b.phoneNumberId}`);
      console.log(`   Account ID: ${b.accountId}`);
      console.log(`   Recipients: ${b.recipients?.length || 0}`);
      console.log(`   Message: ${b.message?.substring(0, 50)}...`);
      console.log(`   Stats:`, b.stats);
      console.log(`   Execution Log:`, b.executionLog?.slice(0, 2));
      console.log('');
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

check();
