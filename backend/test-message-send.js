import mongoose from 'mongoose';
import whatsappService from './src/services/whatsappService.js';
import PhoneNumber from './src/models/PhoneNumber.js';

const MONGODB_URI = 'mongodb+srv://pixelsagency:Pm02072023@pixelsagency.664wxw1.mongodb.net/pixelswhatsapp';

async function sendTestMessage() {
  try {
    await mongoose.connect(MONGODB_URI);
    
    // Get superadmin phone config
    const superAdminPhone = await PhoneNumber.findOne({ 
      phoneNumberId: '889344924259692',
      isActive: true 
    }).select('+accessToken');
    
    if (!superAdminPhone) {
      console.log('❌ Superadmin phone not found');
      process.exit(1);
    }
    
    console.log('✅ Found superadmin phone:', superAdminPhone.phoneNumberId);
    console.log('Account:', superAdminPhone.accountId);
    
    // Send message from superadmin to enromatics
    console.log('\n📤 Sending test message...');
    const result = await whatsappService.sendTextMessage(
      superAdminPhone.accountId,           // accountId
      '889344924259692',                   // phoneNumberId (superadmin)
      '918087131777',                      // recipientPhone (enromatics, without +)
      'Test message from Replysys superadmin to Enromatics',
      { test: true, timestamp: new Date() }
    );
    
    console.log('\n✅ Message sent successfully!');
    console.log('Message ID:', result.messages?.[0]?.id);
    console.log('Status:', result.messages?.[0]?.message_status);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

sendTestMessage();
