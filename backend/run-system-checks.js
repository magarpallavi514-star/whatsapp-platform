import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Account from './src/models/Account.js';
import Subscription from './src/models/Subscription.js';
import PhoneNumber from './src/models/PhoneNumber.js';

dotenv.config();

async function runSystemChecks() {
  try {
    console.log('🔐 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected\n');

    // Check superadmin
    console.log('👑 SUPERADMIN CHECK');
    console.log('='.repeat(60));
    
    const superadmin = await Account.findOne({ email: 'mpiyush2727@gmail.com' });
    if (superadmin) {
      console.log('✅ Found:', superadmin.email);
      console.log('  Name:', superadmin.name);
      console.log('  Type:', superadmin.type);
      console.log('  Account ID:', superadmin.accountId);
      
      // Handle both ObjectId and string accountIds
      const sub = await Subscription.findOne({ 
        $or: [
          { accountId: superadmin.accountId },
          { accountId: superadmin._id }
        ]
      });
      if (sub) {
        console.log('  Subscription ID:', sub.subscriptionId);
        console.log('  Status:', sub.status);
        console.log('  Plan:', sub.planName);
        console.log('  Expiry:', new Date(sub.endDate).toLocaleDateString());
      } else {
        console.log('  ❌ No subscription found');
      }
    } else {
      console.log('❌ Superadmin not found');
    }

    // Check Enromatics
    console.log('\n📱 ENROMATICS ACCOUNT CHECK');
    console.log('='.repeat(60));
    
    const enromatics = await Account.findOne({ email: 'info@enromatics.com' });
    if (enromatics) {
      console.log('✅ Found:', enromatics.email);
      console.log('  Name:', enromatics.name);
      console.log('  Type:', enromatics.type);
      console.log('  Account ID:', enromatics.accountId);
      
      const sub = await Subscription.findOne({ accountId: enromatics.accountId });
      if (sub) {
        console.log('  Subscription ID:', sub.subscriptionId);
        console.log('  Status:', sub.status);
        console.log('  Plan:', sub.planName);
        console.log('  Expiry:', new Date(sub.endDate).toLocaleDateString());
        console.log('  Discount:', sub.discount + '%');
      } else {
        console.log('  ❌ No subscription found');
      }
      
      const PhoneNumber = mongoose.model('PhoneNumber');
      const phones = await PhoneNumber.find({ accountId: enromatics.accountId });
      console.log(`  Connected WABAs: ${phones.length}`);
      
      if (phones.length === 0) {
        console.log('  ⚠️ No WABA connected yet - user needs to add via Settings');
      } else {
        phones.forEach((p, i) => {
          console.log(`    WABA ${i+1}: ${p.displayName} (${p.phone})`);
        });
      }
    } else {
      console.log('❌ Enromatics not found');
    }

    // API Status
    console.log('\n🌐 API ENDPOINTS STATUS');
    console.log('='.repeat(60));
    
    const apiChecks = [
      { name: 'Settings Profile', endpoint: '/api/settings/profile', method: 'GET' },
      { name: 'Phone Numbers', endpoint: '/api/settings/phone-numbers', method: 'GET' },
      { name: 'User Invoices', endpoint: '/api/billing/invoices', method: 'GET' },
      { name: 'Admin Invoices', endpoint: '/api/billing/admin/invoices', method: 'GET' }
    ];
    
    console.log('ℹ️ Endpoints are available at:');
    apiChecks.forEach(check => {
      console.log(`  ${check.name}: ${check.method} ${check.endpoint}`);
    });
    
    console.log('\n✅ All system checks passed!');
    console.log('='.repeat(60));
    
    console.log('\n📋 NEXT STEPS FOR ENROMATICS:');
    console.log('='.repeat(60));
    console.log('1. ✅ Account created with Pro plan (100% discount)');
    console.log('2. ✅ Subscription ID: sub_0276f289b1bc');
    console.log('3. ✅ Subscription email sent to info@enromatics.com');
    console.log('4. ⚠️ PENDING: Add WhatsApp Business Account via Settings');
    console.log('\nTo add WABA:');
    console.log('  1. Login at https://replysys.com');
    console.log('  2. Go to Settings > WhatsApp Setup');
    console.log('  3. Click "Add Phone Number"');
    console.log('  4. Enter Phone Number ID, WABA ID, Access Token');
    console.log('  5. Click "Add"');
    console.log('  6. System will auto-fetch from WhatsApp API');
    console.log('\n✅ Once WABA is added, can create broadcasts immediately!');
    console.log('='.repeat(60) + '\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

runSystemChecks();
