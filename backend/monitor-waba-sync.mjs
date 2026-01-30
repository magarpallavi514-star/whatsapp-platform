#!/usr/bin/env node

/**
 * WABA Sync Flow Monitoring & Debug Tool
 * Tracks entire OAuth → Webhook → Business ID sync pipeline
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const mongoUri = process.env.MONGODB_URI;

async function monitorSync() {
  try {
    console.log('\n' + '='.repeat(70));
    console.log('🔍 WABA SYNC FLOW MONITOR');
    console.log('='.repeat(70) + '\n');
    
    await mongoose.connect(mongoUri);
    const db = mongoose.connection.db;
    
    // 1. Check Account Status
    console.log('📧 STEP 1: Find Account\n');
    
    const account = await db.collection('accounts').findOne({ email: 'info@enromatics.com' });
    
    if (!account) {
      console.log('❌ Account not found - user needs to sign up first\n');
      process.exit(0);
    }
    
    console.log(`✅ Account found: ${account.name} (${account.accountId})\n`);
    
    // 2. Check OAuth Status (WABA ID + Phone Numbers)
    console.log('🔐 STEP 2: OAuth Status (WABA ID Synced?)\n');
    
    const phones = await db.collection('phonenumbers').find({ accountId: account.accountId }).toArray();
    
    if (account.wabaId && phones.length > 0) {
      console.log(`✅ OAuth completed successfully:`);
      console.log(`   WABA ID: ${account.wabaId}`);
      console.log(`   Phone Numbers: ${phones.length} connected`);
      phones.forEach((p, i) => {
        console.log(`     ${i+1}. ${p.displayPhone} (ID: ${p.phoneNumberId})`);
      });
      console.log('');
    } else {
      console.log(`⏳ OAuth pending:`);
      console.log(`   WABA ID: ${account.wabaId ? '✅ ' + account.wabaId : '❌ Not yet'}`);
      console.log(`   Phone Numbers: ${phones.length > 0 ? '✅ ' + phones.length : '❌ None'}`);
      console.log('   → User needs to complete OAuth flow\n');
    }
    
    // 3. Check Webhook Status (Business ID)
    console.log('🔗 STEP 3: Webhook Status (Business ID Synced?)\n');
    
    if (account.businessId) {
      console.log(`✅ Webhook received - Business ID synced:`);
      console.log(`   Business ID: ${account.businessId}`);
      
      if (account.metaSync) {
        console.log(`   Last webhook: ${account.metaSync.lastWebhookAt ? new Date(account.metaSync.lastWebhookAt).toLocaleString() : 'Unknown'}`);
        console.log(`   Sync status: ${account.metaSync.isSynced ? '✅ Synced' : '❌ Not synced'}`);
        console.log(`   Meta status: ${account.metaSync.metaStatus || 'Unknown'}`);
      }
      console.log('');
    } else {
      console.log(`⏳ Business ID not yet received from webhook`);
      console.log(`   This is normal - Meta takes 5-10 seconds to send account_update event\n`);
      console.log('   📍 TROUBLESHOOTING:');
      console.log('   1. Check your Meta Business Account webhook logs');
      console.log('   2. Verify webhook URL is https (not http)');
      console.log('   3. Ensure webhook is subscribed to "account_update" field');
      console.log('   4. Check that your WABA is properly linked to Business Account\n');
    }
    
    // 4. Final Status
    console.log('📊 STEP 4: Overall Status\n');
    
    const oauthDone = account.wabaId && phones.length > 0;
    const webhookDone = account.businessId;
    const ready = oauthDone && webhookDone;
    
    console.log('Status Chart:');
    console.log(`  [${ oauthDone ? '✅' : '⏳'}] OAuth: WABA ID + Phone Numbers`);
    console.log(`  [${ webhookDone ? '✅' : '⏳'}] Webhook: Business ID received`);
    console.log(`  [${ ready ? '✅' : '⏳'}] Realtime Ready: All components synced\n`);
    
    if (ready) {
      console.log('🟢 ✅ SYSTEM READY FOR REALTIME CHAT\n');
      console.log('Your WhatsApp Business Account is fully integrated:');
      console.log(`  - WABA ID: ${account.wabaId}`);
      console.log(`  - Business ID: ${account.businessId}`);
      console.log(`  - Phone Numbers: ${phones.length}`);
      console.log('');
    } else {
      console.log('🟡 SETUP INCOMPLETE - Next steps:\n');
      
      if (!oauthDone) {
        console.log('1️⃣  Complete OAuth:');
        console.log('    → Go to Settings > Connect WhatsApp');
        console.log('    → Authorize with your Meta Business Account');
        console.log('    → Select your WABA and Phone Number\n');
      }
      
      if (oauthDone && !webhookDone) {
        console.log('2️⃣  Wait for Webhook:');
        console.log('    → Meta should send Business ID within 5-10 seconds');
        console.log('    → If waiting longer, refresh page in 30 seconds');
        console.log('    → Check webhook logs at: Meta App > Webhooks\n');
      }
    }
    
    // 5. Raw Data for Debugging
    console.log('📋 RAW DATA (for debugging):\n');
    
    console.log('Account fields:');
    console.log(JSON.stringify({
      accountId: account.accountId,
      name: account.name,
      email: account.email,
      wabaId: account.wabaId,
      businessId: account.businessId,
      status: account.status,
      metaSyncStatus: account.metaSync?.isSynced,
      metaStatus: account.metaSync?.metaStatus
    }, null, 2));
    
    console.log('\nPhone numbers:');
    if (phones.length === 0) {
      console.log('  (none)');
    } else {
      phones.forEach((p, i) => {
        console.log(JSON.stringify({
          index: i + 1,
          displayPhone: p.displayPhone,
          phoneNumberId: p.phoneNumberId,
          wabaId: p.wabaId,
          isActive: p.isActive,
          qualityRating: p.qualityRating,
          verifiedAt: p.verifiedAt
        }, null, 2));
      });
    }
    
    console.log('\n' + '='.repeat(70) + '\n');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

monitorSync();
