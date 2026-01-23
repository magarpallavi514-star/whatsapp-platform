import mongoose from 'mongoose';
import KeywordRule from './src/models/KeywordRule.js';
import Account from './src/models/Account.js';

console.log('🔍 Checking database schema and data...\n');

mongoose.connect('mongodb+srv://pixels:bnVtYmVyMjU5OA@pixelswhatsapp.7u1vk.mongodb.net/pixelswhatsapp?retryWrites=true&w=majority', {
  serverSelectionTimeoutMS: 5000
}).then(async () => {
  console.log('✅ Connected to MongoDB\n');
  
  // Check if account exists
  const account = await Account.findOne({ accountId: '6971e3a706837a5539992bee' });
  console.log('📊 Account Lookup:');
  console.log('  Account found:', !!account);
  if (account) {
    console.log('  Account ID:', account.accountId);
    console.log('  Account email:', account.email);
    console.log('  Account type:', account.type);
    console.log('  Account plan:', account.plan);
  }
  
  // Check KeywordRule collection
  console.log('\n📋 KeywordRule Collection:');
  const count = await KeywordRule.countDocuments();
  console.log('  Total rules in DB:', count);
  
  // Check rules for this account
  const accountRules = await KeywordRule.countDocuments({ accountId: '6971e3a706837a5539992bee' });
  console.log('  Rules for this account:', accountRules);
  
  // List a few rules to check schema
  const samples = await KeywordRule.find().limit(2);
  console.log('\n📌 Sample Rule Schema Check:');
  if (samples.length > 0) {
    const rule = samples[0];
    console.log('  Rule Name:', rule.name);
    console.log('  Fields present:');
    console.log('    - accountId:', !!rule.accountId, '✓');
    console.log('    - name:', !!rule.name, '✓');
    console.log('    - keywords:', Array.isArray(rule.keywords) ? '✓' : '✗', rule.keywords);
    console.log('    - matchType:', rule.matchType, '(enum: exact|contains|starts_with) ✓');
    console.log('    - replyType:', rule.replyType, '(enum: text|template|workflow) ✓');
    console.log('    - replyContent:', !!rule.replyContent ? '✓' : '✗');
    console.log('    - isActive:', typeof rule.isActive === 'boolean' ? '✓' : '✗', rule.isActive);
    console.log('    - triggerCount:', typeof rule.triggerCount === 'number' ? '✓' : '✗', rule.triggerCount);
    console.log('    - timestamps:', !!rule.createdAt && !!rule.updatedAt ? '✓' : '✗');
    console.log('\n  Full rule object:');
    console.log(JSON.stringify(rule, null, 2));
  } else {
    console.log('  ⚠️  No rules found in DB');
  }
  
  console.log('\n✅ Schema check complete');
  process.exit(0);
}).catch(err => {
  console.error('❌ Connection error:', err.message);
  process.exit(1);
});
