import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Account from './src/models/Account.js';
import PhoneNumber from './src/models/PhoneNumber.js';
import Message from './src/models/Message.js';
import Conversation from './src/models/Conversation.js';

dotenv.config();

async function testWabaIsolation() {
  try {
    console.log('\n' + '='.repeat(70));
    console.log('🧪 WABA ISOLATION TEST');
    console.log('='.repeat(70));
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pixelswhatsapp');
    console.log('✅ MongoDB connected');
    
    // ========== TEST 1: Account WABA Mapping ==========
    console.log('\n📋 TEST 1: Account WABA Mapping');
    console.log('-'.repeat(70));
    
    const accounts = await Account.find({}).select('_id accountId name wabaId');
    console.log(`📊 Total accounts: ${accounts.length}`);
    
    accounts.forEach((acc, idx) => {
      console.log(`\n${idx + 1}. ${acc.name}`);
      console.log(`   MongoDB _id: ${acc._id}`);
      console.log(`   accountId (String): ${acc.accountId}`);
      console.log(`   WABA ID: ${acc.wabaId || '⚠️ NOT SET'}`);
    });
    
    // ========== TEST 2: Phone Number Configuration ==========
    console.log('\n\n📋 TEST 2: Phone Number Configuration');
    console.log('-'.repeat(70));
    
    const phones = await PhoneNumber.find({})
      .select('_id accountId phoneNumberId wabaId isActive')
      .populate('accountId', 'accountId name');
    
    console.log(`📊 Total phone numbers: ${phones.length}`);
    
    phones.forEach((phone, idx) => {
      console.log(`\n${idx + 1}. Phone: ${phone.phoneNumberId}`);
      console.log(`   Account: ${phone.accountId?.name} (${phone.accountId?.accountId})`);
      console.log(`   WABA ID: ${phone.wabaId}`);
      console.log(`   Active: ${phone.isActive ? '✅' : '❌'}`);
    });
    
    // ========== TEST 3: WABA Uniqueness Check ==========
    console.log('\n\n📋 TEST 3: WABA Uniqueness Check');
    console.log('-'.repeat(70));
    
    const wabaCounts = await Account.aggregate([
      { $group: { _id: '$wabaId', count: { $sum: 1 }, accounts: { $push: '$accountId' } } },
      { $match: { count: { $gt: 1 } } }
    ]);
    
    if (wabaCounts.length === 0) {
      console.log('✅ NO CONFLICTS: Each WABA ID is unique per account');
    } else {
      console.log('🚨 CONFLICTS FOUND:');
      wabaCounts.forEach(waba => {
        console.log(`   WABA ${waba._id} used by ${waba.count} accounts: ${waba.accounts.join(', ')}`);
      });
    }
    
    // ========== TEST 4: Message Isolation ==========
    console.log('\n\n📋 TEST 4: Message Isolation by Account');
    console.log('-'.repeat(70));
    
    const messageStats = await Message.aggregate([
      { $group: { _id: '$accountId', count: { $sum: 1 } } },
      { $lookup: { from: 'accounts', localField: '_id', foreignField: '_id', as: 'account' } },
      { $unwind: { path: '$account', preserveNullAndEmptyArrays: true } }
    ]);
    
    console.log(`📊 Messages per account:`);
    messageStats.forEach((stat, idx) => {
      const accountName = stat.account?.name || 'UNKNOWN';
      const accountId = stat.account?.accountId || 'N/A';
      console.log(`   ${idx + 1}. ${accountName} (${accountId}): ${stat.count} messages`);
    });
    
    // ========== TEST 5: Conversation Isolation ==========
    console.log('\n\n📋 TEST 5: Conversation Isolation by Account');
    console.log('-'.repeat(70));
    
    const convStats = await Conversation.aggregate([
      { $group: { _id: '$accountId', count: { $sum: 1 } } },
      { $lookup: { from: 'accounts', localField: '_id', foreignField: '_id', as: 'account' } },
      { $unwind: { path: '$account', preserveNullAndEmptyArrays: true } }
    ]);
    
    console.log(`📊 Conversations per account:`);
    convStats.forEach((stat, idx) => {
      const accountName = stat.account?.name || 'UNKNOWN';
      const accountId = stat.account?.accountId || 'N/A';
      console.log(`   ${idx + 1}. ${accountName} (${accountId}): ${stat.count} conversations`);
    });
    
    // ========== TEST 6: Cross-Account Data Leak Check ==========
    console.log('\n\n📋 TEST 6: Cross-Account Data Leak Check');
    console.log('-'.repeat(70));
    
    let leakDetected = false;
    
    for (const account of accounts) {
      // Check if this account's phone config matches its messages
      const accountPhones = await PhoneNumber.find({ accountId: account._id }).select('phoneNumberId');
      const accountMessages = await Message.find({ accountId: account._id }).select('phoneNumberId');
      
      // Messages should only be from this account's phones
      const accountPhoneIds = accountPhones.map(p => p.phoneNumberId);
      const messagePhoneIds = new Set(accountMessages.map(m => m.phoneNumberId));
      
      messagePhoneIds.forEach(phoneId => {
        if (!accountPhoneIds.includes(phoneId)) {
          console.log(`🚨 LEAK DETECTED: ${account.name} has messages from phone ${phoneId} it doesn't own!`);
          leakDetected = true;
        }
      });
    }
    
    if (!leakDetected) {
      console.log('✅ NO DATA LEAKS: All messages are from owned phone numbers');
    }
    
    // ========== TEST 7: Webhook Routing Simulation ==========
    console.log('\n\n📋 TEST 7: Webhook Routing Simulation');
    console.log('-'.repeat(70));
    
    // Simulate webhook with WABA ID
    console.log('\n📥 Simulating webhook for each WABA:');
    
    for (const account of accounts) {
      if (!account.wabaId) {
        console.log(`\n⚠️  ${account.name}: No WABA ID set - webhook won't route!`);
        continue;
      }
      
      // Find phone config for this account
      const phoneConfig = await PhoneNumber.findOne({ 
        accountId: account._id,
        wabaId: account.wabaId
      });
      
      if (phoneConfig) {
        console.log(`\n✅ ${account.name}:`);
        console.log(`   WABA ID: ${account.wabaId}`);
        console.log(`   Routes to Account: ${account._id}`);
        console.log(`   Phone Config found: ${phoneConfig.phoneNumberId}`);
      } else {
        console.log(`\n❌ ${account.name}:`);
        console.log(`   WABA ID: ${account.wabaId}`);
        console.log(`   Routes to Account: ${account._id}`);
        console.log(`   ⚠️ NO PHONE CONFIG FOUND!`);
      }
    }
    
    // ========== FINAL VERDICT ==========
    console.log('\n\n' + '='.repeat(70));
    console.log('📊 FINAL VERDICT');
    console.log('='.repeat(70));
    
    const hasWabaMapping = accounts.every(a => a.wabaId);
    const noConflicts = wabaCounts.length === 0;
    const noLeaks = !leakDetected;
    
    console.log(`\n✅ All accounts have WABA IDs: ${hasWabaMapping ? 'YES ✓' : 'NO ✗'}`);
    console.log(`✅ No WABA conflicts: ${noConflicts ? 'YES ✓' : 'NO ✗'}`);
    console.log(`✅ No cross-account data leaks: ${noLeaks ? 'YES ✓' : 'NO ✗'}`);
    
    if (hasWabaMapping && noConflicts && noLeaks) {
      console.log('\n🎉 WABA ISOLATION: FULLY WORKING & SAFE!');
    } else {
      console.log('\n⚠️  WABA ISOLATION: ISSUES DETECTED - SEE ABOVE');
    }
    
    console.log('\n' + '='.repeat(70));
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ MongoDB connection closed\n');
    process.exit(0);
  }
}

testWabaIsolation();
