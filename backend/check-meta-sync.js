import mongoose from 'mongoose';
import PhoneNumber from './src/models/PhoneNumber.js';
import Message from './src/models/Message.js';
import Conversation from './src/models/Conversation.js';
import Account from './src/models/Account.js';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

async function checkMetaSync() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });

    console.log('\n' + '═'.repeat(70));
    console.log('🔍 META WABA SYNC CHECK');
    console.log('═'.repeat(70));

    // 1. Check Phone Configuration
    console.log('\n1️⃣  PHONE CONFIGURATION IN DATABASE');
    console.log('─'.repeat(70));

    const phones = await PhoneNumber.find({}, 'phoneNumberId wabaId displayPhone accountId isActive accessToken createdAt');
    
    if (phones.length === 0) {
      console.log('❌ NO PHONE NUMBERS CONFIGURED!');
      process.exit(1);
    }

    for (const phone of phones) {
      console.log(`\n📱 Phone: ${phone.displayPhone || phone.phoneNumberId}`);
      console.log(`   phoneNumberId: ${phone.phoneNumberId}`);
      console.log(`   wabaId: ${phone.wabaId}`);
      console.log(`   accountId: ${phone.accountId}`);
      console.log(`   isActive: ${phone.isActive ? '✅ YES' : '❌ NO'}`);
      console.log(`   hasToken: ${phone.accessToken ? '✅ YES' : '❌ NO'}`);
      console.log(`   createdAt: ${new Date(phone.createdAt).toLocaleString()}`);

      // Check account exists
      const account = await Account.findOne({ 
        $or: [
          { _id: phone.accountId },
          { accountId: phone.accountId }
        ]
      });
      console.log(`   accountExists: ${account ? '✅ YES' : '❌ NO'}`);

      // 2. Check Messages in Database
      console.log(`\n   📨 Messages for this phone:`);
      const messageCount = await Message.countDocuments({ phoneNumberId: phone.phoneNumberId });
      console.log(`       Total: ${messageCount}`);

      if (messageCount > 0) {
        const latestMessages = await Message.find({ phoneNumberId: phone.phoneNumberId })
          .sort({ createdAt: -1 })
          .limit(3)
          .select('content direction createdAt recipientPhone');
        
        console.log(`       Latest 3 messages:`);
        latestMessages.forEach((msg, i) => {
          console.log(`         ${i + 1}. [${msg.direction}] From: ${msg.recipientPhone}`);
          console.log(`            Time: ${new Date(msg.createdAt).toLocaleString()}`);
          if (msg.content?.text) {
            console.log(`            Text: ${msg.content.text.substring(0, 50)}...`);
          }
        });
      } else {
        console.log(`       ⚠️  No messages received yet`);
      }

      // 3. Check Conversations
      console.log(`\n   💬 Conversations for this phone:`);
      const convCount = await Conversation.countDocuments({ phoneNumberId: phone.phoneNumberId });
      console.log(`       Total: ${convCount}`);

      if (convCount > 0) {
        const latestConv = await Conversation.findOne({ phoneNumberId: phone.phoneNumberId })
          .sort({ lastMessageAt: -1 })
          .select('userPhone userName lastMessageAt lastMessagePreview unreadCount');
        
        console.log(`       Latest conversation:`);
        console.log(`         Phone: ${latestConv.userPhone}`);
        console.log(`         Name: ${latestConv.userName || 'Unknown'}`);
        console.log(`         Last message: ${new Date(latestConv.lastMessageAt).toLocaleString()}`);
        console.log(`         Preview: ${latestConv.lastMessagePreview?.substring(0, 50) || '[No preview]'}`);
        console.log(`         Unread: ${latestConv.unreadCount}`);
      } else {
        console.log(`       ⚠️  No conversations created yet`);
      }

      // 4. Check Meta Connectivity (if token exists)
      if (phone.accessToken && phone.phoneNumberId) {
        console.log(`\n   🔗 META API CONNECTIVITY TEST:`);
        try {
          const response = await axios.get(
            `https://graph.facebook.com/v21.0/${phone.phoneNumberId}`,
            {
              headers: {
                'Authorization': `Bearer ${phone.accessToken}`
              }
            }
          );

          console.log(`       ✅ CONNECTED TO META`);
          console.log(`       Status: ${response.data.status || 'active'}`);
          console.log(`       Quality: ${response.data.quality_rating || 'not available'}`);
        } catch (error) {
          if (error.response?.status === 401) {
            console.log(`       ❌ INVALID TOKEN - Token expired or revoked`);
          } else if (error.response?.status === 404) {
            console.log(`       ❌ PHONE NOT FOUND - Check phoneNumberId`);
          } else {
            console.log(`       ❌ CONNECTION FAILED - ${error.message}`);
          }
        }
      }
    }

    // 5. Summary
    console.log('\n' + '═'.repeat(70));
    console.log('📊 SUMMARY');
    console.log('═'.repeat(70));

    const activePhones = phones.filter(p => p.isActive).length;
    const phonesWithMessages = phones.filter(p => {
      const msgCount = Message.countDocuments({ phoneNumberId: p.phoneNumberId });
      return msgCount > 0;
    }).length;

    console.log(`\n✅ Total phones configured: ${phones.length}`);
    console.log(`✅ Active phones: ${activePhones}`);
    console.log(`📨 Phones with messages: ${phonesWithMessages} / ${phones.length}`);

    console.log('\n🎯 WHAT THIS MEANS:');
    if (phonesWithMessages === 0) {
      console.log('⚠️  No messages received from Meta yet');
      console.log('   CHECK:');
      console.log('   1. Is webhook configured in Meta App Dashboard?');
      console.log('   2. Did Meta verify your webhook endpoint?');
      console.log('   3. Have customers actually sent messages to this number?');
      console.log('   4. Check phone/WABA connection status in Meta');
    } else {
      console.log('✅ Messages ARE being received from Meta');
      console.log('   If not showing in chat: Check frontend is fetching conversations');
    }

    console.log('\n' + '═'.repeat(70));
    process.exit(0);

  } catch (err) {
    console.error('\n❌ Error:', err.message);
    process.exit(1);
  }
}

checkMetaSync();
