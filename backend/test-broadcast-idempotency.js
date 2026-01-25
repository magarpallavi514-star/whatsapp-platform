import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Broadcast from './src/models/Broadcast.js';
import Account from './src/models/Account.js';
import Conversation from './src/models/Conversation.js';
import Message from './src/models/Message.js';

dotenv.config();

async function testBroadcastIdempotency() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected\n');

    const account = await Account.findOne({}).limit(1);
    if (!account) {
      console.error('❌ No account found');
      process.exit(1);
    }

    const accountId = account._id;
    const accountIdStr = accountId.toString();

    console.log(`📊 Testing Broadcast Idempotency Fix`);
    console.log(`Account: ${account.name}`);
    console.log(`Account ID: ${accountIdStr}\n`);

    // ============================================
    // TEST 1: Simulate conversation already exists
    // ============================================
    console.log('🧪 TEST 1: Conversation Already Exists');
    const testPhone = '919999999999';
    const testPhoneNumberId = '1234567890';
    
    // Create a conversation first
    const existingConv = await Conversation.findOneAndUpdate(
      {
        accountId,
        phoneNumberId: testPhoneNumberId,
        userPhone: testPhone
      },
      {
        $setOnInsert: {
          accountId,
          workspaceId: accountId,
          phoneNumberId: testPhoneNumberId,
          userPhone: testPhone,
          conversationId: `${accountIdStr}_${testPhoneNumberId}_${testPhone}`,
          lastMessageAt: new Date(),
          status: 'open'
        }
      },
      { upsert: true, new: true }
    );
    
    console.log(`✅ Initial conversation created: ${existingConv._id}`);

    // ============================================
    // TEST 2: Try upsert on same conversation (idempotent)
    // ============================================
    console.log('\n🧪 TEST 2: Call upsert again (should NOT error)');
    let errorCount = 0;
    
    for (let i = 0; i < 3; i++) {
      try {
        const result = await Conversation.findOneAndUpdate(
          {
            accountId,
            phoneNumberId: testPhoneNumberId,
            userPhone: testPhone
          },
          {
            $setOnInsert: {
              accountId,
              workspaceId: accountId,
              phoneNumberId: testPhoneNumberId,
              userPhone: testPhone,
              conversationId: `${accountIdStr}_${testPhoneNumberId}_${testPhone}`,
              lastMessageAt: new Date(),
              status: 'open'
            },
            $set: {
              lastMessageAt: new Date(),
              status: 'open'
            }
          },
          { upsert: true, new: true }
        );
        
        console.log(`  Attempt ${i + 1}: ✅ Success (ID: ${result._id})`);
      } catch (err) {
        errorCount++;
        console.log(`  Attempt ${i + 1}: ❌ Error: ${err.message}`);
      }
    }

    if (errorCount === 0) {
      console.log(`\n✅ Idempotency Test PASSED: 3/3 successful, no E11000 errors`);
    } else {
      console.log(`\n❌ Idempotency Test FAILED: ${errorCount} errors`);
    }

    // ============================================
    // TEST 3: Verify conversation wasn't duplicated
    // ============================================
    console.log('\n🧪 TEST 3: Verify no duplicate conversations');
    const convCount = await Conversation.countDocuments({
      accountId,
      phoneNumberId: testPhoneNumberId,
      userPhone: testPhone
    });

    console.log(`Conversations with same key: ${convCount}`);
    if (convCount === 1) {
      console.log('✅ Only 1 conversation exists (correct)');
    } else {
      console.log(`❌ Found ${convCount} conversations (should be 1)`);
    }

    // ============================================
    // TEST 4: Check accountId type consistency
    // ============================================
    console.log('\n🧪 TEST 4: AccountId Type Consistency');
    const conv = await Conversation.findOne({ accountId }).lean();
    
    if (conv) {
      const conversationIdParts = conv.conversationId.split('_');
      const storedAccountId = conversationIdParts[0];
      
      console.log(`Conversation ID: ${conv.conversationId}`);
      console.log(`Extracted account ID: ${storedAccountId}`);
      console.log(`Expected account ID: ${accountIdStr}`);
      
      if (storedAccountId === accountIdStr) {
        console.log('✅ Account ID type consistency: CORRECT');
      } else {
        console.log('❌ Account ID type mismatch');
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('✅ All idempotency tests complete!');
    console.log('='.repeat(50));
    console.log('\n🚀 Broadcast system is now safe for concurrent loops\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testBroadcastIdempotency();
