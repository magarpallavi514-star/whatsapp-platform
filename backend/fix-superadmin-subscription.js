import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function fixSuperadmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;

    // Get Superadmin
    const superadmin = await db.collection('accounts').findOne({ email: 'mpiyush2727@gmail.com' });
    if (!superadmin) {
      console.log('❌ Superadmin not found');
      process.exit(1);
    }

    // Get subscription
    const sub = await db.collection('subscriptions').findOne({ accountId: superadmin._id });
    if (!sub) {
      console.log('❌ Subscription not found');
      process.exit(1);
    }

    console.log('📝 Current Superadmin Subscription:');
    console.log(`  Status: ${sub.status}`);
    console.log(`  Features: ${sub.features}`);
    console.log(`  Plan ID: ${sub.planId}`);

    // Update with all features
    const result = await db.collection('subscriptions').updateOne(
      { _id: sub._id },
      {
        $set: {
          features: [
            'broadcasts',
            'chat',
            'campaigns',
            'templates',
            'contacts',
            'webhooks',
            'api',
            'analytics'
          ]
        }
      }
    );

    console.log('\n✅ Subscription Updated:');
    console.log(`  Modified: ${result.modifiedCount} document`);

    // Verify
    const updated = await db.collection('subscriptions').findOne({ _id: sub._id });
    console.log('\n🎉 Final Status:');
    console.log(`  Status: ${updated.status}`);
    console.log(`  Features: ${updated.features?.join(', ')}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

fixSuperadmin();
