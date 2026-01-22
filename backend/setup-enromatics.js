import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Account from './src/models/Account.js';
import Subscription from './src/models/Subscription.js';
import Invoice from './src/models/Invoice.js';
import { emailService } from './src/services/emailService.js';

dotenv.config();

async function setupEnromatics() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find Enromatics
    const enromatics = await Account.findOne({ name: 'Enromatics' });
    if (!enromatics) {
      console.error('❌ Enromatics not found');
      process.exit(1);
    }

    console.log('\n📋 Found Enromatics Account');
    console.log('  MongoDB _id:', enromatics._id);
    console.log('  Name:', enromatics.name);
    console.log('  Email:', enromatics.email);
    console.log('  Current accountId:', enromatics.accountId);

    // Step 1: Assign proper account ID if missing
    if (!enromatics.accountId) {
      enromatics.accountId = 'eno_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      await enromatics.save();
      console.log('\n✅ Assigned accountId:', enromatics.accountId);
    } else {
      console.log('\n✅ accountId already exists:', enromatics.accountId);
    }

    // Step 2: Check/Create Subscription
    let subscription = await Subscription.findOne({ customerId: enromatics._id });
    
    if (!subscription) {
      console.log('\n📦 Creating subscription for Enromatics...');
      subscription = new Subscription({
        customerId: enromatics._id,
        accountId: enromatics.accountId,
        plan: 'free',
        status: 'active',
        billingCycle: 'monthly',
        startDate: new Date(),
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        amount: 0,
        currency: 'INR'
      });
      await subscription.save();
      console.log('✅ Subscription created');
      console.log('  Subscription ID:', subscription._id);
    } else {
      console.log('\n✅ Subscription already exists');
      console.log('  Subscription ID:', subscription._id);
    }

    // Step 3: Create Invoice
    console.log('\n📋 Creating $0 invoice...');
    const invoiceNumber = `INV-${enromatics.accountId}-${Date.now()}`;
    const invoiceId = `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newInvoice = new Invoice({
      invoiceId: invoiceId,
      invoiceNumber: invoiceNumber,
      accountId: enromatics.accountId,
      subscriptionId: subscription._id,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      billTo: {
        name: enromatics.name,
        email: enromatics.email
      },
      subtotal: 0,
      tax: 0,
      totalAmount: 0,
      dueAmount: 0,
      status: 'paid',
      items: [
        {
          description: 'Free plan subscription',
          quantity: 1,
          unitPrice: 0,
          amount: 0
        }
      ],
      notes: 'Free account - No payment required',
      paidAt: new Date()
    });

    await newInvoice.save();
    console.log('✅ Invoice created successfully!');
    console.log('  Invoice ID:', invoiceId);
    console.log('  Invoice Number:', invoiceNumber);
    console.log('  Amount: ₹0');
    console.log('  Status: paid');

    // Step 4: Send Email
    console.log('\n📧 Sending invoice email to', enromatics.email, '...');
    try {
      const pdfUrl = `${process.env.FRONTEND_URL}/dashboard/invoices/${invoiceId}`;
      await emailService.sendInvoiceEmail(
        enromatics.email,
        invoiceNumber,
        pdfUrl,
        0,
        enromatics.name
      );
      console.log('✅ Invoice email sent successfully!');
    } catch (emailError) {
      console.warn('⚠️  Email sending failed (but invoice created):', emailError.message);
    }

    console.log('\n✨ All done! Enromatics setup complete:');
    console.log('  ✅ Account ID:', enromatics.accountId);
    console.log('  ✅ Subscription ID:', subscription._id);
    console.log('  ✅ Invoice:', invoiceNumber);
    console.log('  ✅ Email sent to:', enromatics.email);

    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

setupEnromatics();
