import mongoose from 'mongoose';
import dotenv from 'dotenv';
import PhoneNumber from './src/models/PhoneNumber.js';

dotenv.config();

async function connectPhone() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Enromatics account details
    const accountId = '2600003';
    const phoneNum = '+818087131777';  // Enromatics phone
    const phoneNumberId = '119372841445566'; // Example - adjust based on actual Meta WABA
    const wabaId = '1536545574042607'; // Shared WABA ID
    const accessToken = process.env.META_BUSINESS_ACCOUNT_TOKEN || 'your-access-token';

    // Check if phone already exists
    const existing = await PhoneNumber.findOne({ accountId, phoneNumberId });
    if (existing) {
      console.log('⚠️  Phone number already connected');
      console.log('Phone:', existing.phoneNumber);
      console.log('Status:', existing.status);
      await mongoose.connection.close();
      process.exit(0);
    }

    // Create phone number record
    const phoneRecord = new PhoneNumber({
      accountId,
      phoneNumber: phoneNum,
      phoneNumberId,
      wabaId,
      accessToken,
      displayName: 'Enromatics Support',
      status: 'connected',
      verificationStatus: 'verified',
      capabilities: ['send', 'receive']
    });

    await phoneRecord.save();
    console.log('✅ Phone number connected for Enromatics!');
    console.log('Phone:', phoneNum);
    console.log('Status:', phoneRecord.status);
    console.log('Account ID:', accountId);

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

connectPhone();
