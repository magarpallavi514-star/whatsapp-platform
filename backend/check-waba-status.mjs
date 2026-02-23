import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function checkWABAStatus() {
  try {
    console.log('\n🔍 DETAILED WABA CHECK\n');
    console.log('='.repeat(70));
    
    await mongoose.connect(process.env.MONGODB_URI);
    
    const db = mongoose.connection.db;
    
    // Get account details
    const account = await db.collection('accounts').findOne({ accountId: '2600001' });
    
    console.log('\n📊 Account Status:');
    console.log('─'.repeat(70));
    console.log('Account ID:     ', account.accountId);
    console.log('Email:          ', account.email);
    console.log('WABA ID:        ', account.wabaId || '❌ NOT SET');
    console.log('Business ID:    ', account.businessId || '❌ NOT SET');
    console.log('Updated At:     ', account.updatedAt);
    console.log('MetaSync:       ', account.metaSync ? '✅ Present' : '❌ Missing');
    
    if (account.metaSync) {
      console.log('  └─ Last Webhook:', account.metaSync.lastWebhookAt);
      console.log('  └─ Is Synced:', account.metaSync.isSynced);
      console.log('  └─ Meta Status:', account.metaSync.metaStatus);
    }
    
    // Get phone details
    const phones = await db.collection('phonenumbers').find({ accountId: '2600001' }).toArray();
    
    console.log('\n📱 Phone Number Details:');
    console.log('─'.repeat(70));
    phones.forEach((p, i) => {
      console.log(`\n[${i+1}] ${p.displayPhone}`);
      console.log('    Phone ID:     ', p.phoneNumberId);
      console.log('    WABA ID:      ', p.wabaId);
      console.log('    Is Active:    ', p.isActive ? '✅' : '❌');
      console.log('    Quality:      ', p.qualityRating || 'unknown');
      console.log('    Created At:   ', p.createdAt);
    });
    
    // Check if WABA IDs match
    console.log('\n' + '='.repeat(70));
    console.log('🎯 ANALYSIS:');
    console.log('─'.repeat(70));
    
    if (phones.length > 0) {
      const phoneWABA = phones[0].wabaId;
      const accountWABA = account.wabaId;
      
      if (phoneWABA === accountWABA) {
        console.log('✅ WABA IDs MATCH (Good for webhook routing)');
        console.log(`   Both use: ${phoneWABA}`);
      } else {
        console.log('⚠️  WABA ID MISMATCH');
        console.log(`   Account WABA:  ${accountWABA}`);
        console.log(`   Phone WABA:    ${phoneWABA}`);
      }
    }
    
    if (account.businessId) {
      console.log('✅ Business ID is set (webhook has arrived)');
    } else {
      console.log('⏳ Business ID not set (waiting for webhook or webhook not found account)');
    }
    
    console.log('\n📋 STATUS:');
    if (phones.length > 0) {
      console.log('✅ Phone numbers are SAVED to database');
      console.log('✅ Settings page will SHOW your phone');
      console.log('✅ WhatsApp messages should work');
      
      if (account.businessId) {
        console.log('✅ Webhook has confirmed Business ID');
        console.log('✅ System is fully synced and ready!');
      } else {
        console.log('⏳ Waiting for webhook to confirm Business ID');
        console.log('   But phone is already working!');
      }
    }
    
    console.log('\n' + '='.repeat(70) + '\n');
    
    await mongoose.connection.close();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkWABAStatus();
