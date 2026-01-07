import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const phoneNumberSchema = new mongoose.Schema({}, { strict: false });
const conversationSchema = new mongoose.Schema({}, { strict: false });
const accountSchema = new mongoose.Schema({}, { strict: false });

const PhoneNumber = mongoose.model('PhoneNumber', phoneNumberSchema, 'phonenumbers');
const Conversation = mongoose.model('Conversation', conversationSchema, 'conversations');
const Account = mongoose.model('Account', accountSchema, 'accounts');

const main = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const account = 'mpiyush2727@gmail.com';
    
    // Check Account record
    console.log('\n🔍 CHECKING ACCOUNT:', account);
    const accountRecord = await Account.findOne({ email: account });
    if (accountRecord) {
      console.log('✅ Account found');
      console.log('   Status:', accountRecord.status);
      console.log('   Created:', accountRecord.createdAt);
    } else {
      console.log('❌ Account not found');
    }
    
    // Check PhoneNumbers
    console.log('\n📞 CHECKING PHONE NUMBERS:');
    const phones = await PhoneNumber.find({ accountId: account });
    if (phones.length === 0) {
      console.log('❌ NO phone numbers found!');
    } else {
      phones.forEach(p => {
        console.log(`✅ ${p.phoneNumberId}`);
        console.log(`   Display: ${p.displayPhone}`);
        console.log(`   Active: ${p.isActive}`);
        console.log(`   WABA ID: ${p.wabaId}`);
        console.log(`   Token Expiry: ${p.accessTokenExpiry || 'Not set'}`);
      });
    }
    
    // Check Conversations
    console.log('\n💬 CHECKING CONVERSATIONS:');
    const convs = await Conversation.find({ accountId: account });
    console.log(`Found ${convs.length} conversations`);
    if (convs.length > 0) {
      const phoneIds = [...new Set(convs.map(c => c.phoneNumberId))];
      console.log(`Unique phone numbers used: ${phoneIds.join(', ')}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

main();
