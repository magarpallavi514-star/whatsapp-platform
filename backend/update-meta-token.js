import mongoose from 'mongoose';
import PhoneNumber from './src/models/PhoneNumber.js';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

async function updateToken(newToken) {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log('\n' + '═'.repeat(70));
    console.log('🔑 UPDATE META ACCESS TOKEN');
    console.log('═'.repeat(70));

    // Find Enromatics phone
    const phone = await PhoneNumber.findOne({ phoneNumberId: '1003427786179738' });
    
    if (!phone) {
      console.log('❌ Phone not found');
      process.exit(1);
    }

    console.log('\n📱 Current phone config:');
    console.log('   Phone:', phone.displayPhone);
    console.log('   phoneNumberId:', phone.phoneNumberId);
    console.log('   wabaId:', phone.wabaId);
    console.log('   Current token (first 30 chars):', phone.accessToken?.substring(0, 30) + '...');
    console.log('   Current token length:', phone.accessToken?.length || 0);

    // Get JWT secret
    const JWT_SECRET = process.env.JWT_SECRET || 'whatsapp-platform-jwt-secret-2026';

    // Encrypt new token
    console.log('\n🔐 Encrypting new token...');
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', crypto.createHash('sha256').update(JWT_SECRET).digest(), iv);
    let encrypted = iv.toString('hex') + ':' + cipher.update(newToken, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    console.log('   New token length:', newToken.length);
    console.log('   New token (first 30 chars):', newToken.substring(0, 30) + '...');
    console.log('   Encrypted length:', encrypted.length);

    // Update in database
    phone.accessToken = encrypted;
    await phone.save();

    console.log('\n✅ TOKEN UPDATED SUCCESSFULLY!');
    console.log('\n📊 Updated phone config:');
    console.log('   Phone:', phone.displayPhone);
    console.log('   phoneNumberId:', phone.phoneNumberId);
    console.log('   Token updated at:', new Date().toLocaleString());

    console.log('\n🚀 Next steps:');
    console.log('   1. Restart your backend server');
    console.log('   2. Try sending a message');
    console.log('   3. Token will be decrypted automatically');

    console.log('\n' + '═'.repeat(70));
    process.exit(0);

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

// Get token from command line argument
const token = process.argv[2];
if (!token) {
  console.log('\n❌ Please provide the token as argument:');
  console.log('\nUsage: node update-meta-token.js "YOUR_TOKEN_HERE"');
  console.log('\nExample:');
  console.log('node update-meta-token.js "EAAdxIJSvcn0BQqpFIhqjhucp1Gyse..."');
  process.exit(1);
}

updateToken(token);
