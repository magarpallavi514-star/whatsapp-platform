import mongoose from 'mongoose';

const pricingPlanSchema = new mongoose.Schema({
  planId: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true, enum: ['Starter', 'Pro', 'Enterprise', 'Custom'] },
  description: String,
  monthlyPrice: { type: Number, required: true, min: 0 },
  yearlyPrice: { type: Number, required: true, min: 0 },
  setupFee: { type: Number, default: 0, min: 0 },
  isActive: { type: Boolean, default: true }
});

const PricingPlan = mongoose.model('PricingPlan', pricingPlanSchema);

async function verifyPricingPlans() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const plans = await PricingPlan.find({ isActive: true }).lean();
    
    console.log('\n📋 Active Pricing Plans:');
    console.log('═'.repeat(60));
    
    if (plans.length === 0) {
      console.log('❌ No active pricing plans found!');
      console.log('\nYou need to create pricing plans in MongoDB:');
      console.log('Sample plans:');
      console.log(JSON.stringify([
        {
          planId: 'starter',
          name: 'Starter',
          description: 'Perfect for getting started',
          monthlyPrice: 2499,
          yearlyPrice: 24990,
          setupFee: 0,
          isActive: true
        },
        {
          planId: 'pro',
          name: 'Pro',
          description: 'For scaling businesses',
          monthlyPrice: 4999,
          yearlyPrice: 49990,
          setupFee: 0,
          isActive: true
        }
      ], null, 2));
      return;
    }

    plans.forEach(plan => {
      const total = plan.monthlyPrice + (plan.setupFee || 0);
      console.log(`\n📌 ${plan.name}`);
      console.log(`   planId: ${plan.planId}`);
      console.log(`   Monthly: ₹${plan.monthlyPrice}`);
      console.log(`   Setup Fee: ₹${plan.setupFee || 0}`);
      console.log(`   Total (First Month): ₹${total}`);
      console.log(`   Yearly: ₹${plan.yearlyPrice}`);
      console.log(`   Active: ${plan.isActive}`);
    });

    console.log('\n✅ Pricing plans verification complete');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

verifyPricingPlans();
