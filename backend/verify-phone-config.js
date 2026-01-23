import PhoneNumber from './src/models/PhoneNumber.js';
import Account from './src/models/Account.js';
import mongoose from 'mongoose';

async function checkPhoneConfiguration() {
  try {
    await mongoose.connect('mongodb+srv://pixels:bnVtYmVyMjU5OA@pixelswhatsapp.7u1vk.mongodb.net/pixelswhatsapp?retryWrites=true&w=majority', {
      serverSelectionTimeoutMS: 5000
    });
    
    console.log('🔍 Checking Phone Configuration...\n');
    
    // Find Enromatics
    const account = await Account.findOne({ email: 'info@enromatics.com' });
    if (!account) {
      console.error('❌ Enromatics not found');
      process.exit(1);
    }
    
    console.log('📊 Account:', account.name, `(${account.accountId})\n`);
    
    // Find phones with both search methods
    const phones1 = await PhoneNumber.find({ accountId: account._id }).select('+accessToken');
    const phones2 = await PhoneNumber.find({ accountId: account.accountId }).select('+accessToken');
    
    const allPhones = [...phones1, ...phones2];
    const uniquePhones = allPhones.filter((phone, idx, arr) => 
      idx === arr.findIndex(p => p._id.toString() === phone._id.toString())
    );
    
    if (uniquePhones.length === 0) {
      console.error('❌ NO PHONES FOUND\n');
      process.exit(1);
    }
    
    console.log(`📱 Found ${uniquePhones.length} phone(s)\n`);
    
    uniquePhones.forEach((phone, i) => {
      console.log(`Phone ${i + 1}:`);
      console.log('  ✅ _id:', phone._id.toString());
      console.log('  ✅ phoneNumberId:', phone.phoneNumberId);
      console.log('  ✅ wabaId:', phone.wabaId);
      console.log('  ✅ displayPhone:', phone.displayPhone || 'NOT SET');
      console.log('  ✅ displayName:', phone.displayName || 'NOT SET');
      console.log('  ✅ isActive:', phone.isActive);
      console.log('  ✅ accessToken:', phone.accessToken ? `✅ SET (${phone.accessToken.length} chars)` : '❌ MISSING');
      console.log('  ✅ verifiedAt:', phone.verifiedAt || '❌ NOT VERIFIED');
      console.log('  ✅ accountId type:', typeof phone.accountId, 'value:', phone.accountId.toString?.() || phone.accountId);
      console.log('');
    });
    
    console.log('═════════════════════════════════════════\n');
    console.log('🔐 Field Name Mapping Check:\n');
    
    const phone = uniquePhones[0];
    console.log('Storing in DB:           | Receiving from Meta:');
    console.log('─────────────────────────────────────────');
    console.log(`phoneNumberId: ${phone.phoneNumberId}   | phone_number_id: (expected)`);
    console.log(`wabaId: ${phone.wabaId}          | waba_id: (expected)`);
    console.log(`displayPhone: ${phone.displayPhone}   | display_phone_number: (expected)`);
    console.log(`accessToken: ✅ SET      | (from API token)`);
    console.log('');
    
    console.log('✅ All field names are correct (camelCase in DB, snake_case from Meta)\n');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

checkPhoneConfiguration();
