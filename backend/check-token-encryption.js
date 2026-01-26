import mongoose from 'mongoose';
import dotenv from 'dotenv';
import PhoneNumber from './src/models/PhoneNumber.js';

dotenv.config();

async function checkTokenEncryption() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const accountId = '2600003';
    
    // Get phone number WITH encrypted token
    const phoneRecord = await PhoneNumber.findOne({ accountId }).select('+accessToken');
    
    console.log('📱 Phone Record:');
    console.log('  accountId:', phoneRecord.accountId);
    console.log('  displayPhone:', phoneRecord.displayPhone);
    console.log('  isActive:', phoneRecord.isActive);
    
    console.log('\n🔐 Token Analysis:');
    console.log('  Stored in DB (encrypted):', phoneRecord._doc.accessToken?.substring(0, 50) + '...');
    console.log('  Retrieved (should be decrypted):', phoneRecord.accessToken?.substring(0, 50) + '...');
    console.log('  Token length:', phoneRecord.accessToken?.length);
    console.log('  Looks like real token:', phoneRecord.accessToken?.startsWith('EA'));
    
    // Check if token matches env
    const envToken = process.env.WHATSAPP_ACCESS_TOKEN;
    console.log('\n🔍 Token Verification:');
    console.log('  ENV token starts:', envToken?.substring(0, 30) + '...');
    console.log('  DB token starts:', phoneRecord.accessToken?.substring(0, 30) + '...');
    console.log('  Match:', phoneRecord.accessToken === envToken);
    
    if (phoneRecord.accessToken !== envToken) {
      console.log('\n❌ MISMATCH! Token is either:');
      console.log('  1. Not decrypting properly');
      console.log('  2. Double-encrypted');
      console.log('  3. Encrypted with different JWT_SECRET');
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkTokenEncryption();
