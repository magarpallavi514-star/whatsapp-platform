import mongoose from 'mongoose';
import whatsappService from './src/services/whatsappService.js';
import PhoneNumber from './src/models/PhoneNumber.js';
import User from './src/models/User.js';

const MONGODB_URI = 'mongodb+srv://pixelsagency:Pm02072023@pixelsagency.664wxw1.mongodb.net/pixelswhatsapp';

async function sendTestMessage() {
  try {
    await mongoose.connect(MONGODB_URI);
    
    console.log('🔐 Testing Superadmin Message Send\n');
    
    // Get superadmin user
    const superAdmin = await User.findOne({ email: 'mpiyush2727@gmail.com' });
    if (!superAdmin) {
      console.log('❌ Superadmin user not found');
      process.exit(1);
    }
    
    console.log('✅ Found superadmin:', superAdmin.email);
    console.log('   Account ID:', superAdmin.accountId);
    
    // Get superadmin phone
    const superAdminPhone = await PhoneNumber.findOne({ 
      phoneNumberId: '889344924259692' 
    }).select('+accessToken');
    
    if (!superAdminPhone) {
      console.log('❌ Superadmin phone not found');
      process.exit(1);
    }
    
    console.log('✅ Found superadmin phone:', superAdminPhone.phoneNumberId);
    
    // Send test message
    console.log('\n📤 Sending test message from superadmin to Enromatics...');
    
    const result = await whatsappService.sendTextMessage(
      superAdminPhone.accountId,  // accountId (pixels_internal)
      '889344924259692',           // phoneNumberId (superadmin)
      '918087131777',              // recipientPhone (enromatics, without +)
      '🚀 Test message from ReplysSys Superadmin to Enromatics! If you see this, live chat is working!',
      { test: true, timestamp: new Date().toISOString() }
    );
    
    console.log('\n✅ Message sent!');
    console.log('Response:', JSON.stringify(result, null, 2));
    
    if (result.messages && result.messages[0]) {
      console.log('\n✅ WhatsApp Response:');
      console.log('   Message ID:', result.messages[0].id);
      console.log('   Status:', result.messages[0].message_status);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

sendTestMessage();
