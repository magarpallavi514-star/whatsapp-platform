import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://pixelsagency:Pm02072023@pixelsagency.664wxw1.mongodb.net/pixelswhatsapp';

async function addAccount() {
  try {
    await mongoose.connect(MONGODB_URI);
    
    const db = mongoose.connection.db;
    const accountsCollection = db.collection('accounts');
    
    // Create account with same details as user
    const result = await accountsCollection.insertOne({
      _id: '2600003',
      name: 'Enromatics',
      email: 'info@enromatics.com',
      phone: '+918087131777',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log('✅ Created Account for Enromatics:');
    console.log('ID:', result.insertedId);
    console.log('Name: Enromatics');
    console.log('Email: info@enromatics.com');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

addAccount();
