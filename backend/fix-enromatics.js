import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function fix() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    
    // Check current data
    console.log('\n🔍 Current Enromatics record:');
    const current = await db.collection('accounts').findOne({ name: 'Enromatics' });
    console.log(JSON.stringify(current, null, 2));
    
    // Delete and recreate with proper ObjectId
    console.log('\n🗑️  Deleting old record...');
    await db.collection('accounts').deleteOne({ name: 'Enromatics' });
    
    console.log('✅ Creating new Enromatics account with proper ObjectId...');
    const newId = new mongoose.Types.ObjectId();
    
    const newEnromatics = {
      _id: newId,
      name: 'Enromatics',
      email: 'info@enromatics.com',
      accountId: 'eno_2600003',
      phone: '+918087131777',
      plan: 'free',
      status: 'active',
      type: 'client',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await db.collection('accounts').insertOne(newEnromatics);
    console.log('✅ New account created!');
    console.log('  _id:', newId);
    console.log('  accountId:', 'eno_2600003');
    console.log('  email:', 'info@enromatics.com');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fix();
