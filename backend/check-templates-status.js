import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Template Schema
const templateSchema = new mongoose.Schema({
  accountId: String,
  phoneNumberId: String,
  name: String,
  language: String,
  category: String,
  status: String, // APPROVED, PENDING, REJECTED, DRAFT
  content: String,
  metaTemplateId: String,
  createdAt: { type: Date, default: Date.now }
});

const Template = mongoose.model('Template', templateSchema);

async function checkTemplates() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📋 Checking Templates Status\n');

    // Check templates for both accounts
    const superadminTemplates = await Template.find({ 
      accountId: 'pixels_internal' 
    });
    
    const enromaticsTemplates = await Template.find({ 
      accountId: '2600003' 
    });

    console.log('='.repeat(60));
    console.log('🔴 SUPERADMIN TEMPLATES');
    console.log('='.repeat(60));
    console.log(`Total: ${superadminTemplates.length}\n`);
    
    if (superadminTemplates.length > 0) {
      superadminTemplates.slice(0, 3).forEach(t => {
        console.log(`Name: ${t.name}`);
        console.log(`Status: ${t.status}`);
        console.log(`Language: ${t.language}`);
        console.log(`Meta ID: ${t.metaTemplateId || 'NOT SYNCED'}`);
        console.log('');
      });
    } else {
      console.log('No templates found for Superadmin');
    }

    console.log('='.repeat(60));
    console.log('🟦 ENROMATICS TEMPLATES');
    console.log('='.repeat(60));
    console.log(`Total: ${enromaticsTemplates.length}\n`);
    
    if (enromaticsTemplates.length > 0) {
      enromaticsTemplates.slice(0, 3).forEach(t => {
        console.log(`Name: ${t.name}`);
        console.log(`Status: ${t.status}`);
        console.log(`Language: ${t.language}`);
        console.log(`Meta ID: ${t.metaTemplateId || 'NOT SYNCED'}`);
        console.log('');
      });
    } else {
      console.log('No templates found for Enromatics');
    }

    console.log('='.repeat(60));
    console.log('📊 STATUS SUMMARY');
    console.log('='.repeat(60));

    // Group by status
    const statusCounts = {};
    const allTemplates = [...superadminTemplates, ...enromaticsTemplates];
    
    allTemplates.forEach(t => {
      statusCounts[t.status] = (statusCounts[t.status] || 0) + 1;
    });

    console.log('Template Status Breakdown:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      const icon = status === 'APPROVED' ? '✅' : status === 'PENDING' ? '⏳' : '❌';
      console.log(`  ${icon} ${status}: ${count}`);
    });

    console.log('\n⚠️  IMPORTANT:');
    if (statusCounts['DRAFT'] > 0 || statusCounts['PENDING'] > 0) {
      console.log('  Templates in DRAFT or PENDING = Phone not fully activated by Meta yet');
      console.log('  This is NORMAL for new phones - wait 24-48 hours');
    }

    if (statusCounts['APPROVED'] > 0) {
      console.log('  Templates in APPROVED = Phone is fully activated ✅');
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkTemplates();
