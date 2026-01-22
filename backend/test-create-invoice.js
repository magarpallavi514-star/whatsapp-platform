import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_URL = 'http://localhost:5050/api';
const JWT_TOKEN = process.env.JWT_TOKEN || '';

async function testCreateInvoice() {
  try {
    console.log('🔍 Fetching Enromatics organization...');
    
    // First get organizations list to find Enromatics
    const orgsResponse = await axios.get(`${API_URL}/admin/organizations`, {
      headers: {
        Authorization: `Bearer ${JWT_TOKEN}`
      }
    });

    const enromatics = orgsResponse.data.data.find(org => org.name === 'Enromatics');
    
    if (!enromatics) {
      console.error('❌ Enromatics organization not found');
      console.log('Available orgs:', orgsResponse.data.data.map(o => ({ name: o.name, id: o._id })));
      return;
    }

    console.log(`✅ Found Enromatics: ${enromatics._id}`);
    console.log(`📊 Account ID: ${enromatics.accountId}`);

    // Now try to create invoice
    console.log('\n📋 Creating invoice for Enromatics...');
    const invoiceResponse = await axios.post(
      `${API_URL}/admin/organizations/${enromatics._id}/create-invoice`,
      {
        amount: 0,
        description: 'Free account invoice'
      },
      {
        headers: {
          Authorization: `Bearer ${JWT_TOKEN}`
        }
      }
    );

    console.log('✅ Invoice created successfully!');
    console.log('📄 Response:', JSON.stringify(invoiceResponse.data, null, 2));

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Full error:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testCreateInvoice();
