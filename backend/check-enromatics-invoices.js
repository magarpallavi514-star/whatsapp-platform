import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Invoice Schema
const invoiceSchema = new mongoose.Schema({
  accountId: String,
  customerId: String,
  invoiceNumber: String,
  amount: Number,
  currency: String,
  status: String,
  description: String,
  planName: String,
  billingCycle: String,
  issueDate: Date,
  dueDate: Date,
  paidDate: Date,
  notes: String,
  items: Array,
  createdAt: { type: Date, default: Date.now }
});

const Invoice = mongoose.model('Invoice', invoiceSchema);

async function checkInvoices() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📋 Checking Invoices for Both Accounts\n');

    // Check invoices for Superadmin
    const superadminInvoices = await Invoice.find({
      accountId: 'pixels_internal'
    }).sort({ createdAt: -1 });

    // Check invoices for Enromatics
    const enromaticsInvoices = await Invoice.find({
      accountId: '2600003'
    }).sort({ createdAt: -1 });

    console.log('='.repeat(60));
    console.log('🔴 SUPERADMIN INVOICES');
    console.log('='.repeat(60));
    console.log(`Total: ${superadminInvoices.length}\n`);

    if (superadminInvoices.length > 0) {
      superadminInvoices.slice(0, 3).forEach(inv => {
        console.log(`Invoice #: ${inv.invoiceNumber}`);
        console.log(`Amount: ${inv.amount} ${inv.currency}`);
        console.log(`Status: ${inv.status}`);
        console.log(`Plan: ${inv.planName}`);
        console.log(`Created: ${new Date(inv.createdAt).toLocaleString()}`);
        console.log('');
      });
    } else {
      console.log('❌ No invoices found for Superadmin');
    }

    console.log('='.repeat(60));
    console.log('🟦 ENROMATICS INVOICES');
    console.log('='.repeat(60));
    console.log(`Total: ${enromaticsInvoices.length}\n`);

    if (enromaticsInvoices.length > 0) {
      enromaticsInvoices.slice(0, 3).forEach(inv => {
        console.log(`Invoice #: ${inv.invoiceNumber}`);
        console.log(`Amount: ${inv.amount} ${inv.currency}`);
        console.log(`Status: ${inv.status}`);
        console.log(`Plan: ${inv.planName}`);
        console.log(`Created: ${new Date(inv.createdAt).toLocaleString()}`);
        console.log('');
      });
    } else {
      console.log('❌ No invoices found for Enromatics');
    }

    console.log('='.repeat(60));
    console.log('📊 SUMMARY');
    console.log('='.repeat(60));
    console.log(`Superadmin Invoices: ${superadminInvoices.length}`);
    console.log(`Enromatics Invoices: ${enromaticsInvoices.length}`);

    if (enromaticsInvoices.length === 0) {
      console.log('\n⚠️  ENROMATICS HAS NO INVOICES YET');
      console.log('  Need to create one when client was registered');
    } else {
      const freeInvoices = enromaticsInvoices.filter(i => i.amount === 0);
      const paidInvoices = enromaticsInvoices.filter(i => i.amount > 0);
      console.log(`\n✅ ENROMATICS INVOICES:`);
      console.log(`  $0 (Free): ${freeInvoices.length}`);
      console.log(`  Paid: ${paidInvoices.length}`);
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkInvoices();
