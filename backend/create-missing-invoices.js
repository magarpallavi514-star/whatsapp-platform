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

// User Schema (to get customerId)
const userSchema = new mongoose.Schema({
  accountId: String,
  email: String,
  name: String,
  plan: String,
  billingCycle: String
});

const User = mongoose.model('User', userSchema);

async function createMissingInvoices() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📋 Creating missing invoices for both accounts\n');

    // Find both users
    const superadminUser = await User.findOne({ accountId: 'pixels_internal' });
    const enromaticsUser = await User.findOne({ accountId: '2600003' });

    console.log('🔍 Found users:');
    if (superadminUser) {
      console.log(`✅ Superadmin: ${superadminUser.email} (${superadminUser.accountId})`);
    } else {
      console.log('❌ Superadmin user not found');
    }

    if (enromaticsUser) {
      console.log(`✅ Enromatics: ${enromaticsUser.email} (${enromaticsUser.accountId})`);
    } else {
      console.log('❌ Enromatics user not found');
    }

    console.log('\n' + '='.repeat(60));
    console.log('Creating invoices...\n');

    // Create Superadmin invoice
    if (superadminUser) {
      try {
        const superadminInvoice = new Invoice({
          accountId: 'pixels_internal',
          customerId: superadminUser._id.toString(),
          invoiceNumber: `INV-pixels_internal-${Date.now()}`,
          amount: 0,
          currency: 'INR',
          status: 'completed',
          description: 'Free account - No payment required',
          planName: superadminUser.plan || 'superadmin',
          billingCycle: superadminUser.billingCycle || 'monthly',
          issueDate: new Date(),
          dueDate: new Date(),
          paidDate: new Date(),
          notes: 'Retroactively created for superadmin account',
          items: [
            {
              description: `${superadminUser.plan || 'superadmin'} plan subscription`,
              quantity: 1,
              amount: 0,
              rate: 0
            }
          ]
        });

        await superadminInvoice.save();
        console.log('✅ Superadmin invoice created:');
        console.log(`   Invoice #: ${superadminInvoice.invoiceNumber}`);
        console.log(`   Amount: $0 INR`);
        console.log('');
      } catch (error) {
        console.log('❌ Failed to create Superadmin invoice:', error.message);
      }
    }

    // Create Enromatics invoice
    if (enromaticsUser) {
      try {
        const enromaticsInvoice = new Invoice({
          accountId: '2600003',
          customerId: enromaticsUser._id.toString(),
          invoiceNumber: `INV-2600003-${Date.now()}`,
          amount: 0,
          currency: 'INR',
          status: 'completed',
          description: 'Free account - No payment required',
          planName: enromaticsUser.plan || 'free',
          billingCycle: enromaticsUser.billingCycle || 'monthly',
          issueDate: new Date(),
          dueDate: new Date(),
          paidDate: new Date(),
          notes: 'Retroactively created for Enromatics free account',
          items: [
            {
              description: `${enromaticsUser.plan || 'free'} plan subscription`,
              quantity: 1,
              amount: 0,
              rate: 0
            }
          ]
        });

        await enromaticsInvoice.save();
        console.log('✅ Enromatics invoice created:');
        console.log(`   Invoice #: ${enromaticsInvoice.invoiceNumber}`);
        console.log(`   Amount: $0 INR`);
        console.log('');
      } catch (error) {
        console.log('❌ Failed to create Enromatics invoice:', error.message);
      }
    }

    console.log('='.repeat(60));
    console.log('✅ Invoice creation complete!\n');

    // Verify
    const superadminInvoices = await Invoice.countDocuments({ accountId: 'pixels_internal' });
    const enromaticsInvoices = await Invoice.countDocuments({ accountId: '2600003' });

    console.log('📊 Final verification:');
    console.log(`  Superadmin invoices: ${superadminInvoices}`);
    console.log(`  Enromatics invoices: ${enromaticsInvoices}`);

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

createMissingInvoices();
