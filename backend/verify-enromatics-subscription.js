import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const accountSchema = new mongoose.Schema({
  accountId: String,
  name: String,
  email: String,
  plan: String,
  status: String
});

const subscriptionSchema = new mongoose.Schema({
  accountId: mongoose.Schema.Types.ObjectId,
  planId: mongoose.Schema.Types.ObjectId,
  status: String,
  billingCycle: String,
  discount: Number,
  discountType: String,
  amount: Number
});

const pricingPlanSchema = new mongoose.Schema({
  name: String,
  monthlyPrice: Number,
  setupFee: Number
});

const Account = mongoose.model('Account', accountSchema);
const Subscription = mongoose.model('Subscription', subscriptionSchema);
const PricingPlan = mongoose.model('PricingPlan', pricingPlanSchema);

async function verify() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find Enromatics account
    const account = await Account.findOne({ name: 'Enromatics' });
    console.log('📌 Enromatics Account:');
    console.log(`   Name: ${account.name}`);
    console.log(`   Email: ${account.email}`);
    console.log(`   Account ID: ${account.accountId}`);
    console.log(`   MongoDB ID: ${account._id}\n`);

    // Find subscription
    const subscription = await Subscription.findOne({ 
      accountId: account._id 
    }).populate('planId');

    if (!subscription) {
      console.log('❌ No subscription found');
      process.exit(1);
    }

    console.log('✅ Subscription Found:');
    console.log(`   Status: ${subscription.status} ${subscription.status === 'active' ? '✅' : '❌'}`);
    console.log(`   Plan: ${subscription.planId?.name || 'Unknown'}`);
    console.log(`   Billing Cycle: ${subscription.billingCycle}`);
    console.log(`   Discount: ${subscription.discount}% (${subscription.discountType})`);
    console.log(`   Amount: ₹${subscription.amount}\n`);

    if (subscription.status === 'active') {
      console.log('🎉 READY TO USE!');
      console.log('   ✅ Can access all dashboard features');
      console.log('   ✅ Can manage WhatsApp settings');
      console.log('   ✅ Can send messages');
      console.log('   ✅ Can view conversations\n');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

verify();
