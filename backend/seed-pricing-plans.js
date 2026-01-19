/**
 * Seed initial pricing plans into the database
 * Run: node backend/seed-pricing-plans.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import PricingPlan from './src/models/PricingPlan.js';
import { generateId } from './src/utils/idGenerator.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/whatsapp-platform';

const starterPlan = {
  planId: `plan_${generateId()}`,
  name: 'Starter',
  description: 'Perfect for getting started with WhatsApp marketing',
  monthlyPrice: 29,
  yearlyPrice: 290,
  currency: 'USD',
  monthlyDiscount: 0,
  yearlyDiscount: 16, // ~16% annual discount
  limits: {
    messages: 5000,
    contacts: 1000,
    campaigns: 10,
    apiCalls: 10000,
    templates: 20,
    phoneNumbers: 1,
    users: 1,
    storageGB: 5
  },
  features: [
    { name: 'Basic Message Sending', description: 'Send text messages via WhatsApp', included: true },
    { name: 'Contact Management', description: 'Store up to 1000 contacts', included: true },
    { name: 'Message Templates', description: '20 message templates', included: true },
    { name: 'Basic Analytics', description: 'View basic metrics', included: true },
    { name: 'Email Support', description: '24/7 email support', included: false },
    { name: 'Media Messages', description: 'Send images, documents, videos', included: false },
    { name: 'Team Members', description: 'Add multiple team members', included: false },
    { name: 'API Access', description: 'Full API access', included: false },
    { name: 'Webhooks', description: 'Receive webhook events', included: false },
    { name: 'Advanced Analytics', description: 'Detailed reports and insights', included: false }
  ],
  isActive: true,
  isPopular: false
};

const proPlan = {
  planId: `plan_${generateId()}`,
  name: 'Pro',
  description: 'For growing businesses looking to scale',
  monthlyPrice: 99,
  yearlyPrice: 990,
  currency: 'USD',
  monthlyDiscount: 0,
  yearlyDiscount: 16,
  limits: {
    messages: 50000,
    contacts: 10000,
    campaigns: 100,
    apiCalls: 100000,
    templates: 100,
    phoneNumbers: 3,
    users: 5,
    storageGB: 50
  },
  features: [
    { name: 'All Starter Features', description: 'Everything from Starter plan', included: true },
    { name: 'Media Messages', description: 'Send images, documents, videos', included: true },
    { name: 'Team Members', description: 'Add up to 5 team members', included: true },
    { name: 'API Access', description: 'Full API access with webhooks', included: true },
    { name: 'Advanced Analytics', description: 'Detailed reports and insights', included: true },
    { name: 'Multiple Phone Numbers', description: 'Manage up to 3 phone numbers', included: true },
    { name: 'Broadcast Campaigns', description: 'Send campaigns to contacts', included: true },
    { name: 'Custom Domain', description: 'Use custom domain for links', included: false },
    { name: 'Priority Support', description: '24/7 phone and email support', included: false },
    { name: 'White Label', description: 'Remove branding and customize', included: false }
  ],
  isActive: true,
  isPopular: true // Mark as popular
};

const enterprisePlan = {
  planId: `plan_${generateId()}`,
  name: 'Enterprise',
  description: 'For large organizations with advanced needs',
  monthlyPrice: 299,
  yearlyPrice: 2990,
  currency: 'USD',
  monthlyDiscount: 0,
  yearlyDiscount: 16,
  limits: {
    messages: null, // unlimited
    contacts: null,
    campaigns: null,
    apiCalls: null,
    templates: null,
    phoneNumbers: 10,
    users: 20,
    storageGB: 500
  },
  features: [
    { name: 'All Pro Features', description: 'Everything from Pro plan', included: true },
    { name: 'Unlimited Everything', description: 'Unlimited messages, contacts, campaigns', included: true },
    { name: 'White Label Solution', description: 'Remove all branding, fully customizable', included: true },
    { name: 'Advanced Integrations', description: 'Custom integrations with your systems', included: true },
    { name: 'Dedicated Account Manager', description: 'Personal support specialist', included: true },
    { name: 'SLA Guarantee', description: '99.9% uptime SLA', included: true },
    { name: 'Advanced Security', description: 'SSO, 2FA, audit logs', included: true },
    { name: 'Custom Features', description: 'Request custom features', included: true },
    { name: 'Priority Support', description: '24/7 phone support', included: true },
    { name: 'Training & Onboarding', description: 'Professional setup and training', included: true }
  ],
  isActive: true,
  isPopular: false
};

async function seedPlans() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing plans
    await PricingPlan.deleteMany({});
    console.log('Cleared existing plans');

    // Insert new plans
    const plans = await PricingPlan.insertMany([starterPlan, proPlan, enterprisePlan]);
    console.log(`✅ Successfully seeded ${plans.length} pricing plans`);

    plans.forEach(plan => {
      console.log(`  - ${plan.name}: $${plan.monthlyPrice}/month`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding plans:', error);
    process.exit(1);
  }
}

seedPlans();
