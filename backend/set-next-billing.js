import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function setNextBillingDates() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;

    console.log('\n📅 Setting Next Billing Dates for Clients\n');

    // Get all invoices
    const invoices = await db.collection('invoices').find({}).toArray();
    
    for (const invoice of invoices) {
      // Get the account
      const account = await db.collection('accounts').findOne({ 
        _id: new mongoose.Types.ObjectId(invoice.accountId) 
      });

      if (!account) continue;

      // Calculate next billing date based on invoice date + billing cycle
      let nextBillingDate = new Date(invoice.invoiceDate);
      
      if (account.billingCycle === 'annual') {
        nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
      } else if (account.billingCycle === 'quarterly') {
        nextBillingDate.setMonth(nextBillingDate.getMonth() + 3);
      } else {
        // Monthly (default)
        nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
      }

      // Update account with next billing date
      const result = await db.collection('accounts').updateOne(
        { _id: new mongoose.Types.ObjectId(invoice.accountId) },
        { $set: { nextBillingDate } }
      );

      console.log(`✅ ${account.name} (${account.accountId})`);
      console.log(`   Billing Cycle: ${account.billingCycle}`);
      console.log(`   Invoice Date: ${new Date(invoice.invoiceDate).toLocaleDateString('en-IN')}`);
      console.log(`   Next Billing: ${nextBillingDate.toLocaleDateString('en-IN', {day: 'numeric', month: 'long', year: 'numeric'})}`);
      console.log();
    }

    // Verify the changes
    console.log('\n✅ VERIFICATION:\n');
    const updatedAccounts = await db.collection('accounts').find({ type: 'client' }).toArray();
    updatedAccounts.forEach(acc => {
      console.log(`${acc.name}: Next Billing = ${acc.nextBillingDate ? new Date(acc.nextBillingDate).toLocaleDateString('en-IN', {day: 'numeric', month: 'long', year: 'numeric'}) : 'Not Set'}`);
    });

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

setNextBillingDates();
