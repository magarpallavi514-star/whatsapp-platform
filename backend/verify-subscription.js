import mongoose from 'mongoose';
import Account from './src/models/Account.js';
import Subscription from './src/models/Subscription.js';

const MONGO_URI = process.env.MONGODB_URI;

async function verify() {
  try {
    await mongoose.connect(MONGO_URI);

    const superadmin = await Account.findOne({ accountId: 'pixels_internal' });
    const enromatics = await Account.findOne({ accountId: 'eno_2600003' });

    console.log('\n✅ SUBSCRIPTION VERIFICATION:\n');

    // Superadmin
    console.log('🔍 SUPERADMIN:');
    const superSub = await Subscription.findOne({ accountId: superadmin._id });
    if (superSub) {
      console.log(`  ✅ Subscription found`);
      console.log(`    Status: ${superSub.status}`);
      console.log(`    Plan: ${superSub.plan}`);
      console.log(`    Features: ${superSub.features?.length || 0}`);
    } else {
      console.log(`  ❌ No subscription found`);
    }

    // Enromatics
    console.log('\n🔍 ENROMATICS:');
    const enroSub = await Subscription.findOne({ accountId: enromatics._id });
    if (enroSub) {
      console.log(`  ✅ Subscription found`);
      console.log(`    Status: ${enroSub.status}`);
      console.log(`    Plan: ${enroSub.plan}`);
      console.log(`    Features: ${enroSub.features?.length || 0}`);
    } else {
      console.log(`  ❌ No subscription found`);
    }

    console.log('\n✅ VERIFICATION COMPLETE\n');
    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

verify();
