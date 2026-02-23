import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function deleteOldWABA() {
  try {
    console.log('\n🗑️  DELETING OLD WABA SETUP\n');
    console.log('='.repeat(70));
    
    await mongoose.connect(process.env.MONGODB_URI);
    
    const db = mongoose.connection.db;
    
    // Show what's currently there
    console.log('\n📊 BEFORE DELETE:\n');
    const accountBefore = await db.collection('accounts').findOne({ accountId: '2600001' });
    console.log('Account WABA ID:', accountBefore.wabaId);
    console.log('Account Business ID:', accountBefore.businessId || '(not set)');
    
    const phonesBefore = await db.collection('phonenumbers').find({ accountId: '2600001' }).toArray();
    console.log('Phone numbers:', phonesBefore.length);
    phonesBefore.forEach(p => {
      console.log('  -', p.displayPhone, '(WABA:', p.wabaId + ')');
    });
    
    // DELETE: Phone numbers with old WABA
    console.log('\n🗑️  Deleting phone numbers with old WABA 1536545574042607...');
    const phoneResult = await db.collection('phonenumbers').deleteMany({
      accountId: '2600001',
      wabaId: '1536545574042607'
    });
    console.log('✅ Deleted:', phoneResult.deletedCount, 'phone number(s)');
    
    // UPDATE: Clear WABA ID from account
    console.log('\n🗑️  Clearing WABA ID from account...');
    const accountResult = await db.collection('accounts').updateOne(
      { accountId: '2600001' },
      { 
        $set: { wabaId: null },
        $unset: { businessId: '' }
      }
    );
    console.log('✅ Cleared WABA ID and Business ID');
    
    // Show what's after
    console.log('\n📊 AFTER DELETE:\n');
    const accountAfter = await db.collection('accounts').findOne({ accountId: '2600001' });
    console.log('Account WABA ID:', accountAfter.wabaId || '(cleared) ✅');
    console.log('Account Business ID:', accountAfter.businessId || '(cleared) ✅');
    
    const phonesAfter = await db.collection('phonenumbers').find({ accountId: '2600001' }).toArray();
    console.log('Phone numbers:', phonesAfter.length);
    
    console.log('\n' + '='.repeat(70));
    console.log('✅ OLD WABA DELETED SUCCESSFULLY!\n');
    console.log('Now ready to connect NEW WABA: 1179018337647970\n');
    console.log('='.repeat(70) + '\n');
    
    await mongoose.connection.close();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

deleteOldWABA();
