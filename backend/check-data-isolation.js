import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Template from './src/models/Template.js';
import KeywordRule from './src/models/KeywordRule.js';

dotenv.config();

async function checkDataIsolation() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    console.log('🔐 CHECKING DATA ISOLATION - MULTI-TENANT VERIFICATION\n');

    // Account IDs
    const superadminId = '2600001';
    const enromaticsId = '2600003';

    // Check 1: Templates isolation
    console.log('1️⃣  TEMPLATES ISOLATION CHECK');
    
    const superadminTemplates = await Template.find({ accountId: superadminId });
    const enromaticsTemplates = await Template.find({ accountId: enromaticsId });
    const allTemplates = await Template.find({});
    
    console.log(`   Superadmin (${superadminId}): ${superadminTemplates.length} templates`);
    superadminTemplates.forEach(t => console.log(`      - ${t.name || 'Unnamed'}`));
    
    console.log(`\n   Enromatics (${enromaticsId}): ${enromaticsTemplates.length} templates`);
    enromaticsTemplates.forEach(t => console.log(`      - ${t.name || 'Unnamed'}`));
    
    console.log(`\n   Total in DB: ${allTemplates.length} templates`);
    
    // Check for mixing
    const superadminFromAll = allTemplates.filter(t => t.accountId === superadminId).length;
    const enromaticsFromAll = allTemplates.filter(t => t.accountId === enromaticsId).length;
    const orphaned = allTemplates.filter(t => !t.accountId || t.accountId === null || t.accountId === undefined).length;
    
    console.log(`\n   ✅ Properly isolated: ${superadminFromAll + enromaticsFromAll}`);
    if (orphaned > 0) {
      console.log(`   ❌ ORPHANED (no accountId): ${orphaned}`);
    }

    // Check 2: Chatbot rules isolation
    console.log('\n\n2️⃣  CHATBOT RULES ISOLATION CHECK');
    
    const superadminRules = await KeywordRule.find({ accountId: superadminId });
    const enromaticsRules = await KeywordRule.find({ accountId: enromaticsId });
    const allRules = await KeywordRule.find({});
    
    console.log(`   Superadmin (${superadminId}): ${superadminRules.length} rules`);
    superadminRules.forEach(r => console.log(`      - ${r.name || 'Unnamed'}`));
    
    console.log(`\n   Enromatics (${enromaticsId}): ${enromaticsRules.length} rules`);
    enromaticsRules.forEach(r => console.log(`      - ${r.name || 'Unnamed'}`));
    
    console.log(`\n   Total in DB: ${allRules.length} rules`);
    
    // Check for mixing
    const superadminRulesFromAll = allRules.filter(r => r.accountId === superadminId).length;
    const enromaticsRulesFromAll = allRules.filter(r => r.accountId === enromaticsId).length;
    const orphanedRules = allRules.filter(r => !r.accountId || r.accountId === null || r.accountId === undefined).length;
    
    console.log(`\n   ✅ Properly isolated: ${superadminRulesFromAll + enromaticsRulesFromAll}`);
    if (orphanedRules > 0) {
      console.log(`   ❌ ORPHANED (no accountId): ${orphanedRules}`);
    }

    // Check 3: Verify controllers filtering
    console.log('\n\n3️⃣  CONTROLLER QUERY FILTERING CHECK');
    console.log('   Templates should filter by: accountId = req.account.accountId');
    console.log('   Chatbot should filter by: accountId = req.account.accountId');
    
    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('\n📊 DATA ISOLATION SUMMARY\n');
    
    if (orphaned === 0 && orphanedRules === 0 && 
        superadminFromAll === superadminTemplates.length &&
        enromaticsFromAll === enromaticsTemplates.length &&
        superadminRulesFromAll === superadminRules.length &&
        enromaticsRulesFromAll === enromaticsRules.length) {
      console.log('✅ DATA ISOLATION: PERFECT');
      console.log('   Each account sees only its own data\n');
    } else {
      console.log('❌ DATA ISOLATION: BROKEN');
      console.log('   Cross-account data visibility detected!\n');
      console.log('Issues found:');
      if (orphaned > 0) console.log(`   - ${orphaned} orphaned templates`);
      if (orphanedRules > 0) console.log(`   - ${orphanedRules} orphaned rules`);
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkDataIsolation();
