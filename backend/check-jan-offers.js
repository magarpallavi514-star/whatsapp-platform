import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const broadcastSchema = new mongoose.Schema({}, { strict: false });
const Broadcast = mongoose.model('Broadcast', broadcastSchema);

async function checkJanOffers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const broadcast = await Broadcast.findOne({ name: 'Jan offers' });
    
    if (!broadcast) {
      console.log('❌ Broadcast "Jan offers" not found');
      process.exit(0);
    }
    
    console.log('\n📊 Jan Offers Broadcast Details:\n');
    console.log('Name:', broadcast.name);
    console.log('Status:', broadcast.status);
    console.log('Message Type:', broadcast.messageType);
    console.log('Recipient List Type:', broadcast.recipientList);
    console.log('Created:', broadcast.createdAt);
    console.log('Updated:', broadcast.updatedAt);
    console.log('');
    console.log('📋 Recipients:');
    console.log('  Phone Numbers:', broadcast.recipients?.phoneNumbers || []);
    console.log('  Contact IDs:', broadcast.recipients?.contactIds || []);
    console.log('');
    console.log('📊 Stats:');
    console.log('  Sent:', broadcast.stats?.sent || 0);
    console.log('  Failed:', broadcast.stats?.failed || 0);
    console.log('  Pending:', broadcast.stats?.pending || 0);
    console.log('  InProgress:', broadcast.stats?.inProgress || 0);
    console.log('');
    console.log('📝 Content:');
    console.log('  Text:', broadcast.content?.text || 'N/A');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkJanOffers();
