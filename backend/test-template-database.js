#!/usr/bin/env node

/**
 * Test Template Endpoints
 * Debugging the templates integration
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Template from './src/models/Template.js';

dotenv.config();

const testTemplateEndpoints = async () => {
  try {
    console.log('🧪 Testing Template Endpoints\n');
    console.log('=' .repeat(70));
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Test 1: Count all templates
    console.log('Test 1️⃣ : Count all templates');
    const totalCount = await Template.countDocuments();
    console.log(`   Total templates in DB: ${totalCount}\n`);

    // Test 2: Count by account
    console.log('Test 2️⃣ : Count by account (pixels_internal)');
    const accountCount = await Template.countDocuments({ accountId: 'pixels_internal' });
    console.log(`   Templates in pixels_internal: ${accountCount}\n`);

    // Test 3: Count not deleted
    console.log('Test 3️⃣ : Count not deleted');
    const notDeletedCount = await Template.countDocuments({ deleted: false });
    console.log(`   Not deleted: ${notDeletedCount}\n`);

    // Test 4: Count by account + not deleted
    console.log('Test 4️⃣ : Count by account + not deleted');
    const accountNotDeletedCount = await Template.countDocuments({ 
      accountId: 'pixels_internal', 
      deleted: false 
    });
    console.log(`   pixels_internal (not deleted): ${accountNotDeletedCount}\n`);

    // Test 5: Count by status
    console.log('Test 5️⃣ : Count by status');
    const approved = await Template.countDocuments({ accountId: 'pixels_internal', status: 'approved', deleted: false });
    const pending = await Template.countDocuments({ accountId: 'pixels_internal', status: 'pending', deleted: false });
    const draft = await Template.countDocuments({ accountId: 'pixels_internal', status: 'draft', deleted: false });
    const rejected = await Template.countDocuments({ accountId: 'pixels_internal', status: 'rejected', deleted: false });
    
    console.log(`   Approved: ${approved}`);
    console.log(`   Pending: ${pending}`);
    console.log(`   Draft: ${draft}`);
    console.log(`   Rejected: ${rejected}\n`);

    // Test 6: Fetch actual templates
    console.log('Test 6️⃣ : Fetch actual templates (limit 5)');
    const templates = await Template.find({ accountId: 'pixels_internal', deleted: false })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();
    
    console.log(`   Found ${templates.length} templates:\n`);
    templates.forEach((t, i) => {
      console.log(`   ${i + 1}. ${t.name}`);
      console.log(`      - Status: ${t.status}`);
      console.log(`      - Variables: ${t.variables ? t.variables.join(', ') : 'none'}`);
      console.log(`      - Category: ${t.category}`);
      console.log('');
    });

    // Test 7: Check for specific fields
    if (templates.length > 0) {
      console.log('Test 7️⃣ : Check template fields\n');
      const firstTemplate = templates[0];
      console.log('Fields in template:');
      console.log(`   _id: ${firstTemplate._id ? '✅' : '❌'}`);
      console.log(`   name: ${firstTemplate.name ? '✅' : '❌'}`);
      console.log(`   content: ${firstTemplate.content ? '✅' : '❌'}`);
      console.log(`   variables: ${firstTemplate.variables ? '✅' : '❌'}`);
      console.log(`   status: ${firstTemplate.status ? '✅' : '❌'}`);
      console.log(`   usageCount: ${firstTemplate.usageCount !== undefined ? '✅' : '❌'}`);
      console.log(`   deleted: ${firstTemplate.deleted !== undefined ? '✅' : '❌'}\n`);
    }

    console.log('=' .repeat(70));
    console.log('✅ Template database check complete!\n');

    await mongoose.connection.close();

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
};

testTemplateEndpoints();
