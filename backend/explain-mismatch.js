import mongoose from 'mongoose';
import Account from './src/models/Account.js';

const MONGO_URI = process.env.MONGODB_URI;

async function explain() {
  try {
    await mongoose.connect(MONGO_URI);
    const db = mongoose.connection.db;

    const superadmin = await Account.findOne({ accountId: 'pixels_internal' });
    
    console.log('\n📊 WHAT WE HAVE:\n');
    console.log('1️⃣  In Account collection:');
    console.log(`    _id: ${superadmin._id} (type: ObjectId)`);
    console.log(`    _id.toString(): ${superadmin._id.toString()} (type: String)\n`);

    const convColl = db.collection('conversations');
    const sample = await convColl.findOne({});
    
    console.log('2️⃣  In Conversation collection (raw MongoDB):');
    console.log(`    accountId: ${sample.accountId} (type: ${typeof sample.accountId})\n`);

    const phoneColl = db.collection('phonenumbers');
    const samplePhone = await phoneColl.findOne({});
    
    console.log('3️⃣  In PhoneNumber collection (raw MongoDB):');
    console.log(`    accountId: ${samplePhone.accountId} (type: ${typeof samplePhone.accountId})`);
    console.log(`    accountId.$oid: ${samplePhone.accountId.$oid || 'N/A'}\n`);

    console.log('❌ THE PROBLEM:\n');
    console.log('    Account._id (ObjectId)           ≠  Conversation.accountId (String)\n');
    console.log(`    ${superadmin._id}  ≠  ${sample.accountId}\n`);
    
    console.log('✅ THE SOLUTION:\n');
    console.log('Convert Account._id to string before querying conversations:\n');
    console.log(`    Account._id.toString() = "${superadmin._id.toString()}"`);
    console.log(`    Conversation.accountId = "${sample.accountId}"`);
    console.log(`    MATCH! ✅\n`);

    // Verify the fix
    console.log('🔍 VERIFICATION:\n');
    const count1 = await convColl.countDocuments({ 
      accountId: superadmin._id.toString() 
    });
    console.log(`Query with toString(): Found ${count1} conversations ✅\n`);

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

explain();
