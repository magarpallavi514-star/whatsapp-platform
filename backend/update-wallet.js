import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const client = new MongoClient(process.env.MONGODB_URI);

async function updateWallet() {
  try {
    await client.connect();
    const db = client.db('pixelswhatsapp');

    // Update Vaibhav invoice
    const result = await db.collection('invoices').updateOne(
      { accountId: '697dbe9a3348af7274236789' },
      {
        $set: {
          paidAmount: 7122,
          walletBalance: 375,
          updatedAt: new Date()
        }
      }
    );

    console.log('✅ Invoice updated:');
    console.log('  - paidAmount: ₹7122');
    console.log('  - walletBalance: ₹375');

    // Update account
    await db.collection('accounts').updateOne(
      { accountId: '2600003' },
      {
        $set: {
          walletBalance: 375,
          totalPayments: 7122
        }
      }
    );

    console.log('\n✅ Account updated:');
    console.log('  - walletBalance: ₹375');
    console.log('  - totalPayments: ₹7122');

    // Update payment
    await db.collection('payments').updateOne(
      { accountId: '697dbe9a3348af7274236789' },
      {
        $set: {
          amount: 7122,
          walletCredit: 375
        }
      }
    );

    console.log('\n✅ Payment updated:');
    console.log('  - amount: ₹7122');
    console.log('  - walletCredit: ₹375');

    console.log('\n📊 Summary:');
    console.log('  - Vaibhav paid: ₹7122');
    console.log('  - Invoice amount: ₹6747');
    console.log('  - Wallet balance: ₹375 (for next billing)');

    await client.close();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

updateWallet();
