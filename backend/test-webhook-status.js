import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

// Schema
const messageSchema = new mongoose.Schema({
  messageId: String,
  accountId: String,
  phoneNumberId: String,
  conversationId: String,
  sender: String,
  senderType: { type: String, enum: ['user', 'agent'] },
  message: String,
  messageType: String,
  timestamp: Date,
  status: String,
  createdAt: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', messageSchema);

async function testWebhookSetup() {
  console.log('🔧 Testing Webhook Setup\n');

  try {
    await mongoose.connect(process.env.MONGODB_URI);

    // Test 1: Verify both phones are in database
    const PhoneNumber = mongoose.model('PhoneNumber', new mongoose.Schema({
      phoneNumber: String,
      phoneNumberId: String,
      accountId: String,
      isActive: Boolean
    }));

    const phones = await PhoneNumber.find({
      phoneNumberId: { $in: ['889344924259692', '1003427786179738'] }
    });

    console.log('📱 Phone Configuration:');
    for (const phone of phones) {
      const name = phone.phoneNumberId === '889344924259692' ? 'SUPERADMIN' : 'ENROMATICS';
      console.log(`  ${name}:`);
      console.log(`    Phone ID: ${phone.phoneNumberId}`);
      console.log(`    Account: ${phone.accountId}`);
      console.log(`    Active: ${phone.isActive ? '✅' : '❌'}`);
    }

    // Test 2: Check webhook URL
    console.log('\n📡 Webhook Configuration:');
    console.log(`  Endpoint: ${process.env.BACKEND_URL}/api/webhooks/whatsapp`);
    console.log(`  Verify Token: ${process.env.META_VERIFY_TOKEN}`);

    // Test 3: Check messages by source
    console.log('\n📊 Message Statistics:');
    const allMessages = await Message.find({});
    console.log(`  Total messages in DB: ${allMessages.length}`);

    // Group by account
    const byAccount = {};
    for (const msg of allMessages) {
      if (!byAccount[msg.accountId]) {
        byAccount[msg.accountId] = { count: 0, latest: null };
      }
      byAccount[msg.accountId].count++;
      if (!byAccount[msg.accountId].latest || new Date(msg.createdAt) > new Date(byAccount[msg.accountId].latest.createdAt)) {
        byAccount[msg.accountId].latest = msg;
      }
    }

    for (const [account, data] of Object.entries(byAccount)) {
      const name = account === 'pixels_internal' ? 'SUPERADMIN' : 'ENROMATICS';
      console.log(`  ${name}: ${data.count} messages`);
      if (data.latest) {
        console.log(`    Latest: "${data.latest.message?.substring(0, 50)}..." (${new Date(data.latest.createdAt).toLocaleString()})`);
      }
    }

    // Test 4: Check message sources
    console.log('\n📨 Message Sources:');
    const senderTypes = await Message.aggregate([
      { $group: { _id: '$senderType', count: { $sum: 1 } } }
    ]);
    for (const item of senderTypes) {
      console.log(`  ${item._id}: ${item.count}`);
    }

    // Test 5: Check for incoming messages (from webhook)
    console.log('\n🔄 Webhook Reception Status:');
    const userMessages = await Message.find({ senderType: 'user' });
    if (userMessages.length > 0) {
      console.log(`  ✅ Webhook IS receiving messages (${userMessages.length} user messages)`);
      console.log(`  Latest webhook message: ${new Date(userMessages[userMessages.length - 1].createdAt).toLocaleString()}`);
    } else {
      console.log(`  ⚠️  Webhook has NOT received any messages yet`);
      console.log(`  Messages will appear here once someone replies to the sent messages`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('NEXT STEPS:');
    console.log('1. Check your WhatsApp phone for the test messages');
    console.log('2. Reply to the message on WhatsApp');
    console.log('3. The reply will trigger the webhook');
    console.log('4. Run this test again to see the incoming message');
    console.log('5. Or check the live chat at https://replysys.com/dashboard/chat');

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

testWebhookSetup();
