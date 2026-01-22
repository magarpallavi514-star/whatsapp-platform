import mongoose from 'mongoose';
import whatsappService from './src/services/whatsappService.js';
import PhoneNumber from './src/models/PhoneNumber.js';

const MONGODB_URI = 'mongodb+srv://pixelsagency:Pm02072023@pixelsagency.664wxw1.mongodb.net/pixelswhatsapp';

async function sendMessage() {
  try {
    await mongoose.connect(MONGODB_URI);
    
    console.log('📤 FINAL TEST: Superadmin → Enromatics\n');
    
    // Get superadmin phone
    const superAdminPhone = await PhoneNumber.findOne({ 
      phoneNumberId: '889344924259692' 
    }).select('+accessToken');
    
    if (!superAdminPhone) {
      console.log('❌ Superadmin phone not found');
      process.exit(1);
    }
    
    console.log('✅ Superadmin Phone:');
    console.log('   Account:', superAdminPhone.accountId);
    console.log('   Phone ID:', superAdminPhone.phoneNumberId);
    console.log('   Active:', superAdminPhone.isActive);
    
    // Get enromatics phone
    const enromaticsPhone = await PhoneNumber.findOne({ 
      phoneNumberId: '1003427786179738' 
    });
    
    console.log('\n✅ Enromatics Phone:');
    console.log('   Account:', enromaticsPhone.accountId);
    console.log('   Phone ID:', enromaticsPhone.phoneNumberId);
    console.log('   Active:', enromaticsPhone.isActive);
    console.log('   Phone Number:', enromaticsPhone.phoneNumber);
    
    // Send message
    console.log('\n📤 Sending message from superadmin to Enromatics...\n');
    
    const result = await whatsappService.sendTextMessage(
      superAdminPhone.accountId,    // pixels_internal
      '889344924259692',            // superadmin phone
      '918087131777',               // enromatics phone (without +)
      '✅ Live Chat Test Message from ReplysSys Superadmin to Enromatics! If you see this, everything is working! 🚀',
      { test: true, timestamp: new Date().toISOString() }
    );
    
    console.log('✅ Message Sent!');
    console.log('WhatsApp Response:');
    console.log(JSON.stringify(result, null, 2));
    
    if (result.messages && result.messages[0]) {
      console.log('\n✅ SUCCESS!');
      console.log('Message ID:', result.messages[0].id);
      console.log('\n📲 Check the Enromatics live chat in 10-15 seconds!');
      console.log('https://www.replysys.com/dashboard/chat');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

sendMessage();
