import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

// Message Schema
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

// Conversation Schema
const conversationSchema = new mongoose.Schema({
  accountId: String,
  phoneNumberId: String,
  waId: String,
  displayName: String,
  profilePictureUrl: String,
  lastMessage: String,
  lastMessageTime: Date,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const Conversation = mongoose.model('Conversation', conversationSchema);

async function sendMessage(phoneNumberId, recipientPhone, message) {
  console.log(`\n📤 Sending message via Phone: ${phoneNumberId}`);
  console.log(`   To: ${recipientPhone}`);
  console.log(`   Message: "${message}"`);

  try {
    const response = await fetch(
      `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: recipientPhone,
          type: 'text',
          text: {
            preview_url: false,
            body: message
          }
        })
      }
    );

    const data = await response.json();

    if (response.ok && data.messages) {
      console.log(`   ✅ Message sent successfully!`);
      console.log(`   Message ID: ${data.messages[0].id}`);
      return true;
    } else {
      console.log(`   ❌ Failed to send message`);
      console.log(`   Error: ${data.error?.message || 'Unknown error'}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Request failed: ${error.message}`);
    return false;
  }
}

async function checkMessages() {
  console.log('\n📊 Checking Messages in Database\n');
  
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    // Check messages for both accounts
    const superadminMessages = await Message.find({ accountId: 'pixels_internal' });
    const enromaticsMessages = await Message.find({ accountId: '2600003' });

    console.log(`SUPERADMIN Messages: ${superadminMessages.length}`);
    if (superadminMessages.length > 0) {
      console.log(`  Latest: "${superadminMessages[superadminMessages.length - 1].message}"`);
    }

    console.log(`ENROMATICS Messages: ${enromaticsMessages.length}`);
    if (enromaticsMessages.length > 0) {
      console.log(`  Latest: "${enromaticsMessages[enromaticsMessages.length - 1].message}"`);
    }

    // Check conversations
    const superadminConvs = await Conversation.find({ accountId: 'pixels_internal' });
    const enromaticsConvs = await Conversation.find({ accountId: '2600003' });

    console.log(`\nSUPERADMIN Conversations: ${superadminConvs.length}`);
    console.log(`ENROMATICS Conversations: ${enromaticsConvs.length}`);

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error checking messages:', error.message);
  }
}

async function testMessaging() {
  console.log('🚀 Testing WhatsApp Message Sending');
  console.log('='.repeat(60));

  // Test 1: Send message from Superadmin to Enromatics
  const test1 = await sendMessage(
    '889344924259692',
    '918087131777',
    'Hello Enromatics! This is a test message from Superadmin via ReplysSys 🚀'
  );

  // Test 2: Send message from Enromatics to Superadmin
  const test2 = await sendMessage(
    '1003427786179738',
    '919766504856',
    'Hello Superadmin! This is a test message from Enromatics via ReplysSys ✅'
  );

  // Test 3: Send to external number (if you have one to test)
  // const test3 = await sendMessage(
  //   '889344924259692',
  //   '919999999999',
  //   'Test message'
  // );

  console.log('\n' + '='.repeat(60));
  console.log('📋 Test Results:');
  console.log(`  Superadmin → Enromatics: ${test1 ? '✅ SENT' : '❌ FAILED'}`);
  console.log(`  Enromatics → Superadmin: ${test2 ? '✅ SENT' : '❌ FAILED'}`);

  // Check database after delay
  console.log('\n⏳ Waiting 3 seconds for webhook delivery...');
  await new Promise(resolve => setTimeout(resolve, 3000));

  await checkMessages();

  console.log('\n' + '='.repeat(60));
  console.log('✅ Test complete!');
  console.log('\nNote: If messages appear in DB, webhooks are working!');
  console.log('Check live chat to see them in real-time.');
}

testMessaging();
