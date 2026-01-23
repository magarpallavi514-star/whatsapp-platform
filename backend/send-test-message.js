import mongoose from 'mongoose';
import Message from './src/models/Message.js';
import Conversation from './src/models/Conversation.js';
import Account from './src/models/Account.js';
import PhoneNumber from './src/models/PhoneNumber.js';

async function sendTestMessage() {
  try {
    await mongoose.connect('mongodb+srv://pixels:bnVtYmVyMjU5OA@pixelswhatsapp.7u1vk.mongodb.net/pixelswhatsapp?retryWrites=true&w=majority', {
      serverSelectionTimeoutMS: 5000
    });
    
    console.log('✅ Connected to MongoDB\n');
    
    // Find Enromatics account
    const account = await Account.findOne({ email: 'info@enromatics.com' });
    if (!account) {
      console.error('❌ Enromatics account not found');
      process.exit(1);
    }
    
    console.log('📊 Account:', account.name, `(${account.accountId})`);
    
    // Get first active phone number
    const phone = await PhoneNumber.findOne({ 
      accountId: account.accountId,
      isActive: true 
    });
    
    if (!phone) {
      console.error('❌ No active phone number found');
      process.exit(1);
    }
    
    console.log('📱 Phone:', phone.displayPhoneNumber, `(${phone.phoneNumberId})\n`);
    
    // Test contact number
    const testNumber = '919209270811'; // Indian test number
    const conversationId = `${account.accountId}_${phone.phoneNumberId}_${testNumber}`;
    
    // Create or update conversation
    let conversation = await Conversation.findOne({ conversationId });
    
    if (!conversation) {
      console.log('📝 Creating new conversation...');
      conversation = new Conversation({
        accountId: account.accountId,
        phoneNumberId: phone.phoneNumberId,
        conversationId,
        participantPhone: testNumber,
        participantName: 'Test User',
        lastMessageTime: new Date(),
        messageCount: 1,
        isActive: true
      });
      await conversation.save();
      console.log('✅ Conversation created\n');
    } else {
      console.log('✅ Conversation exists, updating...');
      conversation.lastMessageTime = new Date();
      conversation.messageCount = (conversation.messageCount || 0) + 1;
      await conversation.save();
      console.log('✅ Conversation updated\n');
    }
    
    // Create test message
    const testMessage = new Message({
      accountId: account.accountId,
      phoneNumberId: phone.phoneNumberId,
      waMessageId: `test_${Date.now()}`,
      recipientPhone: testNumber,
      recipientName: 'Test User',
      direction: 'outbound',
      messageType: 'text',
      content: {
        text: `Hello! This is a test message sent at ${new Date().toLocaleString()}. ✅ System is working!`
      },
      status: 'delivered',
      deliveredAt: new Date(),
      isRead: false,
      conversationId,
      metadata: {
        source: 'test_script',
        purpose: 'system_verification'
      }
    });
    
    await testMessage.save();
    
    console.log('📤 Test Message Sent:\n');
    console.log('  From:', phone.displayPhoneNumber);
    console.log('  To:', testNumber);
    console.log('  Message:', testMessage.content.text);
    console.log('  Status:', testMessage.status);
    console.log('  Sent at:', testMessage.createdAt.toLocaleString());
    console.log('\n✅ Message saved to database');
    console.log('\n🔄 Refresh your live chat page to see the message');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ ERROR:', err.message);
    process.exit(1);
  }
}

sendTestMessage();
