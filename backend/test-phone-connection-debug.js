#!/usr/bin/env node

/**
 * Test Phone Number Connection - Diagnostic Script
 * Helps debug why test connection is failing
 * 
 * Usage: node test-phone-connection-debug.js <phoneNumberId>
 */

import mongoose from 'mongoose';
import crypto from 'crypto';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const phoneNumberId = process.argv[2];

if (!phoneNumberId) {
  console.error('Usage: node test-phone-connection-debug.js <phoneNumberId>');
  console.error('Example: node test-phone-connection-debug.js 1234567890123456');
  process.exit(1);
}

async function testPhoneConnection() {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Load PhoneNumber model
    const phoneNumberSchema = new mongoose.Schema({
      accountId: mongoose.Schema.Types.Mixed,
      phoneNumberId: String,
      wabaId: String,
      accessToken: {
        type: String,
        select: false,
        set: function(token) {
          const algorithm = 'aes-256-cbc';
          const key = crypto.scryptSync(process.env.JWT_SECRET || 'fallback-key', 'salt', 32);
          const iv = crypto.randomBytes(16);
          const cipher = crypto.createCipheriv(algorithm, key, iv);
          let encrypted = cipher.update(token, 'utf8', 'hex');
          encrypted += cipher.final('hex');
          return iv.toString('hex') + ':' + encrypted;
        },
        get: function(encrypted) {
          if (!encrypted) return encrypted;
          try {
            const algorithm = 'aes-256-cbc';
            const key = crypto.scryptSync(process.env.JWT_SECRET || 'fallback-key', 'salt', 32);
            const parts = encrypted.split(':');
            const iv = Buffer.from(parts[0], 'hex');
            const encryptedText = parts[1];
            const decipher = crypto.createDecipheriv(algorithm, key, iv);
            let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            return decrypted;
          } catch (err) {
            console.error('❌ Decryption failed:', err.message);
            return encrypted;
          }
        }
      },
      isActive: Boolean,
      qualityRating: String,
      displayPhoneNumber: String,
      verifiedName: String,
    });

    const PhoneNumber = mongoose.model('PhoneNumber', phoneNumberSchema);

    // Find the phone number
    console.log(`\n🔍 Looking for phone: ${phoneNumberId}`);
    const phone = await PhoneNumber.findOne({ phoneNumberId }).select('+accessToken');

    if (!phone) {
      console.error('❌ Phone number not found in database');
      process.exit(1);
    }

    console.log('✅ Found phone:', {
      phoneNumberId: phone.phoneNumberId,
      wabaId: phone.wabaId,
      isActive: phone.isActive,
      accountId: phone.accountId,
      tokenPresent: !!phone.accessToken,
      tokenLength: phone.accessToken?.length || 0,
    });

    // Check token
    const token = phone.accessToken;
    console.log('\n🔐 Token Validation:');
    console.log('  Token present:', !!token);
    console.log('  Token length:', token?.length || 0);
    console.log('  Token starts with:', token?.substring(0, 30) || 'N/A');
    console.log('  Contains colon (likely encrypted):', token?.includes(':') || false);
    console.log('  Contains "Bearer " prefix:', token?.includes('Bearer ') || false);

    if (token?.includes(':')) {
      console.error('⚠️  Token appears to be encrypted/corrupted (contains colon)');
      console.error('    This means decryption failed - JWT_SECRET mismatch likely');
      process.exit(1);
    }

    if (token?.length < 50) {
      console.error('⚠️  Token is too short (likely decryption failed)');
      process.exit(1);
    }

    // Try to call Meta API
    console.log('\n📱 Testing Meta API Connection:');
    const GRAPH_API_URL = 'https://graph.facebook.com/v21.0';
    const url = `${GRAPH_API_URL}/${phoneNumberId}`;
    console.log('  Endpoint:', url);
    console.log('  Token length:', token.length);
    console.log('  Timeout: 10000ms');

    try {
      const response = await axios.get(url, {
        headers: { 'Authorization': `Bearer ${token}` },
        timeout: 10000,
      });

      console.log('\n✅ Meta API Response:');
      console.log('  Display phone:', response.data.display_phone_number);
      console.log('  Quality rating:', response.data.quality_rating);
      console.log('  Verified name:', response.data.verified_name);
      console.log('\n🎉 Connection test would SUCCEED');
    } catch (apiError) {
      console.error('\n❌ Meta API Error:');
      console.error('  Status:', apiError.response?.status);
      console.error('  Error:', apiError.response?.data?.error?.message);
      console.error('  Code:', apiError.response?.data?.error?.code);

      if (apiError.response?.status === 401) {
        console.error('\n💡 Token is invalid or expired');
      } else if (apiError.response?.status === 404) {
        console.error('\n💡 Phone number not found on Meta');
      } else if (apiError.code === 'ECONNABORTED') {
        console.error('\n💡 Connection timeout - cannot reach Meta API');
      }
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

testPhoneConnection();
