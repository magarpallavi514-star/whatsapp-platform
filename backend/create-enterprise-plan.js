import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

// Define schemas
const pricingPlanSchema = new mongoose.Schema({
  planId: String,
  name: { type: String, enum: ['Starter', 'Pro', 'Enterprise', 'Custom'] },
  description: String,
  monthlyPrice: Number,
  yearlyPrice: Number,
  setupFee: Number,
  currency: { type: String, default: 'INR' },
  isActive: { type: Boolean, default: true },
  features: [String]
});

const PricingPlan = mongoose.model('PricingPlan', pricingPlanSchema);

async function createEnterprisePlan() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check if Enterprise plan exists
    const existing = await PricingPlan.findOne({ name: 'Enterprise' });
    
    if (existing) {
      console.log('⚠️ Enterprise plan already exists');
      console.log(`   ID: ${existing._id}`);
      await mongoose.connection.close();
      return;
    }

    // Create Enterprise plan
    const enterprisePlan = new PricingPlan({
      planId: 'enterprise',
      name: 'Enterprise',
      description: 'For large enterprises and teams',
      monthlyPrice: 9999,
      yearlyPrice: 99990,
      setupFee: 5000,
      currency: 'INR',
      isActive: true,
      features: [
        'Unlimited contacts',
        'Advanced messaging',
        'Priority support',
        'Custom templates',
        'Team collaboration',
        'Advanced analytics',
        'API access',
        'White-label options'
      ]
    });

    await enterprisePlan.save();
    
    console.log('✅ Enterprise plan created!\n');
    console.log('📋 Plan Details:');
    console.log(`   Name: ${enterprisePlan.name}`);
    console.log(`   Monthly Price: ₹${enterprisePlan.monthlyPrice}`);
    console.log(`   Yearly Price: ₹${enterprisePlan.yearlyPrice}`);
    console.log(`   Setup Fee: ₹${enterprisePlan.setupFee}`);
    console.log(`   _id: ${enterprisePlan._id}\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

createEnterprisePlan();
