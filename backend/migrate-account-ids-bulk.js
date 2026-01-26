#!/usr/bin/env node
/**
 * Bulk Update - Migrate all Message & Conversation accountIds to new format
 * eno_2600003 → 2600003
 * pixels_internal → 2600001
 * Delete ObjectId format records
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Message from './src/models/Message.js';
import Conversation from './src/models/Conversation.js';

dotenv.config();

async function migrateAccountIds() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    let stats = {
      messagesUpdated: 0,
      conversationsUpdated: 0,
      messagesDeleted: 0,
      conversationsDeleted: 0
    };

    // ========================
    // MIGRATE MESSAGES
    // ========================
    console.log('=== MIGRATING MESSAGES ===');

    // Fix eno_2600003 → 2600003
    const msgEno = await Message.updateMany(
      { accountId: 'eno_2600003' },
      { accountId: '2600003' }
    );
    stats.messagesUpdated += msgEno.modifiedCount;
    console.log(`✅ Updated ${msgEno.modifiedCount} messages: eno_2600003 → 2600003`);

    // Fix pixels_internal → 2600001
    const msgPixels = await Message.updateMany(
      { accountId: 'pixels_internal' },
      { accountId: '2600001' }
    );
    stats.messagesUpdated += msgPixels.modifiedCount;
    console.log(`✅ Updated ${msgPixels.modifiedCount} messages: pixels_internal → 2600001`);

    // Delete ObjectId format messages (bad data)
    const msgObjectId = await Message.deleteMany({
      accountId: /^[a-f0-9]{24}$/  // Regex for ObjectId format (24 hex chars)
    });
    stats.messagesDeleted += msgObjectId.deletedCount;
    console.log(`✅ Deleted ${msgObjectId.deletedCount} messages with ObjectId format`);

    // ========================
    // MIGRATE CONVERSATIONS
    // ========================
    console.log('\n=== MIGRATING CONVERSATIONS ===');

    // Fix eno_2600003 → 2600003
    const convEno = await Conversation.updateMany(
      { accountId: 'eno_2600003' },
      { accountId: '2600003' }
    );
    stats.conversationsUpdated += convEno.modifiedCount;
    console.log(`✅ Updated ${convEno.modifiedCount} conversations: eno_2600003 → 2600003`);

    // Fix pixels_internal → 2600001
    const convPixels = await Conversation.updateMany(
      { accountId: 'pixels_internal' },
      { accountId: '2600001' }
    );
    stats.conversationsUpdated += convPixels.modifiedCount;
    console.log(`✅ Updated ${convPixels.modifiedCount} conversations: pixels_internal → 2600001`);

    // Delete ObjectId format conversations (bad data)
    const convObjectId = await Conversation.deleteMany({
      accountId: /^[a-f0-9]{24}$/  // Regex for ObjectId format
    });
    stats.conversationsDeleted += convObjectId.deletedCount;
    console.log(`✅ Deleted ${convObjectId.deletedCount} conversations with ObjectId format`);

    // ========================
    // SUMMARY
    // ========================
    console.log('\n=== MIGRATION SUMMARY ===');
    console.log(`\n✅ Messages:`);
    console.log(`   Updated: ${stats.messagesUpdated}`);
    console.log(`   Deleted: ${stats.messagesDeleted}`);
    console.log(`\n✅ Conversations:`);
    console.log(`   Updated: ${stats.conversationsUpdated}`);
    console.log(`   Deleted: ${stats.conversationsDeleted}`);
    console.log(`\n✅ Total Fixed: ${stats.messagesUpdated + stats.conversationsUpdated}`);
    console.log(`✅ Total Cleaned: ${stats.messagesDeleted + stats.conversationsDeleted}`);
    console.log(`\n🎉 All data now uses single source of truth (YYXXXXX format)\n`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

migrateAccountIds();
