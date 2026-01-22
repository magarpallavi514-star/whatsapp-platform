import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function upgradeEnromatics() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;

    // Get Enromatics account
    const account = await db.collection('accounts').findOne({ 
      email: 'info@enromatics.com' 
    });

    if (!account) {
      console.log('❌ Enromatics account not found');
      process.exit(1);
    }

    console.log('🏢 Current Enromatics Status:');
    console.log(`  Account ID: ${account.accountId}`);
    console.log(`  Current Plan: ${account.plan}`);
    console.log(`  Status: ${account.status}`);

    // Check subscription
    const subscription = await db.collection('subscriptions').findOne({
      accountId: account._id
    });

    console.log('\n📋 Current Subscription:');
    if (subscription) {
      console.log(`  Plan: ${subscription.planId}`);
      console.log(`  Status: ${subscription.status}`);
      console.log(`  Features: ${JSON.stringify(subscription.features, null, 2)}`);
    } else {
      console.log('  ❌ No subscription found');
    }

    // Get all available plans
    const plans = await db.collection('prisingplans').find({}).toArray();
    console.log(`\n📦 Available Plans (${plans.length}):`);
    plans.forEach(p => {
      console.log(`  - ${p.name} (${p.tier}): ${p.features?.length || 0} features`);
    });

    // Update account to pro plan
    const proplan = await db.collection('prisingplans').findOne({ tier: 'pro' });
    
    if (!proplan) {
      console.log('\n⚠️  Pro plan not found, checking pricing plans...');
      const allPlans = await db.collection('pricingplans').find({}).toArray();
      console.log(`Found ${allPlans.length} plans in pricingplans collection`);
      allPlans.forEach(p => console.log(`  - ${p.name}`));
    }

    // Update account plan to pro
    const updateResult = await db.collection('accounts').updateOne(
      { _id: account._id },
      {
        $set: {
          plan: 'pro',
          status: 'active',
          features: [
            'broadcasts',
            'chat',
            'campaigns',
            'templates',
            'contacts',
            'webhooks',
            'api',
            'analytics'
          ],
          featureUpdatedAt: new Date()
        }
      }
    );

    console.log('\n✅ Account Updated:');
    console.log(`  Plan changed to: pro`);
    console.log(`  Features enabled: broadcasts, chat, campaigns, templates, contacts, webhooks, api, analytics`);
    console.log(`  Updated: ${updateResult.modifiedCount} document`);

    // Also update subscription if it exists
    if (subscription) {
      await db.collection('subscriptions').updateOne(
        { _id: subscription._id },
        {
          $set: {
            status: 'active',
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
      console.log('\n✅ Subscription Updated with all features');
    }

    // Verify
    const updated = await db.collection('accounts').findOne({ _id: account._id });
    console.log('\n🎉 Final Status:');
    console.log(`  Plan: ${updated.plan}`);
    console.log(`  Status: ${updated.status}`);
    console.log(`  Features: ${updated.features?.join(', ')}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

upgradeEnromatics();
