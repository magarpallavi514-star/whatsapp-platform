/**
 * Script to generate invoices for demo/trial organizations
 * Generates invoices with 0 amount for testing purposes
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';
import Invoice from './src/models/Invoice.js';
import Subscription from './src/models/Subscription.js';
import { generateInvoiceNumber } from './src/utils/idGenerator.js';

dotenv.config();

const generateDemoInvoices = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find first 2 users (demo/trial organizations)
    const users = await User.find({}).limit(2);
    
    if (users.length === 0) {
      console.log('❌ No users/organizations found');
      process.exit(1);
    }

    console.log(`\n📊 Found ${users.length} users/organizations`);
    console.log('Generating invoices for each:\n');

    // Generate invoices for each user
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const invoiceNumber = generateInvoiceNumber();
      const invoiceId = `inv_${invoiceNumber.replace(/[^0-9]/g, '').slice(0, 12)}`;
      
      console.log(`📝 Processing: ${user.name} (${user.email})`);
      console.log(`   Account ID: ${user.accountId}`);
      
      // Get or create subscription for this user
      let subscription = await Subscription.findOne({ accountId: user.accountId });
      
      if (!subscription) {
        console.log(`   ⚠️  Creating trial subscription...`);
        
        const now = new Date();
        const endDate = new Date(now);
        endDate.setMonth(endDate.getMonth() + 1);
        
        subscription = new Subscription({
          subscriptionId: `sub_trial_${Date.now()}`,
          accountId: user.accountId, // Use accountId instead of _id
          planId: new mongoose.Types.ObjectId(),
          status: 'active',
          billingCycle: 'monthly',
          pricing: {
            amount: 0,
            discount: 0,
            finalAmount: 0,
            currency: 'INR'
          },
          startDate: now,
          endDate: endDate,
          paymentGateway: 'manual',
          autoRenew: true
        });
        await subscription.save();
        console.log(`   ✅ Subscription created`);
      } else {
        console.log(`   ✅ Using existing subscription`);
      }
      
      const invoiceData = {
        invoiceId,
        invoiceNumber,
        accountId: user.accountId, // Use accountId instead of _id
        subscriptionId: subscription._id,
        invoiceDate: new Date('2026-01-15'),
        dueDate: new Date('2026-02-15'),
        billTo: {
          name: user.name,
          email: user.email,
          company: user.company || 'Demo Company',
          address: 'Demo Address, City',
          taxId: 'TAX123456'
        },
        lineItems: [
          {
            description: 'Trial Service - Demo Account',
            quantity: 1,
            unitPrice: 0,
            amount: 0
          }
        ],
        subtotal: 0,
        taxAmount: 0,
        discountAmount: 0,
        totalAmount: 0,
        paidAmount: 0,
        dueAmount: 0,
        currency: 'INR',
        status: 'paid'
      };

      try {
        // Create invoice in database
        const invoice = new Invoice({
          ...invoiceData,
          pdfUrl: `https://demo-invoice-${invoiceNumber}.pdf`
        });

        await invoice.save();
        console.log(`   ✅ Invoice created`);
        console.log(`      Invoice #: ${invoiceNumber}`);
        console.log(`      Amount: ₹0 (Demo/Trial)`);
        console.log(`      Status: Paid\n`);
      } catch (invoiceError) {
        console.error(`   ❌ Error creating invoice: ${invoiceError.message}\n`);
      }
    }

    console.log('✅ Demo invoices generated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

generateDemoInvoices();
