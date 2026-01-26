import mongoose from 'mongoose';
import dotenv from 'dotenv';
import KeywordRule from './src/models/KeywordRule.js';
import ChatbotLead from './src/models/ChatbotLead.js';

dotenv.config();

async function checkChatbot() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const accountId = '2600003';
    
    console.log('🤖 CHECKING CHATBOT SETUP FOR ENROMATICS\n');
    console.log('Account ID: 2600003\n');

    // Check keyword rules (chatbot triggers)
    console.log('1️⃣  KEYWORD RULES (Chatbot Triggers)');
    const rules = await KeywordRule.find({ accountId });
    console.log('   Total rules:', rules.length);
    
    if (rules.length === 0) {
      console.log('   ❌ No keyword rules found!');
      console.log('   This means no chatbot triggers are configured.');
    } else {
      rules.forEach(rule => {
        console.log(`\n   📋 Rule: "${rule.name || rule.keywords?.join(',')}" (ID: ${rule._id})`);
        console.log(`      Keywords: ${rule.keywords?.join(', ')}`);
        console.log(`      Response: ${rule.response?.substring(0, 50)}...`);
        console.log(`      Active: ${rule.isActive}`);
        console.log(`      Type: ${rule.responseType || 'text'}`);
      });
    }

    // Check chatbot leads (responses generated)
    console.log('\n\n2️⃣  CHATBOT LEADS (Auto-responses sent)');
    const leads = await ChatbotLead.find({ accountId });
    console.log('   Total leads captured:', leads.length);
    
    if (leads.length > 0) {
      leads.slice(0, 5).forEach(lead => {
        console.log(`\n   👤 ${lead.customerPhone || 'Unknown'}`);
        console.log(`      Message: "${lead.customerMessage?.substring(0, 40)}..."`);
        console.log(`      Response: "${lead.botResponse?.substring(0, 40)}..."`);
        console.log(`      Date: ${lead.createdAt?.toLocaleString()}`);
      });
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('\n📊 CHATBOT STATUS\n');
    
    if (rules.length === 0) {
      console.log('❌ CHATBOT NOT CONFIGURED');
      console.log('\nWhy this happened:');
      console.log('  1. Keyword rules were deleted');
      console.log('  2. Never set up for Enromatics');
      console.log('  3. Data loss during migration\n');
      
      console.log('How to fix:');
      console.log('  1. Go to Dashboard > Settings > Chatbot');
      console.log('  2. Create new keyword rule');
      console.log('  3. Set trigger keyword (e.g., "demo", "pricing")');
      console.log('  4. Set auto-response message');
      console.log('  5. Save and activate\n');
    } else {
      console.log('✅ CHATBOT IS CONFIGURED');
      console.log(`   Total rules: ${rules.length}`);
      console.log(`   Active rules: ${rules.filter(r => r.isActive).length}`);
      console.log(`   Leads captured: ${leads.length}\n`);
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkChatbot();
