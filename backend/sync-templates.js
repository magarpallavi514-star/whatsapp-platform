import mongoose from 'mongoose';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// WhatsApp Business Account ID (WABA ID)
const WABA_ID = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '1536545574042607';
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || 'EAAaBZBc8vE3cBO7fMcLQwv1ZBJnCxhHbZBOKfGkJ72rrEGRZCxlOL6d5TdMpLpAVsFvP35UgBG0gVSlZAP5o5EaNmLkfhm8I7B7OjkaBWGJBMUAZCQGFyfoCxxPHZC3xeaVNZCT5R1iqb8a2Dms5aV0M5oiF6o1MVOIw0bLf5ZCZCnmIvNBW2qDVf5t57ZBumjemIxm1ZBGmgZDZD';
const ACCOUNT_ID = 'acc_679b39bb4c4f98c0ede5c088'; // Your platform account ID

const GRAPH_API_URL = 'https://graph.facebook.com/v21.0';

// Template schema
const templateSchema = new mongoose.Schema({
  accountId: String,
  name: String,
  language: String,
  category: String,
  content: String,
  variables: [String],
  components: Array,
  status: String,
  metaTemplateId: String,
  usageCount: { type: Number, default: 0 },
  lastUsedAt: Date,
  rejectedReason: String,
  deleted: { type: Boolean, default: false }
}, { timestamps: true });

async function syncTemplates() {
  try {
    console.log('🔄 Starting template sync from WhatsApp API...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const Template = mongoose.model('Template', templateSchema);

    // Fetch templates from WhatsApp API
    console.log(`📡 Fetching templates from WABA ID: ${WABA_ID}...`);
    const response = await axios.get(
      `${GRAPH_API_URL}/${WABA_ID}/message_templates`,
      {
        headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}` },
        params: {
          limit: 100 // Adjust as needed
        }
      }
    );

    const metaTemplates = response.data.data || [];
    console.log(`📥 Found ${metaTemplates.length} templates in WhatsApp Manager\n`);

    if (metaTemplates.length === 0) {
      console.log('⚠️  No templates found in WhatsApp Manager');
      process.exit(0);
    }

    let syncedCount = 0;
    let updatedCount = 0;
    let newCount = 0;

    for (const metaTemplate of metaTemplates) {
      try {
        // Extract template details
        const name = metaTemplate.name;
        const language = metaTemplate.language;
        const category = metaTemplate.category;
        const status = metaTemplate.status; // APPROVED, PENDING, REJECTED
        const metaTemplateId = metaTemplate.id;
        const components = metaTemplate.components || [];

        // Extract content from BODY component
        let content = '';
        let variables = [];
        
        const bodyComponent = components.find(c => c.type === 'BODY');
        if (bodyComponent && bodyComponent.text) {
          content = bodyComponent.text;
          
          // Extract variables ({{1}}, {{2}}, etc.)
          const variableMatches = content.match(/\{\{(\d+)\}\}/g) || [];
          variables = [...new Set(variableMatches.map(v => v.replace(/[{}]/g, '')))];
        }

        // Check if template already exists
        const existingTemplate = await Template.findOne({
          accountId: ACCOUNT_ID,
          metaTemplateId: metaTemplateId
        });

        if (existingTemplate) {
          // Update existing template
          existingTemplate.name = name;
          existingTemplate.language = language;
          existingTemplate.category = category;
          existingTemplate.content = content;
          existingTemplate.variables = variables;
          existingTemplate.components = components;
          existingTemplate.status = status.toLowerCase();
          
          if (status === 'REJECTED' && metaTemplate.rejected_reason) {
            existingTemplate.rejectedReason = metaTemplate.rejected_reason;
          }
          
          await existingTemplate.save();
          updatedCount++;
          console.log(`   ✏️  Updated: ${name} (${language}) - ${status}`);
        } else {
          // Create new template
          await Template.create({
            accountId: ACCOUNT_ID,
            name: name,
            language: language,
            category: category,
            content: content,
            variables: variables,
            components: components,
            status: status.toLowerCase(),
            metaTemplateId: metaTemplateId,
            usageCount: 0,
            rejectedReason: status === 'REJECTED' ? metaTemplate.rejected_reason : null
          });
          newCount++;
          console.log(`   ✨ Created: ${name} (${language}) - ${status}`);
        }

        syncedCount++;
      } catch (err) {
        console.error(`   ❌ Error processing template ${metaTemplate.name}:`, err.message);
      }
    }

    console.log('\n📊 Sync Summary:');
    console.log(`   Total processed: ${syncedCount}`);
    console.log(`   New templates: ${newCount}`);
    console.log(`   Updated templates: ${updatedCount}`);
    
    // Show final stats
    const stats = {
      approved: await Template.countDocuments({ accountId: ACCOUNT_ID, status: 'approved', deleted: false }),
      pending: await Template.countDocuments({ accountId: ACCOUNT_ID, status: 'pending', deleted: false }),
      rejected: await Template.countDocuments({ accountId: ACCOUNT_ID, status: 'rejected', deleted: false }),
      draft: await Template.countDocuments({ accountId: ACCOUNT_ID, status: 'draft', deleted: false })
    };

    console.log('\n📈 Current Database Status:');
    console.log(`   ✅ Approved: ${stats.approved}`);
    console.log(`   ⏳ Pending: ${stats.pending}`);
    console.log(`   ❌ Rejected: ${stats.rejected}`);
    console.log(`   📝 Draft: ${stats.draft}`);
    console.log(`   📊 Total: ${stats.approved + stats.pending + stats.rejected + stats.draft}`);

    console.log('\n✅ Template sync completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error syncing templates:', error.message);
    if (error.response) {
      console.error('API Response:', error.response.data);
    }
    process.exit(1);
  }
}

// Run the sync
syncTemplates();
