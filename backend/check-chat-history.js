import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Conversation from './src/models/Conversation.js';
import Message from './src/models/Message.js';
import Contact from './src/models/Contact.js';

dotenv.config();

const checkChatHistory = async () => {
  try {
    console.log('🔍 Connecting to MongoDB...\n');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const phoneToCheck = '8087131777';
    const formattedPhone1 = `+${phoneToCheck}`;
    const formattedPhone2 = phoneToCheck;

    console.log(`📱 Searching for chat history for: ${phoneToCheck}\n`);

    // 1. Check Conversations
    console.log('=' .repeat(60));
    console.log('1️⃣  CONVERSATIONS');
    console.log('=' .repeat(60));
    
    const conversations = await Conversation.find({
      $or: [
        { userPhone: formattedPhone1 },
        { userPhone: formattedPhone2 },
        { userPhone: { $regex: phoneToCheck } }
      ]
    }).lean();

    console.log(`Found: ${conversations.length} conversation(s)\n`);
    if (conversations.length > 0) {
      conversations.forEach((conv, i) => {
        console.log(`${i + 1}. Conversation ID: ${conv.conversationId}`);
        console.log(`   Account ID: ${conv.accountId}`);
        console.log(`   Phone Number ID: ${conv.phoneNumberId}`);
        console.log(`   User Phone: ${conv.userPhone}`);
        console.log(`   User Name: ${conv.userName || 'N/A'}`);
        console.log(`   Status: ${conv.status}`);
        console.log(`   Last Message: ${conv.lastMessageAt}`);
        console.log(`   Last Message Preview: ${conv.lastMessagePreview || 'N/A'}`);
        console.log(`   Unread Count: ${conv.unreadCount}`);
        console.log(`   Created: ${conv.createdAt}`);
        console.log('');
      });
    }

    // 2. Check Messages
    console.log('=' .repeat(60));
    console.log('2️⃣  MESSAGES');
    console.log('=' .repeat(60));
    
    const messages = await Message.find({
      $or: [
        { recipientPhone: formattedPhone1 },
        { recipientPhone: formattedPhone2 },
        { recipientPhone: { $regex: phoneToCheck } }
      ]
    }).sort({ createdAt: -1 }).limit(20).lean();

    console.log(`Found: ${messages.length} message(s)\n`);
    if (messages.length > 0) {
      messages.forEach((msg, i) => {
        console.log(`${i + 1}. Message ID: ${msg._id}`);
        console.log(`   Account ID: ${msg.accountId}`);
        console.log(`   Phone Number ID: ${msg.phoneNumberId}`);
        console.log(`   Recipient: ${msg.recipientPhone}`);
        console.log(`   Type: ${msg.messageType}`);
        console.log(`   Direction: ${msg.direction}`);
        console.log(`   Status: ${msg.status || 'N/A'}`);
        if (msg.content?.text) {
          console.log(`   Text: ${msg.content.text.substring(0, 100)}${msg.content.text.length > 100 ? '...' : ''}`);
        }
        console.log(`   Created: ${msg.createdAt}`);
        console.log(`   WA Message ID: ${msg.waMessageId || 'N/A'}`);
        console.log('');
      });
    }

    // 3. Check Contacts
    console.log('=' .repeat(60));
    console.log('3️⃣  CONTACTS');
    console.log('=' .repeat(60));
    
    const contacts = await Contact.find({
      $or: [
        { phone: formattedPhone1 },
        { phone: formattedPhone2 },
        { whatsappNumber: formattedPhone1 },
        { whatsappNumber: formattedPhone2 },
        { phone: { $regex: phoneToCheck } },
        { whatsappNumber: { $regex: phoneToCheck } }
      ]
    }).lean();

    console.log(`Found: ${contacts.length} contact(s)\n`);
    if (contacts.length > 0) {
      contacts.forEach((contact, i) => {
        console.log(`${i + 1}. Contact ID: ${contact._id}`);
        console.log(`   Account ID: ${contact.accountId}`);
        console.log(`   Name: ${contact.name}`);
        console.log(`   Phone: ${contact.phone}`);
        console.log(`   WhatsApp Number: ${contact.whatsappNumber}`);
        console.log(`   Type: ${contact.type}`);
        console.log(`   Last Message: ${contact.lastMessageAt || 'N/A'}`);
        console.log(`   Message Count: ${contact.messageCount || 0}`);
        console.log(`   Opted In: ${contact.isOptedIn}`);
        console.log(`   Created: ${contact.createdAt}`);
        console.log('');
      });
    }

    // 4. Summary
    console.log('=' .repeat(60));
    console.log('📊 SUMMARY');
    console.log('=' .repeat(60));
    console.log(`Total Conversations: ${conversations.length}`);
    console.log(`Total Messages: ${messages.length}`);
    console.log(`Total Contacts: ${contacts.length}`);
    console.log(`\nPhone Number Format Checked: ${phoneToCheck}, +${phoneToCheck}`);

    // 5. Check if data is synced in enromatics
    if (conversations.length > 0) {
      console.log('\n' + '=' .repeat(60));
      console.log('🔄 ENROMATICS SYNC STATUS');
      console.log('=' .repeat(60));
      
      conversations.forEach(conv => {
        console.log(`\nConversation: ${conv.conversationId}`);
        console.log(`Last Message Time: ${conv.lastMessageAt}`);
        console.log(`Check if this data is synced in enromatics via API`);
        console.log(`If NOT synced, you may need to manually trigger sync or check API call logs`);
      });
    }

    await mongoose.connection.close();
    console.log('\n✅ Check complete!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

checkChatHistory();
