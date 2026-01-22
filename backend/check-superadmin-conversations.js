import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function checkConversations() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;

    // Get superadmin conversations
    const convs = await db.collection('conversations').find({ accountId: 'pixels_internal' }).limit(3).toArray();
    
    console.log(`📱 Superadmin Conversations (${convs.length}):\n`);
    convs.forEach((c, i) => {
      console.log(`${i+1}. ${c.conversationId || c._id}`);
      console.log(`   User Phone: ${c.userPhone}`);
      console.log(`   Phone Number ID: ${c.phoneNumberId}`);
      console.log(`   WABA ID: ${c.wabaId}`);
      console.log(`   Status: ${c.status}`);
      console.log(`   Last Message: ${c.lastMessageAt}\n`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

checkConversations();
