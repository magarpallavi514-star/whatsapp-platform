#!/usr/bin/env node

/**
 * Fix Phone Records - Database Cleanup Script
 * Updates all phone records with proper default values
 * - Sets isActive = true for all phones
 * - Sets qualityRating to 'unknown' if missing
 * - Ensures displayPhone is set
 * 
 * Usage: node fix-phone-records.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function fixPhoneRecords() {
  try {
    console.log('🔌 Connecting to MongoDB...\n');
    await mongoose.connect(process.env.MONGODB_URI);
    
    const db = mongoose.connection.db;
    const phonesCollection = db.collection('phonenumbers');
    
    // Get all phones before update
    console.log('📊 BEFORE UPDATE:\n');
    const phonesBefore = await phonesCollection.find({}).toArray();
    console.log(`Total phones in database: ${phonesBefore.length}\n`);
    
    if (phonesBefore.length === 0) {
      console.log('✅ No phones to update');
      await mongoose.disconnect();
      return;
    }
    
    // Show sample before
    console.log('Sample phones BEFORE:\n');
    phonesBefore.slice(0, 2).forEach((phone, i) => {
      console.log(`Phone ${i + 1}:`);
      console.log(`  phoneNumberId: ${phone.phoneNumberId}`);
      console.log(`  isActive: ${phone.isActive}`);
      console.log(`  qualityRating: ${phone.qualityRating || 'NULL'}`);
      console.log(`  displayPhone: ${phone.displayPhone || 'NULL'}`);
      console.log('');
    });
    
    // Update 1: Set isActive = true for all
    console.log('⚙️  Updating isActive...');
    const update1 = await phonesCollection.updateMany(
      { isActive: { $ne: true } },  // Where isActive is NOT true
      { $set: { isActive: true } }
    );
    console.log(`   Updated ${update1.modifiedCount} records\n`);
    
    // Update 2: Set qualityRating = 'unknown' if missing
    console.log('⚙️  Updating qualityRating...');
    const update2 = await phonesCollection.updateMany(
      { $or: [{ qualityRating: null }, { qualityRating: undefined }, { qualityRating: '' }] },
      { $set: { qualityRating: 'unknown' } }
    );
    console.log(`   Updated ${update2.modifiedCount} records\n`);
    
    // Update 3: Set displayPhone if missing (use phoneNumberId)
    console.log('⚙️  Updating displayPhone...');
    const phonesWithoutDisplay = await phonesCollection.find({ displayPhone: { $in: [null, undefined, ''] } }).toArray();
    
    if (phonesWithoutDisplay.length > 0) {
      for (const phone of phonesWithoutDisplay) {
        await phonesCollection.updateOne(
          { _id: phone._id },
          { $set: { displayPhone: phone.phoneNumberId } }
        );
      }
      console.log(`   Updated ${phonesWithoutDisplay.length} records\n`);
    } else {
      console.log('   All phones have displayPhone set\n');
    }
    
    // Get all phones after update
    console.log('📊 AFTER UPDATE:\n');
    const phonesAfter = await phonesCollection.find({}).toArray();
    
    // Show sample after
    console.log('Sample phones AFTER:\n');
    phonesAfter.slice(0, 2).forEach((phone, i) => {
      console.log(`Phone ${i + 1}:`);
      console.log(`  phoneNumberId: ${phone.phoneNumberId}`);
      console.log(`  isActive: ${phone.isActive}`);
      console.log(`  qualityRating: ${phone.qualityRating}`);
      console.log(`  displayPhone: ${phone.displayPhone}`);
      console.log('');
    });
    
    // Summary
    console.log('📈 SUMMARY:\n');
    const allActive = phonesAfter.every(p => p.isActive === true);
    const allHaveQuality = phonesAfter.every(p => p.qualityRating && p.qualityRating !== '');
    const allHaveDisplay = phonesAfter.every(p => p.displayPhone && p.displayPhone !== '');
    
    console.log(`✅ All phones isActive: ${allActive ? 'YES' : 'NO'}`);
    console.log(`✅ All phones have qualityRating: ${allHaveQuality ? 'YES' : 'NO'}`);
    console.log(`✅ All phones have displayPhone: ${allHaveDisplay ? 'YES' : 'NO'}\n`);
    
    if (allActive && allHaveQuality && allHaveDisplay) {
      console.log('🎉 All phones have been fixed successfully!\n');
    } else {
      console.log('⚠️  Some phones may still need manual fixing\n');
    }
    
    await mongoose.disconnect();
    console.log('✅ Database cleanup complete');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixPhoneRecords();
