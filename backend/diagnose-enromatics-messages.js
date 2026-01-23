import Message from './src/models/Message.js';
import Conversation from './src/models/Conversation.js';
import PhoneNumber from './src/models/PhoneNumber.js';
import Account from './src/models/Account.js';
import mongoose from 'mongoose';

async function diagnoseEnromaticsChat() {
  try {
    await mongoose.connect('mongodb+srv://pixels:bnVtYmVyMjU5OA@pixelswhatsapp.7u1vk.mongodb.net/pixelswhatsapp?retryWrites=true&w=majority', {
      serverSelectionTimeoutMS: 5000
    });
    
    console.log('\n🔍 DIAGNOSING ENROMATICS MESSAGE FLOW\n');
    console.log('═'.repeat(60));
    
    // 1. Check Phone Configuration
    console.log('\n1️⃣  PHONE CONFIGURATION');
    console.log('─'.repeat(60));
    
    const phone = await PhoneNumber.findOne({ phoneNumberId: '1003427786179738' }).select('+accessToken');
    if (!phone) {
      console.log('❌ Phone NOT found in database');
      process.exit(1);
    }
    
    console.log('✅ Phone found:');
    console.log(`   phoneNumberId: ${phone.phoneNumberId}`);
    console.log(`   wabaId: ${phone.wabaId}`);
    console.log(`   displayPhone: ${phone.displayPhone}`);
    console.log(`   accountId: ${phone.accountId}`);
    console.log(`   isActive: ${phone.isActive}`);
    console.log(`   accessToken: ${phone.accessToken ? '✅ SET' : '❌ MISSING'}`);
    
    // 2. Check Account Linked to Phone
    console.log('\n2️⃣  ACCOUNT LINKING');
    console.log('─'.repeat(60));
    
    const account = await Account.findOne({ $or: [
      { _id: phone.accountId },
      { accountId: phone.accountId.toString ? phone.accountId.toString() : phone.accountId }
    ]});
    
    if (!account) {
      console.log('❌ Account NOT found for this phone');
      console.log(`   Searched for: ${phone.accountId}`);
      process.exit(1);
    }
    
    console.log('✅ Account found:');
    console.log(`   name: ${account.name}`);
    console.log(`   email: ${account.email}`);
    console.log(`   accountId: ${account.accountId}`);
    console.log(`   type: ${account.type}`);
    
    // 3. Check Messages in Database
    console.log('\n3️⃣  MESSAGES IN DATABASE');
    console.log('─'.repeat(60));
    
    const messageCount1 = await Message.countDocuments({ phoneNumberId: '1003427786179738' });
    const messageCount2 = await Message.countDocuments({ accountId: account.accountId });
    const messageCount3 = await Message.countDocuments({ accountId: phone.accountId });
    
    console.log(`✅ Messages with phoneNumberId '1003427786179738': ${messageCount1}`);
    console.log(`✅ Messages with accountId '${account.accountId}': ${messageCount2}`);
    console.log(`✅ Messages with accountId (as ObjectId): ${messageCount3}`);
    
    const totalMessages = await Message.find({ phoneNumberId: '1003427786179738' })
      .sort({ createdAt: -1 })
      .limit(5);
    
    if (totalMessages.length > 0) {
      console.log(`\n📨 Latest 5 messages:`);
      totalMessages.forEach((msg, i) => {
        console.log(`   ${i+1}. From: ${msg.recipientPhone}, Time: ${new Date(msg.createdAt).toLocaleString()}`);
        console.log(`      Text: ${msg.content?.text?.substring(0, 50) || '[Media]'}`);
        console.log(`      Direction: ${msg.direction}`);
      });
    } else {
      console.log('⚠️  No messages found for this phone number');
    }
    
    // 4. Check Conversations
    console.log('\n4️⃣  CONVERSATIONS');
    console.log('─'.repeat(60));
    
    const convCount = await Conversation.countDocuments({ phoneNumberId: '1003427786179738' });
    console.log(`✅ Total conversations: ${convCount}`);
    
    const conversations = await Conversation.find({ phoneNumberId: '1003427786179738' })
      .sort({ lastMessageTime: -1 })
      .limit(3);
    
    if (conversations.length > 0) {
      console.log(`\n📭 Latest 3 conversations:`);
      conversations.forEach((conv, i) => {
        console.log(`   ${i+1}. ${conv.participantPhone} (${conv.participantName})`);
        console.log(`      Last message: ${new Date(conv.lastMessageTime).toLocaleString()}`);
        console.log(`      Messages: ${conv.messageCount || 0}`);
      });
    } else {
      console.log('⚠️  No conversations found');
    }
    
    // 5. Check Message Flow Issue
    console.log('\n5️⃣  POTENTIAL ISSUES CHECKLIST');
    console.log('─'.repeat(60));
    
    const issues = [];
    
    if (!phone.isActive) issues.push('❌ Phone number is INACTIVE');
    if (!phone.accessToken) issues.push('❌ Access token missing - cannot receive messages');
    if (!account) issues.push('❌ No account linked to phone');
    if (messageCount1 === 0 && messageCount2 === 0) issues.push('⚠️  No messages in database - webhook may not be receiving');
    
    if (issues.length === 0) {
      console.log('✅ All systems appear correct');
      console.log('\nIf messages still not showing:');
      console.log('   1. Check webhook is receiving (see server logs)');
      console.log('   2. Check frontend is listening to Socket.io');
      console.log('   3. Try refreshing browser');
      console.log('   4. Check browser console for errors');
    } else {
      console.log('\nIssues found:');
      issues.forEach(issue => console.log(`   ${issue}`));
    }
    
    console.log('\n' + '═'.repeat(60));
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

diagnoseEnromaticsChat();
