import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Account from './src/models/Account.js';
import PhoneNumber from './src/models/PhoneNumber.js';

dotenv.config();

async function fixWabaMapping() {
  try {
    console.log('\n' + '='.repeat(70));
    console.log('🔧 FIX: Populate WABA IDs in Accounts');
    console.log('='.repeat(70));
    
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pixelswhatsapp');
    console.log('✅ MongoDB connected\n');
    
    // Find all phone numbers with WABA ID
    const phones = await PhoneNumber.find({ wabaId: { $exists: true, $ne: null } });
    console.log(`📞 Found ${phones.length} phone numbers with WABA ID\n`);
    
    let fixed = 0;
    for (const phone of phones) {
      const updated = await Account.findByIdAndUpdate(
        phone.accountId,
        { $set: { wabaId: phone.wabaId } },
        { new: true }
      );
      
      if (updated) {
        console.log(`✅ Account "${updated.name}" → WABA ID: ${phone.wabaId}`);
        fixed++;
      }
    }
    
    console.log(`\n🎉 Fixed ${fixed} accounts with WABA IDs`);
    console.log('='.repeat(70) + '\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

fixWabaMapping();
