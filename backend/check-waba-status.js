import mongoose from 'mongoose';
import PhoneNumber from './src/models/PhoneNumber.js';
import Account from './src/models/Account.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkWABAStatus() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log('\n' + '═'.repeat(70));
    console.log('🔗 WABA CONNECTION STATUS');
    console.log('═'.repeat(70));

    const phones = await PhoneNumber.find({}, 'phoneNumberId wabaId displayPhone accountId isActive');
    
    console.log(`\n✅ Found ${phones.length} phone(s) configured\n`);

    for (const phone of phones) {
      const account = await Account.findOne({ 
        $or: [
          { _id: phone.accountId },
          { accountId: phone.accountId }
        ]
      }).select('name email');

      console.log(`📱 Phone: ${phone.displayPhone || phone.phoneNumberId}`);
      console.log(`   phoneNumberId: ${phone.phoneNumberId}`);
      console.log(`   wabaId: ${phone.wabaId}`);
      console.log(`   accountId: ${phone.accountId}`);
      console.log(`   account: ${account ? account.name + ' (' + account.email + ')' : '❌ NOT FOUND'}`);
      console.log(`   isActive: ${phone.isActive ? '✅ CONNECTED' : '❌ DISCONNECTED'}`);
      console.log('');
    }

    console.log('═'.repeat(70));
    process.exit(0);

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

checkWABAStatus();
