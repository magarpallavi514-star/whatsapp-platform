import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function checkStatus() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;

    // Check Superadmin
    console.log('👤 SUPERADMIN STATUS:');
    const superadmin = await db.collection('accounts').findOne({ email: 'mpiyush2727@gmail.com' });
    if (superadmin) {
      console.log(`  Account: ${superadmin.accountId}`);
      console.log(`  Plan: ${superadmin.plan}`);
      console.log(`  Type: ${superadmin.type}`);
      console.log(`  Status: ${superadmin.status}`);
      
      const superPhones = await db.collection('phonenumbers').find({ accountId: superadmin._id }).toArray();
      console.log(`  Phone Numbers: ${superPhones.length}`);
      superPhones.forEach((p, i) => {
        console.log(`    ${i+1}. ${p.displayName} - ${p.phoneNumberId} (${p.wabaId}) - Active: ${p.isActive}`);
      });
      
      const superSub = await db.collection('subscriptions').findOne({ accountId: superadmin._id });
      console.log(`  Subscription: ${superSub ? 'YES' : 'NO'}`);
      if (superSub) {
        console.log(`    Status: ${superSub.status}`);
        console.log(`    Features: ${superSub.features?.join(', ')}`);
      }
    }

    // Check Enromatics
    console.log('\n👤 ENROMATICS STATUS:');
    const enromatics = await db.collection('accounts').findOne({ email: 'info@enromatics.com' });
    if (enromatics) {
      console.log(`  Account: ${enromatics.accountId}`);
      console.log(`  Plan: ${enromatics.plan}`);
      console.log(`  Type: ${enromatics.type}`);
      console.log(`  Status: ${enromatics.status}`);
      console.log(`  Features: ${enromatics.features?.join(', ')}`);
      
      const phones = await db.collection('phonenumbers').find({ accountId: enromatics._id }).toArray();
      console.log(`  Phone Numbers: ${phones.length}`);
      phones.forEach((p, i) => {
        console.log(`    ${i+1}. ${p.displayName} - ${p.phoneNumberId} (${p.wabaId}) - Active: ${p.isActive}`);
      });
      
      const sub = await db.collection('subscriptions').findOne({ accountId: enromatics._id });
      console.log(`  Subscription: ${sub ? 'YES' : 'NO'}`);
      if (sub) {
        console.log(`    Status: ${sub.status}`);
        console.log(`    Features: ${sub.features?.join(', ')}`);
        console.log(`    Plan ID: ${sub.planId}`);
      }
    }

    // Check conversations for both
    console.log('\n💬 CONVERSATIONS:');
    const superConvs = await db.collection('conversations').countDocuments({ accountId: 'pixels_internal' });
    console.log(`  Superadmin: ${superConvs}`);
    
    const enroConvs = await db.collection('conversations').countDocuments({ accountId: enromatics?.accountId });
    console.log(`  Enromatics: ${enroConvs}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

checkStatus();
