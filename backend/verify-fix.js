import mongoose from 'mongoose';
import Account from './src/models/Account.js';
import Conversation from './src/models/Conversation.js';
import PhoneNumber from './src/models/PhoneNumber.js';

const MONGO_URI = process.env.MONGODB_URI;

async function verify() {
  try {
    await mongoose.connect(MONGO_URI);

    console.log('\n✅ VERIFYING LIVE CHAT FIX\n');

    // Get accounts
    const superadmin = await Account.findOne({ accountId: 'pixels_internal' });
    const enromatics = await Account.findOne({ accountId: 'eno_2600003' });

    // TEST 1: Load Superadmin conversations
    console.log('🧪 TEST 1: SUPERADMIN CONVERSATIONS');
    console.log(`  Account ID: ${superadmin._id}\n`);
    
    const superadminConvs = await Conversation.find({ 
      accountId: superadmin._id 
    }).limit(3);
    
    console.log(`  ✅ Found ${superadminConvs.length} conversations`);
    if (superadminConvs.length > 0) {
      for (const conv of superadminConvs) {
        console.log(`\n    �� Conversation: ${conv.userPhone}`);
        
        // Test phone config query
        const phoneConfig = await PhoneNumber.findOne({
          accountId: conv.accountId,
          phoneNumberId: conv.phoneNumberId,
          isActive: true
        });
        
        if (phoneConfig) {
          console.log(`    ✅ Phone config found: ${phoneConfig.phoneNumberId}`);
          console.log(`    ✅ Access token exists: ${!!phoneConfig.accessToken}`);
        } else {
          console.log(`    ❌ Phone config NOT found`);
        }
      }
    }

    // TEST 2: Load Enromatics conversations
    console.log('\n\n🧪 TEST 2: ENROMATICS CONVERSATIONS');
    console.log(`  Account ID: ${enromatics._id}\n`);
    
    const enromaticsConvs = await Conversation.find({ 
      accountId: enromatics._id 
    }).limit(3);
    
    console.log(`  ✅ Found ${enromaticsConvs.length} conversations`);
    if (enromaticsConvs.length > 0) {
      for (const conv of enromaticsConvs) {
        console.log(`\n    📱 Conversation: ${conv.userPhone}`);
        
        const phoneConfig = await PhoneNumber.findOne({
          accountId: conv.accountId,
          phoneNumberId: conv.phoneNumberId,
          isActive: true
        });
        
        if (phoneConfig) {
          console.log(`    ✅ Phone config found: ${phoneConfig.phoneNumberId}`);
          console.log(`    ✅ Access token exists: ${!!phoneConfig.accessToken}`);
        } else {
          console.log(`    ❌ Phone config NOT found`);
        }
      }
    } else {
      console.log(`  ⚠️  No conversations (expected - new account)`);
    }

    // TEST 3: Verify phone configs exist for both accounts
    console.log('\n\n🧪 TEST 3: PHONE CONFIGURATIONS');
    const phones = await PhoneNumber.find({});
    
    phones.forEach(phone => {
      const isSuper = phone.accountId.toString() === superadmin._id.toString();
      const isEnro = phone.accountId.toString() === enromatics._id.toString();
      const accountName = isSuper ? 'Superadmin' : isEnro ? 'Enromatics' : 'Unknown';
      
      console.log(`\n  ${accountName} (${phone.phoneNumberId})`);
      console.log(`    accountId type: ${phone.accountId.constructor.name}`);
      console.log(`    Active: ${phone.isActive ? '✅' : '❌'}`);
      console.log(`    Access Token: ${phone.accessToken ? '✅ Encrypted' : '❌ Missing'}`);
    });

    // TEST 4: Verify schema type
    console.log('\n\n🧪 TEST 4: SCHEMA VERIFICATION');
    const testConv = superadminConvs[0];
    if (testConv) {
      console.log(`  Conversation accountId type in memory: ${testConv.accountId.constructor.name}`);
      console.log(`  Conversation accountId value: ${testConv.accountId}`);
    }

    console.log('\n✅ VERIFICATION COMPLETE\n');
    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

verify();
