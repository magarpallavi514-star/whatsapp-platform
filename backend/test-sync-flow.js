import axios from 'axios';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import PhoneNumber from './src/models/PhoneNumber.js';

dotenv.config();

const GRAPH_API_URL = 'https://graph.facebook.com/v21.0';

async function testSync() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const accountId = '2600003';
    
    // Mimic the exact controller flow
    const phoneConfig = await PhoneNumber.findOne({ 
      accountId, 
      isActive: true 
    }).select('+accessToken');

    if (!phoneConfig) {
      console.log('❌ Phone config not found!');
      process.exit(1);
    }

    const wabaId = phoneConfig.wabaId;
    const accessToken = phoneConfig.accessToken;

    console.log('📋 Testing sync with:');
    console.log('  WABA ID:', wabaId);
    console.log('  Access Token (first 30):', accessToken?.substring(0, 30) + '...');
    console.log('  Token in bearer header:', `Bearer ${accessToken?.substring(0, 30)}...`);

    console.log('\n🚀 Calling Meta API...');
    const response = await axios.get(
      `${GRAPH_API_URL}/${wabaId}/message_templates`,
      {
        headers: { 'Authorization': `Bearer ${accessToken}` },
        params: { limit: 100 }
      }
    );

    console.log('\n✅ SUCCESS! Templates found:', response.data.data?.length || 0);
    if (response.data.data) {
      response.data.data.slice(0, 5).forEach(t => {
        console.log(`  - ${t.name} (${t.status})`);
      });
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    if (error.response?.data) {
      console.error('Meta API Response:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

testSync();
