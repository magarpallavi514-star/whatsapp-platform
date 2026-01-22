import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Invoice from './src/models/Invoice.js';
import Account from './src/models/Account.js';
import { emailService } from './src/services/emailService.js';

dotenv.config();

async function createEnromaticsInvoice() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find Enromatics account
    const enromatics = await Account.findOne({ name: 'Enromatics' });
    if (!enromatics) {
      console.error('❌ Enromatics account not found');
      const allAccounts = await Account.find({});
      console.log('Available accounts:', allAccounts.map(a => ({ name: a.name, accountId: a.accountId, email: a.email })));
      process.exit(1);
    }

    console.log('✅ Found Enromatics:');
    console.log('   AccountId:', enromatics.accountId);
    console.log('   Email:', enromatics.email);
    console.log('   Name:', enromatics.name);

    // Check if invoice already exists for this account
    const existingInvoice = await Invoice.findOne({ accountId: enromatics.accountId });
    if (existingInvoice) {
      console.log('\n⚠️  Invoice already exists for Enromatics:');
      console.log('   Invoice ID:', existingInvoice._id);
      console.log('   Invoice Number:', existingInvoice.invoiceNumber);
      console.log('   Amount:', existingInvoice.amount);
      console.log('   Status:', existingInvoice.status);
    }

    // Create new $0 invoice
    console.log('\n📋 Creating $0 invoice for Enromatics...');
    const invoiceNumber = `INV-${enromatics.accountId}-${Date.now()}`;
    
    const newInvoice = new Invoice({
      accountId: enromatics.accountId,
      customerId: enromatics.accountId,
      invoiceNumber: invoiceNumber,
      amount: 0,
      currency: 'INR',
      status: 'completed',
      description: 'Free account - No payment required',
      planName: 'free',
      billingCycle: 'monthly',
      issueDate: new Date(),
      dueDate: new Date(),
      paidDate: new Date(),
      notes: 'Manually created free invoice for tracking',
      items: [
        {
          description: 'free plan subscription',
          quantity: 1,
          amount: 0,
          rate: 0
        }
      ]
    });

    await newInvoice.save();
    console.log('✅ Invoice created successfully!');
    console.log('   Invoice Number:', invoiceNumber);
    console.log('   Amount: ₹' + newInvoice.amount);
    console.log('   Status:', newInvoice.status);

    // Send invoice email
    console.log('\n📧 Sending invoice email to', enromatics.email, '...');
    try {
      const pdfUrl = `${process.env.FRONTEND_URL}/dashboard/invoices`; // Placeholder
      await emailService.sendInvoiceEmail(
        enromatics.email,
        invoiceNumber,
        pdfUrl,
        0, // Amount
        enromatics.name
      );
      console.log('✅ Invoice email sent successfully!');
    } catch (emailError) {
      console.warn('⚠️  Email sending failed (but invoice created):', emailError.message);
    }

    console.log('\n✨ Done! Invoice created and email sent to Enromatics');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

createEnromaticsInvoice();
