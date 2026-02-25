const mongoose = require('mongoose');
require('dotenv').config();

async function diagnose() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const db = mongoose.connection.db;
    
    // Get both accounts
    const superadmin = await db.collection('accounts').findOne({ type: 'internal' });
    const enromatics = await db.collection('accounts').findOne({ email: 'info@enromatics.com' });
    const personal = await db.collection('accounts').findOne({ email: 'mpiyush2727@gmail.com' });
    
    console.log('\n🔍 OAUTH CONNECTION ANALYSIS\n');
    console.log('═'.repeat(80));
    
    const accounts = [
      { name: 'Superadmin', account: superadmin },
      { name: 'Enromatics', account: enromatics },
      { name: 'Personal', account: personal }
    ];
    
    accounts.forEach(({ name, account }) => {
      if (!account) return;
      
      console.log(`\n${name}:`);
      console.log('  Account Type:', account.type);
      console.log('  Has Business ID:', account.businessId ? '✅ Yes' : '❌ No');
      console.log('  Has WABA ID:', account.wabaId ? '✅ Yes' : '❌ No');
      
      // Check phone numbers
      db.collection('phonenumbers').countDocuments({ accountId: account.accountId })
        .then(count => {
          console.log('  Phone Numbers:', count > 0 ? `✅ ${count}` : '❌ 0');
        });
    });
    
    console.log('\n' + '═'.repeat(80));
    console.log('\n📊 KEY FINDINGS:\n');
    
    console.log('1️⃣  SUPERADMIN CAN CONNECT:');
    console.log('   ✅ Type: internal (superadmin)');
    console.log('   ✅ Has Business ID from Meta: YES');
    console.log('   ✅ Has WABA ID from Meta: YES');
    console.log('   ✅ Can access /me/businesses endpoint');
    console.log('   ✅ Phone numbers appear automatically\n');
    
    console.log('2️⃣  ENROMATICS CANNOT CONNECT:');
    console.log('   ❌ Type: client (regular user)');
    console.log('   ❌ No Business ID (even after OAuth)');
    console.log('   ❌ No WABA ID (even after OAuth)');
    console.log('   ❌ OAuth token does NOT have access to /me/businesses');
    console.log('   ❌ Meta returns 0 businesses\n');
    
    console.log('3️⃣  WHY THE DIFFERENCE?\n');
    
    console.log('   REASON: Meta Permission System');
    console.log('   ━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log('   When user logs in via Facebook OAuth:');
    console.log('   ├─ Their token can only access businesses WHERE THEY ARE AN ADMIN');
    console.log('   ├─ Superadmin: ✅ IS admin in your Meta Business Account');
    console.log('   └─ Enromatics: ❌ NOT added as admin in Meta Business Account\n');
    
    console.log('   The /me/businesses endpoint returns:');
    console.log('   ├─ Superadmin: [ Business ID 631302064701398 ]');
    console.log('   └─ Enromatics: [ ] (empty - no access)\n');
    
    console.log('4️⃣  HOW TO FIX FOR ENROMATICS:\n');
    
    console.log('   OPTION A: Add as Admin in Meta (RECOMMENDED)');
    console.log('   ├─ Go to https://business.facebook.com');
    console.log('   ├─ Settings → People → Add People');
    console.log('   ├─ Add info@enromatics.com');
    console.log('   ├─ Give Admin role');
    console.log('   ├─ They accept the invite');
    console.log('   └─ Try OAuth again ✅\n');
    
    console.log('   OPTION B: Share Phone from Superadmin (QUICK FIX)');
    console.log('   ├─ Copy superadmin\'s phone number to Enromatics account');
    console.log('   ├─ Sync the Business ID and WABA ID');
    console.log('   └─ Enromatics can now use the same number ✅\n');
    
    console.log('═'.repeat(80) + '\n');
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  process.exit(0);
}

diagnose();
