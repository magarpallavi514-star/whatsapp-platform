const mongoose = require('mongoose');
require('dotenv').config();

async function findToken() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Get raw account document to see all fields
    const account = await mongoose.connection.db.collection('accounts').findOne({
      email: 'info@enromatics.com'
    });
    
    console.log('\n📋 FULL ACCOUNT DOCUMENT:\n');
    console.log(JSON.stringify(account, null, 2));
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  process.exit(0);
}

findToken();
