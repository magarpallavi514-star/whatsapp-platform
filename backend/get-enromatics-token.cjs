const mongoose = require('mongoose');
require('dotenv').config();

async function getToken() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const account = await mongoose.connection.db.collection('accounts').findOne({
      email: 'info@enromatics.com'
    });
    
    if (!account) {
      console.log('❌ Account not found');
      process.exit(1);
    }
    
    console.log('\n📱 ENROMATICS ACCOUNT INFO\n');
    console.log('Name:', account.name);
    console.log('Email:', account.email);
    console.log('Status:', account.status);
    
    if (account.integrationTokenHash) {
      console.log('\n✅ Account has integration token');
      console.log('Token Prefix:', account.integrationTokenPrefix);
      console.log('Token Hash:', account.integrationTokenHash);
    } else {
      console.log('\n❌ No integration token found');
    }
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  process.exit(0);
}

getToken();
