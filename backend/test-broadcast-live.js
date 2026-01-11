import mongoose from 'mongoose';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const phoneNumberSchema = new mongoose.Schema({}, { strict: false });
const broadcastSchema = new mongoose.Schema({}, { strict: false });
const messageSchema = new mongoose.Schema({}, { strict: false });

const PhoneNumber = mongoose.model('PhoneNumber', phoneNumberSchema);
const Broadcast = mongoose.model('Broadcast', broadcastSchema);
const Message = mongoose.model('Message', messageSchema);

const GRAPH_API_URL = 'https://graph.facebook.com/v21.0';

async function testBroadcast() {
  try {
    console.log('\n' + '═'.repeat(70));
    console.log('🚀 TESTING BROADCAST WITH YOUR MOBILE NUMBER');
    console.log('═'.repeat(70) + '\n');

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get user account
    const accountId = '695a15a5c526dbe7c085ece2';
    const phoneNumberId = '889344924259692';
    const testNumber = '919766504856'; // Format: 91 + your number

    console.log('📋 TEST SETUP:');
    console.log(`   Account ID: ${accountId}`);
    console.log(`   Phone Number ID: ${phoneNumberId}`);
    console.log(`   Test Recipient: ${testNumber}`);
    console.log(`   Message: Test broadcast - working now! ✅\n`);

    // Get phone config
    console.log('🔍 STEP 1: Getting phone configuration...');
    const phoneConfig = await PhoneNumber.findOne({
      accountId,
      phoneNumberId,
      isActive: true
    }).select('+accessToken');

    if (!phoneConfig) {
      console.log('❌ Phone configuration not found!');
      process.exit(1);
    }

    console.log(`   ✅ Phone found`);
    console.log(`   ✅ Active: ${phoneConfig.isActive}`);
    console.log(`   ✅ Token exists: ${phoneConfig.accessToken ? 'Yes' : 'No'}\n`);

    // Send test message
    console.log('🚀 STEP 2: Sending test message to Meta API...');
    
    const messageBody = 'Test broadcast - working now! ✅ This is from your WhatsApp platform.';
    
    try {
      const response = await axios.post(
        `${GRAPH_API_URL}/${phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: testNumber,
          type: 'text',
          text: { body: messageBody }
        },
        {
          headers: {
            'Authorization': `Bearer ${phoneConfig.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('   ✅ API Response received\n');
      console.log('📱 MESSAGE SENT SUCCESSFULLY!\n');
      
      const messageId = response.data.messages[0].id;
      
      console.log('✨ DETAILS:');
      console.log(`   Message ID: ${messageId}`);
      console.log(`   Recipient: ${testNumber}`);
      console.log(`   Status: SENT`);
      console.log(`   Time: ${new Date().toISOString()}\n`);

      // Save to database
      console.log('💾 STEP 3: Saving to database...');
      const message = new Message({
        accountId,
        phoneNumberId,
        messageId,
        waMessageId: messageId,
        recipientPhone: testNumber,
        messageType: 'text',
        content: { text: messageBody },
        status: 'sent',
        direction: 'outbound',
        sentAt: new Date(),
        campaign: 'broadcast_test'
      });

      await message.save();
      console.log('   ✅ Message logged in database\n');

      console.log('═'.repeat(70));
      console.log('🎉 BROADCAST TEST PASSED!');
      console.log('═'.repeat(70));
      console.log('\n✅ Your broadcast system is working perfectly!\n');
      console.log('📝 Next Steps:');
      console.log('   1. Check your phone for the message');
      console.log('   2. You should receive: "Test broadcast - working now! ✅"');
      console.log('   3. If received → System is fully operational\n');

      process.exit(0);

    } catch (error) {
      console.error('   ❌ Meta API Error\n');
      console.error('ERROR DETAILS:');
      console.error(`   Status: ${error.response?.status}`);
      console.error(`   Error Code: ${error.response?.data?.error?.code}`);
      console.error(`   Error Message: ${error.response?.data?.error?.message}`);
      
      if (error.response?.data?.error?.error_data) {
        console.error(`   Details: ${JSON.stringify(error.response.data.error.error_data)}`);
      }

      console.log('\n❌ BROADCAST TEST FAILED\n');
      console.log('Possible Reasons:');
      console.log('   1. Invalid phone number format');
      console.log('   2. Phone number not in Meta whitelist');
      console.log('   3. Access token expired');
      console.log('   4. Meta rate limit exceeded\n');

      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

testBroadcast();
