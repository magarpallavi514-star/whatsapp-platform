import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const broadcastSchema = new mongoose.Schema({
  accountId: String,
  phoneNumberId: String,
  name: String,
  status: String,
  createdAt: Date,
  messageType: String,
  recipientList: String,
});

const Broadcast = mongoose.model('Broadcast', broadcastSchema);

async function checkBroadcasts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const broadcasts = await Broadcast.find({}).sort({ createdAt: -1 }).limit(10);
    
    if (broadcasts.length === 0) {
      console.log('No broadcasts found');
    } else {
      console.log(`\n📊 Found ${broadcasts.length} broadcasts:\n`);
      broadcasts.forEach((b, i) => {
        console.log(`${i + 1}. ${b.name}`);
        console.log(`   Status: ${b.status}`);
        console.log(`   Created: ${b.createdAt}`);
        console.log(`   Type: ${b.messageType}`);
        console.log(`   Recipients: ${b.recipientList}`);
        console.log('');
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkBroadcasts();
