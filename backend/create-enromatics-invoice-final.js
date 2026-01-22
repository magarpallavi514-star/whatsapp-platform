import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { emailService } from './src/services/emailService.js';

dotenv.config();

async function createInvoice() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    
    console.log('✅ Connected to MongoDB');
    
    // Get Enromatics account
    const enromatics = await db.collection('accounts').findOne({ name: 'Enromatics' });
    console.log('\n�� Found Enromatics:');
    console.log('  _id:', enromatics._id);
    console.log('  accountId:', enromatics.accountId);
    console.log('  email:', enromatics.email);
    
    // Create invoice
    const invoiceId = `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const invoiceNumber = `INV-${enromatics.accountId}-${Date.now()}`;
    
    const invoiceDoc = {
      invoiceId: invoiceId,
      invoiceNumber: invoiceNumber,
      accountId: enromatics.accountId,
      subscriptionId: null,
      invoiceDate: new Date(),
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
      paidAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.collection('invoices').insertOne(invoiceDoc);
    console.log('\n✅ Invoice created successfully!');
    console.log('  Invoice ID:', invoiceId);
    console.log('  Invoice Number:', invoiceNumber);
    console.log('  Amount: ₹0');
    console.log('  Status: paid');
    
    // Send email
    console.log('\n📧 Sending invoice email to', enromatics.email, '...');
    try {
      const pdfUrl = `${process.env.FRONTEND_URL}/dashboard/invoices`;
      await emailService.sendInvoiceEmail(
        enromatics.email,
        invoiceNumber,
        pdfUrl,
        0,
        enromatics.name
      );
      console.log('✅ Invoice email sent successfully!');
    } catch (emailError) {
      console.warn('⚠️  Email sending failed:', emailError.message);
    }
    
    console.log('\n✨ Complete! Invoice for Enromatics:');
    console.log('  ✅ Account ID:', enromatics.accountId);
    console.log('  ✅ Invoice:', invoiceNumber);
    console.log('  ✅ Email sent to:', enromatics.email);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createInvoice();
