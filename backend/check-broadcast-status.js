import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const broadcastSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  accountId: String,
  phoneNumberId: String,
  name: String,
  status: String,
  createdAt: Date,
  updatedAt: Date,
  messageType: String,
  recipientList: String,
  stats: {
    sent: Number,
    delivered: Number,
    failed: Number,
    read: Number
  },
  content: {
    text: String
  },
  recipients: {
    phoneNumbers: [String],
    contactIds: [String]
  }
}, { strict: false });

const Broadcast = mongoose.model('Broadcast', broadcastSchema);

async function checkBroadcastStatus() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const broadcasts = await Broadcast.find({}).sort({ updatedAt: -1 }).limit(5);
    
    console.log('\n📊 Recent Broadcasts:\n');
    broadcasts.forEach((b, i) => {
      console.log(`${i + 1}. ${b.name}`);
      console.log(`   Status: ${b.status}`);
      console.log(`   Created: ${b.createdAt}`);
      console.log(`   Updated: ${b.updatedAt}`);
      console.log(`   Type: ${b.messageType}`);
      console.log(`   Recipients: ${b.recipientList}`);
      console.log(`   Stats: Sent=${b.stats?.sent || 0}, Delivered=${b.stats?.delivered || 0}, Failed=${b.stats?.failed || 0}`);
      console.log(`   Message: "${b.content?.text?.substring(0, 50)}${b.content?.text?.length > 50 ? '...' : ''}"`);
      console.log('');
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkBroadcastStatus();
