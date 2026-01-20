/**
 * Seed pricing plans with new format
 * Run: node backend/seed-pricing-new.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import PricingPlan from './src/models/PricingPlan.js';
import { generateId } from './src/utils/idGenerator.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/whatsapp-platform';

const plans = [
  {
    planId: `plan_${generateId()}`,
    name: 'Starter',
    description: 'Perfect for getting started',
    monthlyPrice: 2499,
    yearlyPrice: 24990,
    setupFee: 3000,
    currency: 'INR',
    monthlyDiscount: 0,
    yearlyDiscount: 0,
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
    features: {
      included: [
        '1 WhatsApp Number',
        'Broadcast Messaging',
        'Basic Chatbot (Menu-driven)',
        'Live Chat Dashboard',
        '3 Team Agents',
        'Contact Management',
        'Basic Analytics',
        'Email Notifications',
        'Payment Link Support',
        'Standard Support'
      ],
      excluded: [
        'Advanced Chatbot Flows',
        'Campaign Automation',
        'Webhook Support'
      ]
    },
    isActive: true,
    isPopular: false
  },
  {
    planId: `plan_${generateId()}`,
    name: 'Pro',
    description: 'For scaling businesses',
    monthlyPrice: 4999,
    yearlyPrice: 49990,
    setupFee: 3000,
    currency: 'INR',
    monthlyDiscount: 0,
    yearlyDiscount: 0,
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
    features: {
      included: [
        '3 WhatsApp Numbers',
        'Everything in Starter',
        'Advanced Chatbot (Logic-based)',
        'Campaign Automation',
        '10 Team Agents',
        'Scheduled Broadcasting',
        'Advanced Analytics & Reports',
        'Webhook Support',
        'Limited API Access',
        'Priority Support 24/7',
        'Agent Routing & Tagging'
      ],
      excluded: [
        'Custom Integrations'
      ]
    },
    isActive: true,
    isPopular: true
  }
];

async function seedPlans() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing plans
    await PricingPlan.deleteMany({});
    console.log('🗑️  Cleared existing plans');

    // Insert new plans
    const result = await PricingPlan.insertMany(plans);
    console.log(`✅ Seeded ${result.length} pricing plans`);

    result.forEach(plan => {
      console.log(`  - ${plan.name}: ₹${plan.monthlyPrice}/month (Setup: ₹${plan.setupFee})`);
    });

    await mongoose.disconnect();
    console.log('✅ Done!');
  } catch (error) {
    console.error('❌ Error seeding plans:', error);
    process.exit(1);
  }
}

seedPlans();
