import mongoose from 'mongoose';

mongoose.connect('mongodb://localhost:27017/pixelswhatsapp').then(async () => {
  try {
    const result = await mongoose.connection.collection('accounts').insertOne({
      email: 'info@enromatics.com',
      name: 'Enromatics Ind',
      accountId: '2600005',
      plan: 'pro',
      status: 'active',
      billingCycle: 'annually',
      nextBillingDate: new Date('2027-01-26'),
      type: 'client',
      createdAt: new Date('2026-01-26'),
      updatedAt: new Date(),
      __v: 0
    });
    
    console.log('✅ Account created in Account collection');
    console.log('   _id:', result.insertedId);
    console.log('   email: info@enromatics.com');
    console.log('   accountId: 2600005');
    console.log('   plan: pro');
    console.log('   status: active');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}).catch(err => {
  console.error('❌ Connection error:', err.message);
  process.exit(1);
});
