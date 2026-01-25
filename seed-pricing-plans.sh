#!/bin/bash
# Seed pricing plans if they don't exist

cat > /tmp/seed-pricing-plans.js << 'SEED_EOF'
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const pricingPlanSchema = new mongoose.Schema({
  planId: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true, enum: ['Starter', 'Pro', 'Enterprise', 'Custom'] },
  description: String,
  monthlyPrice: { type: Number, required: true, min: 0 },
  yearlyPrice: { type: Number, required: true, min: 0 },
  setupFee: { type: Number, default: 0, min: 0 },
  currency: { type: String, default: 'INR' },
  isActive: { type: Boolean, default: true },
  features: [{ type: String }]
});

const PricingPlan = mongoose.model('PricingPlan', pricingPlanSchema);

async function seedPricingPlans() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check existing plans
    const existingPlans = await PricingPlan.find();
    console.log(`📊 Found ${existingPlans.length} existing plans\n`);

    const defaultPlans = [
      {
        planId: 'starter',
        name: 'Starter',
        description: 'Perfect for getting started',
        monthlyPrice: 2499,
        yearlyPrice: 24990,
        setupFee: 0,
        currency: 'INR',
        isActive: true,
        features: ['Up to 100 contacts', 'Basic messaging', 'Email support']
      },
      {
        planId: 'pro',
        name: 'Pro',
        description: 'For scaling businesses',
        monthlyPrice: 4999,
        yearlyPrice: 49990,
        setupFee: 0,
        currency: 'INR',
        isActive: true,
        features: ['Up to 1000 contacts', 'Advanced messaging', 'Priority support', 'Custom templates']
      }
    ];

    let created = 0;
    for (const plan of defaultPlans) {
      const exists = await PricingPlan.findOne({ planId: plan.planId });
      if (exists) {
        console.log(`⏭️  Plan "${plan.name}" already exists`);
      } else {
        const newPlan = new PricingPlan(plan);
        await newPlan.save();
        created++;
        console.log(`✅ Created plan "${plan.name}"`);
        console.log(`   - Monthly: ₹${plan.monthlyPrice}`);
        console.log(`   - Setup Fee: ₹${plan.setupFee}`);
        console.log(`   - Total (First Month): ₹${plan.monthlyPrice + plan.setupFee}\n`);
      }
    }

    // Verify all plans
    const allPlans = await PricingPlan.find({ isActive: true });
    console.log('\n═'.repeat(60));
    console.log(`📋 Total active plans: ${allPlans.length}`);
    console.log(`📝 Plans created this run: ${created}`);
    console.log('═'.repeat(60));

    console.log('\n✅ Pricing plans seeding complete!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

seedPricingPlans();
SEED_EOF

# Change to backend directory and run seed
cd "$(dirname "$0")/backend"
node /tmp/seed-pricing-plans.js
