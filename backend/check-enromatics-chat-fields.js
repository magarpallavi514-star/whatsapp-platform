import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function checkChatFields() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;

    // Get both accounts
    const superadmin = await db.collection('accounts').findOne({ 
      email: 'mpiyush2727@gmail.com' 
    });
    const enromatics = await db.collection('accounts').findOne({ 
      email: 'info@enromatics.com' 
    });

    console.log('📊 COMPARING ACCOUNT FIELDS:\n');
    
    console.log('🟢 SUPERADMIN:');
    if (superadmin) {
      console.log(`  accountId: ${superadmin.accountId}`);
      console.log(`  _id: ${superadmin._id}`);
      console.log(`  type: ${superadmin.type}`);
      console.log(`  plan: ${superadmin.plan}`);
      console.log(`  status: ${superadmin.status}`);
      console.log(`  subscription: ${superadmin.subscription}`);
      console.log(`  subscriptionId: ${superadmin.subscriptionId}`);
      console.log(`  clientId: ${superadmin.clientId}`);
    }

    console.log('\n🔵 ENROMATICS:');
    if (enromatics) {
      console.log(`  accountId: ${enromatics.accountId}`);
      console.log(`  _id: ${enromatics._id}`);
      console.log(`  type: ${enromatics.type}`);
      console.log(`  plan: ${enromatics.plan}`);
      console.log(`  status: ${enromatics.status}`);
      console.log(`  subscription: ${enromatics.subscription}`);
      console.log(`  subscriptionId: ${enromatics.subscriptionId}`);
      console.log(`  clientId: ${enromatics.clientId}`);
    }

    // Check phone numbers
    console.log('\n📱 PHONE NUMBERS:\n');
    
    const superadminPhones = await db.collection('phonenumbers').find({ 
      accountId: superadmin?._id 
    }).toArray();
    
    const enromaticsPhones = await db.collection('phonenumbers').find({ 
      accountId: enromatics?._id 
    }).toArray();

    console.log(`🟢 Superadmin phones: ${superadminPhones.length}`);
    superadminPhones.forEach(p => {
      console.log(`   - ${p.phoneNumberId} (WABA: ${p.wabaId})`);
    });

    console.log(`\n🔵 Enromatics phones: ${enromaticsPhones.length}`);
    enromaticsPhones.forEach(p => {
      console.log(`   - ${p.phoneNumberId} (WABA: ${p.wabaId})`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

checkChatFields();
