require('dotenv').config();
const mongoose = require('mongoose');

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { 
      serverSelectionTimeoutMS: 3000 
    });
    
    const db = mongoose.connection.db;
    const phones = db.collection('phonenumbers');
    
    const superadmin = await phones.findOne({ phoneNumberId: '889344924259692' });
    const enromatics = await phones.findOne({ phoneNumberId: '1003427786179738' });
    
    console.log('\n📱 WABA STATUS:');
    console.log('─'.repeat(50));
    console.log(superadmin ? '✅ Superadmin: EXISTS' : '❌ Superadmin: MISSING');
    console.log(enromatics ? '✅ Enromatics: EXISTS' : '❌ Enromatics: MISSING');
    console.log('─'.repeat(50) + '\n');
    
  } catch (e) {
    console.log('❌ Connection failed:', e.message);
  } finally {
    mongoose.connection.close();
  }
}
check();
