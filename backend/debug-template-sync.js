import mongoose from 'mongoose';
import dotenv from 'dotenv';
import PhoneNumber from './src/models/PhoneNumber.js';
import axios from 'axios';

dotenv.config();

const GRAPH_API_URL = 'https://graph.facebook.com/v21.0';

async function debugSync() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check phone config for Enromatics
    const accountId = '2600003';
    console.log('🔍 Checking phone config for account:', accountId);
    
    const phoneConfig = await PhoneNumber.findOne({
      accountId,
      isActive: true
    }).select('+accessToken');

    if (!phoneConfig) {
      console.log('❌ No active phone number found!');
      process.exit(1);
    }

    console.log('\n📱 Phone Config Found:');
    console.log('  - accountId:', phoneConfig.accountId);
    console.log('  - phoneNumberId:', phoneConfig.phoneNumberId);
    console.log('  - wabaId:', phoneConfig.wabaId);
    console.log('  - displayPhone:', phoneConfig.displayPhone);
    console.log('  - displayName:', phoneConfig.displayName);
    console.log('  - isActive:', phoneConfig.isActive);
    console.log('  - accessToken exists:', !!phoneConfig.accessToken);
    console.log('  - tokenLength:', phoneConfig.accessToken?.length);
    console.log('  - tokenPrefix:', phoneConfig.accessToken?.substring(0, 30) + '...');
    console.log('  - tokenStarts with "Bearer":', phoneConfig.accessToken?.startsWith('Bearer'));

    if (!phoneConfig.accessToken) {
      console.log('\n❌ CRITICAL: accessToken is missing!');
      process.exit(1);
    }

    // Try to fetch templates
    console.log('\n🔄 Attempting to sync templates...');
    console.log('  API URL:', `${GRAPH_API_URL}/${phoneConfig.wabaId}/message_templates`);
    console.log('  Auth Header:', `Bearer ${phoneConfig.accessToken.substring(0, 30)}...`);

    try {
      const response = await axios.get(
        `${GRAPH_API_URL}/${phoneConfig.wabaId}/message_templates`,
        {
          headers: { 'Authorization': `Bearer ${phoneConfig.accessToken}` },
          params: { limit: 100 }
        }
      );

      console.log('\n✅ SYNC SUCCESS!');
      console.log('Templates found:', response.data.data?.length || 0);
      if (response.data.data && response.data.data.length > 0) {
        console.log('\nTemplates:');
        response.data.data.forEach(t => {
          console.log(`  - ${t.name} (${t.status})`);
        });
      }
    } catch (apiError) {
      console.log('\n❌ API ERROR:');
      console.log('  Status:', apiError.response?.status);
      console.log('  Message:', apiError.message);
      console.log('  Response:', apiError.response?.data);
      
      if (apiError.response?.status === 401) {
        console.log('\n💡 401 = Bad/Expired Token');
        console.log('  Action: Verify token is correct and not expired');
      } else if (apiError.response?.status === 403) {
        console.log('\n💡 403 = Invalid WABA ID or permissions');
        console.log('  Action: Check WABA ID and token permissions');
      }
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

debugSync();
