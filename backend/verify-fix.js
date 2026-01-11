import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const broadcastSchema = new mongoose.Schema({}, { strict: false });
const Broadcast = mongoose.model('Broadcast', broadcastSchema);

async function verify() {
  try {
    console.log('✅ Verifying broadcast fix...\n');
    await mongoose.connect(process.env.MONGODB_URI);
    
    const broadcasts = await Broadcast.find({});
    
    console.log(`📊 Total Broadcasts: ${broadcasts.length}\n`);
    console.log('Phone ID Distribution:');
    
    const phoneIds = {};
    broadcasts.forEach(b => {
      phoneIds[b.phoneNumberId] = (phoneIds[b.phoneNumberId] || 0) + 1;
    });
    
    Object.entries(phoneIds).forEach(([phoneId, count]) => {
      console.log(`   ${phoneId}: ${count} broadcasts`);
    });
    
    console.log('\n📋 Sample broadcasts:');
    broadcasts.slice(0, 3).forEach((b, i) => {
      console.log(`\n${i + 1}. ${b.name}`);
      console.log(`   ID: ${b._id}`);
      console.log(`   Phone ID: ${b.phoneNumberId}`);
      console.log(`   Status: ${b.status}`);
      console.log(`   Stats: Sent=${b.stats?.sent || 0}, Failed=${b.stats?.failed || 0}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

verify();
