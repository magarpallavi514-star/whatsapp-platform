import mongoose from 'mongoose';
import whatsappService from './src/services/whatsappService.js';
import PhoneNumber from './src/models/PhoneNumber.js';

const MONGODB_URI = 'mongodb+srv://pixelsagency:Pm02072023@pixelsagency.664wxw1.mongodb.net/pixelswhatsapp';

async function sendTestMessage() {
  try {
    await mongoose.connect(MONGODB_URI);
    
    console.log('📤 Sending test message...\n');
    
    // Get superadmin phone
    const superAdminPhone = await PhoneNumber.findOne({ 
      phoneNumberId: '889344924259692' 
    }).select('+accessToken');
    
    console.log('✅ Using superadmin phone:', superAdminPhone.phoneNumberId);
    console.log('   Account:', superAdminPhone.accountId);
    
    // Send test message
    const result = await whatsappService.sendTextMessage(
      superAdminPhone.accountId,  // pixels_internal
      '889344924259692',
      '918087131777',              // Enromatics phone
      '✅ Test message from ReplysSys! Check live chat now!',
      { test: true }
    );
    
    console.log('\n✅ Message sent to WhatsApp API!');
    console.log('Response:', JSON.stringify(result, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

sendTestMessage();
