import mongoose from 'mongoose';

mongoose.connect('mongodb://localhost:27017/pixelswhatsapp').then(async () => {
  console.log('\n🗑️  DELETING ALL ENROMATICS RECORDS\n');
  
  const db = mongoose.connection;
  
  // Find enromatics account
  const account = await db.collection('accounts').findOne({ email: /enromatics/ });
  
  if (!account) {
    console.log('❌ No enromatics account found');
    process.exit(0);
  }
  
  console.log('✅ Found account:', account.email);
  console.log('   accountId:', account.accountId);
  const accountId = account.accountId;
  
  // Delete all records
  const collections = [
    { name: 'accounts', query: { email: /enromatics/ } },
    { name: 'phonenumbers', query: { accountId } },
    { name: 'conversations', query: { accountId } },
    { name: 'messages', query: { accountId } },
    { name: 'contacts', query: { accountId } },
    { name: 'users', query: { email: /enromatics/ } },
  ];
  
  console.log('\n🗑️  Deleting records...\n');
  
  for (const col of collections) {
    const result = await db.collection(col.name).deleteMany(col.query);
    if (result.deletedCount > 0) {
      console.log(`   ✅ Deleted ${result.deletedCount} from ${col.name}`);
    }
  }
  
  console.log('\n✅ DONE! Enromatics account completely deleted.\n');
  console.log('Now you can register fresh from the UI.\n');
  
  process.exit(0);
}).catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
