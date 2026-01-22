import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

// Define schemas
const accountSchema = new mongoose.Schema({
  accountId: String,
  name: String,
  email: String,
  plan: String,
  status: String,
  company: String,
  phone: String,
  timezone: String,
  createdAt: Date
});

const pricingPlanSchema = new mongoose.Schema({
  planId: String,
  name: String,
  monthlyPrice: Number,
  setupFee: Number,
  isActive: Boolean
});

const subscriptionSchema = new mongoose.Schema({
  accountId: mongoose.Schema.Types.ObjectId,
  planId: mongoose.Schema.Types.ObjectId,
  status: String,
  billingCycle: String,
  discount: Number,
  discountType: String,
  amount: Number,
  currency: String,
  startDate: Date,
  renewalDate: Date,
  cancellationDate: Date,
  createdAt: Date,
  updatedAt: Date
});

const Account = mongoose.model('Account', accountSchema);
const PricingPlan = mongoose.model('PricingPlan', pricingPlanSchema);
const Subscription = mongoose.model('Subscription', subscriptionSchema);

async function assignProFreeSubscription() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find Enromatics account
    const account = await Account.findOne({ 
      $or: [
        { name: /enromatics/i },
        { email: /enromatics/i },
        { company: /enromatics/i }
      ]
    });

    if (!account) {
      console.log('❌ Enromatics account not found');
      process.exit(1);
    }

    console.log('📌 Found Enromatics Account:');
    console.log(`   Name: ${account.name}`);
    console.log(`   Email: ${account.email}`);
    console.log(`   _id: ${account._id}\n`);

    // Find Pro plan
    const proPlan = await PricingPlan.findOne({ 
      name: 'Pro',
      isActive: true 
    });

    if (!proPlan) {
      console.log('❌ Pro plan not found');
      process.exit(1);
    }

    console.log('📌 Found Pro Plan:');
    console.log(`   Name: ${proPlan.name}`);
    console.log(`   Monthly Price: ₹${proPlan.monthlyPrice}`);
    console.log(`   _id: ${proPlan._id}\n`);

    // Check if subscription already exists
    const existingSubscription = await Subscription.findOne({
      accountId: account._id
    });

    if (existingSubscription) {
      console.log('⚠️ Existing subscription found, updating it...\n');
      existingSubscription.planId = proPlan._id;
      existingSubscription.status = 'active';
      existingSubscription.discount = 100;
      existingSubscription.discountType = 'percent';
      existingSubscription.amount = 0; // 100% discount
      existingSubscription.billingCycle = 'monthly';
      existingSubscription.renewalDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
      existingSubscription.updatedAt = new Date();
      
      await existingSubscription.save();
      console.log('✅ Subscription updated!\n');
    } else {
      console.log('✨ Creating new subscription...\n');
      const newSubscription = new Subscription({
        accountId: account._id,
        planId: proPlan._id,
        status: 'active',
        billingCycle: 'monthly',
        discount: 100,
        discountType: 'percent',
        amount: 0, // 100% discount = free
        currency: 'INR',
        startDate: new Date(),
        renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await newSubscription.save();
      console.log('✅ New subscription created!\n');
    }

    console.log('═'.repeat(60));
    console.log('📋 SUBSCRIPTION DETAILS');
    console.log('═'.repeat(60));
    console.log(`Account: ${account.name} (${account.email})`);
    console.log(`Plan: Pro`);
    console.log(`Status: ACTIVE ✅`);
    console.log(`Billing Cycle: Monthly`);
    console.log(`Discount: 100% (FREE)`);
    console.log(`Amount Due: ₹0`);
    console.log(`Renewal Date: ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}`);
    console.log('═'.repeat(60));
    console.log('\n✅ Enromatics now has Pro plan with 100% discount!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

assignProFreeSubscription();
