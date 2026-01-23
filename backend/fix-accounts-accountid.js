import mongoose from 'mongoose';
import Account from './src/models/Account.js';

async function fixEnromaticsAccount() {
  try {
    await mongoose.connect('mongodb+srv://pixels:bnVtYmVyMjU5OA@pixelswhatsapp.7u1vk.mongodb.net/pixelswhatsapp?retryWrites=true&w=majority', {
      serverSelectionTimeoutMS: 3000
    });
    
    console.log('🔍 Checking Enromatics account...\n');
    
    // Find Enromatics by email
    const enromatics = await Account.findOne({ email: 'info@enromatics.com' });
    
    if (!enromatics) {
      console.error('❌ Enromatics account not found');
      process.exit(1);
    }
    
    console.log('📊 Current Enromatics account:');
    console.log('  _id:', enromatics._id);
    console.log('  accountId:', enromatics.accountId);
    console.log('  email:', enromatics.email);
    
    if (!enromatics.accountId) {
      console.log('\n⚠️  accountId is missing! Setting it to: eno_' + enromatics._id);
      
      const newAccountId = 'eno_' + enromatics._id;
      enromatics.accountId = newAccountId;
      await enromatics.save();
      
      console.log('✅ Updated Enromatics accountId to:', newAccountId);
    } else {
      console.log('✅ accountId already set:', enromatics.accountId);
    }
    
    // Also check pixels_internal
    console.log('\n🔍 Checking pixels_internal account...\n');
    const superadmin = await Account.findOne({ accountId: 'pixels_internal' });
    if (superadmin) {
      console.log('✅ pixels_internal account exists');
      console.log('  _id:', superadmin._id);
      console.log('  accountId:', superadmin.accountId);
      console.log('  type:', superadmin.type);
    } else {
      console.log('⚠️  pixels_internal account NOT found - need to create it');
      
      const newSuperadmin = new Account({
        accountId: 'pixels_internal',
        name: 'Pixels Internal',
        email: 'admin@pixels.com',
        type: 'internal',
        plan: 'enterprise',
        status: 'active'
      });
      
      await newSuperadmin.save();
      console.log('✅ Created pixels_internal account');
      console.log('  _id:', newSuperadmin._id);
      console.log('  accountId:', newSuperadmin.accountId);
    }
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    console.error('Stack:', err.stack);
    process.exit(1);
  }
}

fixEnromaticsAccount();
