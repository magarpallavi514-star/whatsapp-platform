import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const broadcastSchema = new mongoose.Schema({}, { strict: false });
const Broadcast = mongoose.model('Broadcast', broadcastSchema);

async function fixBroadcasts() {
  try {
    console.log('🔧 Fixing broadcasts...\n');
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Update all broadcasts with phoneNumberId: "default" to use actual phone ID
    const result = await Broadcast.updateMany(
      { phoneNumberId: "default" },
      { $set: { phoneNumberId: "889344924259692" } }
    );
    
    console.log('✅ Updated broadcasts:');
    console.log(`   Matched: ${result.matchedCount}`);
    console.log(`   Modified: ${result.modifiedCount}\n`);
    
    // Verify the fix
    const broadcasts = await Broadcast.find({}).limit(5);
    console.log('📋 Updated Broadcasts:\n');
    broadcasts.forEach((b, i) => {
      console.log(`${i + 1}. ${b.name}`);
      console.log(`   Phone ID: ${b.phoneNumberId}`);
      console.log(`   Status: ${b.status}`);
      console.log('');
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixBroadcasts();
