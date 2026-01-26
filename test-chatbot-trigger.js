#!/usr/bin/env node
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: './backend/.env' });

// Models
import Account from './backend/src/models/Account.js';
import PhoneNumber from './backend/src/models/PhoneNumber.js';
import KeywordRule from './backend/src/models/KeywordRule.js';
import WorkflowSession from './backend/src/models/WorkflowSession.js';
import ChatbotLead from './backend/src/models/ChatbotLead.js';
import whatsappService from './backend/src/services/whatsappService.js';

async function testChatbotTrigger() {
  try {
    console.log('🚀 Testing Chatbot Trigger Flow...\n');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get Enromatics account
    const account = await Account.findOne({ accountName: 'Enromatics' });
    if (!account) {
      console.log('❌ Enromatics account not found');
      process.exit(1);
    }
    
    const accountId = account._id.toString();
    console.log(`📌 Account: ${account.accountName} (${accountId})\n`);

    // Get phone number
    const phoneConfig = await PhoneNumber.findOne({ accountId });
    if (!phoneConfig) {
      console.log('❌ Phone number config not found for Enromatics');
      process.exit(1);
    }

    const phoneNumberId = phoneConfig.phoneNumberId;
    console.log(`📞 Phone Number ID: ${phoneNumberId}`);
    console.log(`🔢 Account ID type: ${typeof phoneConfig.accountId} (value: ${phoneConfig.accountId})\n`);

    // Get chatbot rules
    const rules = await KeywordRule.find({ accountId, isActive: true });
    console.log(`🤖 Active Chatbots: ${rules.length}`);
    rules.forEach(rule => {
      console.log(`   - ${rule.name}: [${rule.keywords.join(', ')}] → ${rule.replyType}`);
    });
    console.log();

    // Test trigger
    const testPhone = '919766504856'; // Test from this number
    const testMessage = 'hi'; // Trigger keyword

    console.log(`📤 Sending test message...`);
    console.log(`   From: ${testPhone}`);
    console.log(`   Message: "${testMessage}"`);
    console.log(`   To Phone Number ID: ${phoneNumberId}\n`);

    // Process the incoming message
    await whatsappService.processIncomingMessage(
      accountId,
      phoneNumberId,
      testPhone,
      testMessage
    );

    console.log('\n✅ Message processed!\n');

    // Check if workflow session was created
    const session = await WorkflowSession.findOne({
      accountId,
      contactPhone: testPhone,
      status: 'active'
    });

    if (session) {
      console.log('🎉 CHATBOT TRIGGERED! Workflow session created:');
      console.log(`   Session ID: ${session._id}`);
      console.log(`   Status: ${session.status}`);
      console.log(`   Current Step: ${session.currentStepIndex + 1}/${session.workflowSteps.length}`);
      console.log(`   First Question: "${session.getCurrentStep().text}"\n`);

      // Simulate user response
      console.log('📝 Simulating user response...');
      const step = session.getCurrentStep();
      if (step.saveAs) {
        console.log(`   Responding to "${step.saveAs}": "Test Name"`);
        await whatsappService.handleWorkflowResponse(session, 'Test Name');
      }

      // Check updated session
      const updatedSession = await WorkflowSession.findById(session._id);
      console.log(`   Responses collected: ${Object.entries(updatedSession.responses).map(([k,v]) => `${k}="${v}"`).join(', ')}`);
      console.log(`   Current Step: ${updatedSession.currentStepIndex + 1}/${updatedSession.workflowSteps.length}\n`);

      // Check if leads were saved
      const leads = await ChatbotLead.find({ accountId });
      console.log(`📊 Chatbot Leads in Database: ${leads.length}`);
      if (leads.length > 0) {
        leads.forEach(lead => {
          console.log(`   ✅ Lead ID: ${lead._id}`);
          console.log(`      Status: ${lead.status}`);
          console.log(`      Responses: ${JSON.stringify(Object.fromEntries(Object.entries(lead.responses)))}`);
        });
      }
      console.log();
    } else {
      console.log('❌ No workflow session created - chatbot did not trigger');
    }

    console.log('✅ Test complete!\n');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testChatbotTrigger();
