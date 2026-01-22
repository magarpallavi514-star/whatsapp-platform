import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://pixelsagency:Pm02072023@pixelsagency.664wxw1.mongodb.net/pixelswhatsapp';

async function verify() {
  try {
    await mongoose.connect(MONGODB_URI);
    
    const db = mongoose.connection.db;
    const accountsCollection = db.collection('accounts');
    
    const account = await accountsCollection.findOne({ _id: '2600003' });
    
    console.log('✅ Enromatics Account EXISTS:');
    console.log(JSON.stringify(account, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

verify();
