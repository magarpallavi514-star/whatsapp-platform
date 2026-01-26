const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/whatsapp-platform')
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection;
    
    // Check Account collection
    console.log('\n📊 ACCOUNT COLLECTION:');
    const accountCount = await db.collection('accounts').countDocuments();
    console.log(`Total accounts: ${accountCount}`);
    const accounts = await db.collection('accounts').find({}).project({ email: 1, name: 1, accountId: 1, _id: 1 }).toArray();
    accounts.forEach(acc => {
      console.log(`  - ${acc.email} (accountId: ${acc.accountId}, _id: ${acc._id})`);
    });
    
    // Check User collection
    console.log('\n📊 USER COLLECTION (Legacy):');
    const userCount = await db.collection('users').countDocuments();
    console.log(`Total users: ${userCount}`);
    const users = await db.collection('users').find({}).project({ email: 1, name: 1, accountId: 1, _id: 1 }).toArray();
    users.forEach(user => {
      console.log(`  - ${user.email} (accountId: ${user.accountId}, _id: ${user._id})`);
    });
    
    mongoose.connection.close();
    console.log('\n✅ Done');
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
