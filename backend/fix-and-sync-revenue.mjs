import mongoose from 'mongoose';

await mongoose.connect('mongodb+srv://pixelsagency:Pm02072023@pixelsagency.664wxw1.mongodb.net/pixelswhatsapp');

const db = mongoose.connection.db;

console.log('\n🔧 FIXING REVENUE MISMATCH & SYNCING DATA\n');

// Get all paid invoices
const invoices = await db.collection('invoices').find({ status: 'paid' }).toArray();

console.log(`Found ${invoices.length} paid invoices\n`);

// Group invoices by accountId
const byAccount = {};
const invalidAccounts = [];

invoices.forEach(inv => {
  const accId = inv.accountId;
  
  // Check if accountId is valid ObjectId format
  if (!mongoose.Types.ObjectId.isValid(accId)) {
    invalidAccounts.push({
      invoice: inv.invoiceNumber,
      accountId: accId,
      amount: inv.paidAmount
    });
    return;
  }
  
  if (!byAccount[accId]) {
    byAccount[accId] = { invoices: [], total: 0, lastDate: null };
  }
  byAccount[accId].invoices.push(inv);
  byAccount[accId].total += inv.paidAmount || 0;
  if (!byAccount[accId].lastDate || new Date(inv.paidDate) > new Date(byAccount[accId].lastDate)) {
    byAccount[accId].lastDate = inv.paidDate;
  }
});

// Show invalid accounts
if (invalidAccounts.length > 0) {
  console.log('⚠️  INVOICES WITH INVALID ACCOUNT IDS (Cannot sync):');
  invalidAccounts.forEach(inv => {
    console.log(`  Invoice: ${inv.invoice}`);
    console.log(`  Invalid accountId: ${inv.accountId}`);
    console.log(`  Amount: ₹${inv.amount}\n`);
  });
}

// Update each valid account
let updated = 0;
for (const [accountId, data] of Object.entries(byAccount)) {
  try {
    const result = await db.collection('accounts').updateOne(
      { _id: new mongoose.Types.ObjectId(accountId) },
      { 
        $set: { 
          totalPayments: data.total,
          lastPaymentDate: data.lastDate
        }
      }
    );
    
    if (result.modifiedCount > 0) {
      updated++;
      console.log(`✅ Updated Account: ${accountId}`);
      console.log(`   Total Payments: ₹${data.total}`);
      console.log(`   Last Payment: ${new Date(data.lastDate).toISOString().split('T')[0]}`);
      console.log(`   Invoices: ${data.invoices.length}\n`);
    }
  } catch (e) {
    console.log(`❌ Failed to update ${accountId}: ${e.message}`);
  }
}

console.log(`\n📊 SYNC COMPLETE: ${updated} accounts updated\n`);

// Verify
const validInvoices = invoices.filter(inv => mongoose.Types.ObjectId.isValid(inv.accountId));
const totalFromValidInvoices = validInvoices.reduce((sum, inv) => sum + (inv.paidAmount || 0), 0);
const accounts = await db.collection('accounts').find({ totalPayments: { $gt: 0 } }).toArray();
const totalFromAccounts = accounts.reduce((sum, acc) => sum + (acc.totalPayments || 0), 0);

console.log(`✅ VERIFICATION:`);
console.log(`   Valid Invoice Total (with matching accounts): ₹${totalFromValidInvoices}`);
console.log(`   Account Total: ₹${totalFromAccounts}`);
console.log(`   Match: ${totalFromValidInvoices === totalFromAccounts ? '✅ YES' : '❌ NO'}\n`);

if (invalidAccounts.length > 0) {
  const invalidTotal = invalidAccounts.reduce((sum, inv) => sum + inv.amount, 0);
  console.log(`📌 NOTE: ₹${invalidTotal} in invoices cannot be synced due to invalid account IDs`);
  console.log(`   These need manual account creation or invoice correction\n`);
}

await mongoose.disconnect();
