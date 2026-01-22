import mongoose from 'mongoose';
import Account from './src/models/Account.js';
import Subscription from './src/models/Subscription.js';

const MONGO_URI = process.env.MONGODB_URI;

async function check() {
  try {
    await mongoose.connect(MONGO_URI);

    const superadmin = await Account.findOne({ accountId: 'pixels_internal' });
    const enromatics = await Account.findOne({ accountId: 'eno_2600003' });

    console.log('\n📋 SUBSCRIPTION CHECK:\n');

    console.log(`Superadmin _id: ${superadmin._id}`);
    const superSub = await Subscription.findOne({ accountId: superadmin._id });
    console.log(`Query with ObjectId _id: ${superSub ? '✅ FOUND' : '❌ NOT FOUND'}`);
    
    const superSub2 = await Subscription.findOne({ accountId: 'pixels_internal' });
    console.log(`Query with STRING 'pixels_internal': ${superSub2 ? '✅ FOUND' : '❌ NOT FOUND'}`);

    console.log(`\nEnromatics _id: ${enromatics._id}`);
    const enroSub = await Subscription.findOne({ accountId: enromatics._id });
    console.log(`Query with ObjectId _id: ${enroSub ? '✅ FOUND' : '❌ NOT FOUND'}`);

    const enroSub2 = await Subscription.findOne({ accountId: 'eno_2600003' });
    console.log(`Query with STRING 'eno_2600003': ${enroSub2 ? '✅ FOUND' : '❌ NOT FOUND'}`);

    // Check actual stored format
    console.log('\n📊 ACTUAL STORED FORMAT:');
    const subs = await Subscription.find({}).limit(3);
    subs.forEach(sub => {
      console.log(`accountId: ${sub.accountId} (type: ${typeof sub.accountId})`);
    });

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

check();
