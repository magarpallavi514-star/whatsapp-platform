import PhoneNumber from './src/models/PhoneNumber.js';
import Account from './src/models/Account.js';
import mongoose from 'mongoose';

async function checkEnromaticsWebhook() {
  try {
    console.log('🔍 Checking Enromatics webhook configuration...\n');
    
    // Find Enromatics account
    const account = await Account.findOne({ email: 'info@enromatics.com' });
    if (!account) {
      console.error('❌ Account not found');
      process.exit(1);
    }
    
    console.log('📊 Account Found:');
    console.log('  Name:', account.name);
    console.log('  Email:', account.email);
    console.log('  AccountId:', account.accountId);
    console.log('  _id:', account._id);
    
    // Find phone numbers
    console.log('\n📱 Phone Numbers:\n');
    
    // Try both accountId formats
    const phones1 = await PhoneNumber.find({ accountId: account._id });
    const phones2 = await PhoneNumber.find({ accountId: account.accountId });
    const allPhones = [...phones1, ...phones2];
    const uniquePhones = allPhones.filter((phone, idx, arr) => 
      idx === arr.findIndex(p => p._id.toString() === phone._id.toString())
    );
    
    if (uniquePhones.length === 0) {
      console.log('❌ NO PHONE NUMBERS CONFIGURED');
      console.log('\nTo enable webhooks, you need to:');
      console.log('1. Create a WhatsApp Business Account (WABA)');
      console.log('2. Add at least one phone number');
      console.log('3. Get phoneNumberId and wabaId from Meta');
      console.log('4. Get accessToken for API calls');
      process.exit(1);
    }
    
    uniquePhones.forEach((phone, idx) => {
      console.log(`${idx + 1}. Phone Number:`);
      console.log(`   phoneNumberId: ${phone.phoneNumberId}`);
      console.log(`   wabaId: ${phone.wabaId}`);
      console.log(`   displayPhone: ${phone.displayPhone || 'N/A'}`);
      console.log(`   displayName: ${phone.displayName || 'N/A'}`);
      console.log(`   isActive: ${phone.isActive}`);
      console.log(`   accessToken: ${phone.accessToken ? '✅ CONFIGURED' : '❌ MISSING'}`);
      console.log(`   verifiedAt: ${phone.verifiedAt || 'Not verified'}`);
      console.log('');
    });
    
    // Check webhook configuration
    console.log('🔐 Webhook Configuration:\n');
    console.log('Verification Token (META_VERIFY_TOKEN):', process.env.META_VERIFY_TOKEN || 'pixels_webhook_secret_2025');
    console.log('Webhook URL:', `${process.env.BACKEND_URL || 'http://localhost:5050'}/api/webhooks/whatsapp`);
    console.log('\n✅ Configuration check complete');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

// Connect and run
mongoose.connect('mongodb+srv://pixels:bnVtYmVyMjU5OA@pixelswhatsapp.7u1vk.mongodb.net/pixelswhatsapp?retryWrites=true&w=majority', {
  serverSelectionTimeoutMS: 5000
}).then(() => {
  checkEnromaticsWebhook();
}).catch(err => {
  console.error('❌ DB Connection error:', err.message);
  process.exit(1);
});
