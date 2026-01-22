import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Account from './src/models/Account.js';
import Subscription from './src/models/Subscription.js';
import PhoneNumber from './src/models/PhoneNumber.js';
import Template from './src/models/Template.js';
import Invoice from './src/models/Invoice.js';
import Broadcast from './src/models/Broadcast.js';

dotenv.config();

async function investigateAccounts() {
  try {
    console.log('🔐 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected\n');

    const accounts = [
      { email: 'mpiyush2727@gmail.com', name: 'Superadmin' },
      { email: 'info@enromatics.com', name: 'Enromatics' }
    ];

    for (const accountInfo of accounts) {
      console.log('\n' + '='.repeat(70));
      console.log(`👤 ${accountInfo.name.toUpperCase()}`);
      console.log('='.repeat(70));

      const account = await Account.findOne({ email: accountInfo.email });
      if (!account) {
        console.log(`❌ Account not found: ${accountInfo.email}`);
        continue;
      }

      // Basic info
      console.log(`Email: ${account.email}`);
      console.log(`Account ID: ${account.accountId}`);
      console.log(`Type: ${account.type}`);

      // Subscription
      console.log('\n📋 SUBSCRIPTION:');
      const sub = await Subscription.findOne({ 
        accountId: account._id 
      });
      if (sub) {
        console.log(`  ✅ Plan: ${sub.planName}`);
        console.log(`  ID: ${sub.subscriptionId}`);
        console.log(`  Status: ${sub.status}`);
        console.log(`  Expiry: ${new Date(sub.endDate).toLocaleDateString()}`);
      } else {
        console.log(`  ❌ NO SUBSCRIPTION`);
      }

      // WABA Status
      console.log('\n🔌 WHATSAPP (WABA):');
      const phones = await PhoneNumber.find({ accountId: account.accountId });
      if (phones.length === 0) {
        console.log(`  ❌ NO WABA CONNECTED`);
        console.log(`  ⚠️ User must add phone in Settings > WhatsApp Setup`);
      } else {
        phones.forEach((p, i) => {
          console.log(`  ✅ WABA ${i+1}: ${p.displayName} (${p.phone})`);
          console.log(`     Phone ID: ${p.phoneNumberId}`);
          console.log(`     Active: ${p.isActive ? '✅' : '❌'}`);
        });
      }

      // Templates
      console.log('\n📝 TEMPLATES:');
      const templates = await Template.countDocuments({ accountId: account.accountId, deleted: false });
      console.log(`  ${templates} templates`);

      // Broadcasts
      console.log('\n📢 BROADCASTS:');
      const broadcasts = await Broadcast.countDocuments({ accountId: account.accountId });
      console.log(`  ${broadcasts} broadcasts`);

      // Invoices
      console.log('\n💳 INVOICES:');
      const invoices = await Invoice.countDocuments({ accountId: account.accountId });
      console.log(`  ${invoices} invoices`);

      // Status Summary
      console.log('\n📊 STATUS SUMMARY:');
      const hasWaba = phones.length > 0 && phones.some(p => p.isActive);
      const hasSub = !!sub && sub.status === 'active';
      
      if (hasSub && hasWaba) {
        console.log('  ✅ READY - All features available');
      } else if (hasSub && !hasWaba) {
        console.log('  ⚠️ INCOMPLETE - Subscription OK, need to add WABA in Settings');
      } else if (!hasSub && hasWaba) {
        console.log('  ⚠️ INCOMPLETE - WABA OK, need active subscription');
      } else {
        console.log('  ❌ BLOCKED - Missing subscription AND WABA');
      }

      // What's blocking
      if (!hasWaba) {
        console.log('\n🚫 BLOCKED FEATURES (without WABA):');
        console.log('  - Broadcasts');
        console.log('  - Live Chat');
        console.log('  - Send Messages');
        console.log('  - Campaigns');
        console.log('\n✅ AVAILABLE FEATURES (no WABA needed):');
        console.log('  - Templates (view/create)');
        console.log('  - Invoices');
        console.log('  - Account Settings');
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log('✅ INVESTIGATION COMPLETE\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

investigateAccounts();
