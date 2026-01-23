const mongoose = require('mongoose');

const phoneSchema = new mongoose.Schema({}, { collection: 'phonenumbers' });
const PhoneNumber = mongoose.model('PhoneNumber', phoneSchema);

mongoose.connect(process.env.MONGODB_URI, { 
  connectTimeoutMS: 5000,
  serverSelectionTimeoutMS: 5000 
}).then(async () => {
  const results = await PhoneNumber.find({
    phoneNumberId: { $in: ['889344924259692', '1003427786179738'] }
  });
  
  console.log('\n📱 WABA CHECK');
  console.log('═'.repeat(50));
  
  const superadmin = results.find(p => p.phoneNumberId === '889344924259692');
  const enromatics = results.find(p => p.phoneNumberId === '1003427786179738');
  
  if (superadmin) {
    console.log('✅ Superadmin WABA EXISTS');
    console.log('   Phone ID: 889344924259692');
    console.log('   AccountId: ' + superadmin.accountId);
  } else {
    console.log('❌ Superadmin WABA NOT FOUND');
  }
  
  if (enromatics) {
    console.log('✅ Enromatics WABA EXISTS');
    console.log('   Phone ID: 1003427786179738');
    console.log('   AccountId: ' + enromatics.accountId);
  } else {
    console.log('❌ Enromatics WABA NOT FOUND');
  }
  
  console.log('═'.repeat(50) + '\n');
  
  process.exit(0);
}).catch(err => {
  console.log('❌ DB Error: ' + err.message);
  process.exit(1);
});
