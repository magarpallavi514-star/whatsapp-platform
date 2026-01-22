import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://pixelsagency:Pm02072023@pixelsagency.664wxw1.mongodb.net/pixelswhatsapp';

async function check() {
  try {
    await mongoose.connect(MONGODB_URI);
    
    const db = mongoose.connection.db;
    const accountsCollection = db.collection('accounts');
    
    const account = await accountsCollection.findOne({ _id: new mongoose.Types.ObjectId('2600003') });
    
    console.log('Account 2600003:');
    console.log(account ? JSON.stringify(account, null, 2) : '❌ NOT FOUND');
    
    // Try as string
    const account2 = await accountsCollection.findOne({ _id: '2600003' });
    console.log('\nAccount 2600003 (as string):');
    console.log(account2 ? JSON.stringify(account2, null, 2) : '❌ NOT FOUND');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

check();
