import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const PHONE_ID = '1003427786179738';

async function testToken() {
  console.log('\n🔍 TESTING ENROMATICS TOKEN...\n');
  
  try {
    const response = await axios.get(
      `https://graph.instagram.com/v21.0/${PHONE_ID}`,
      {
        params: {
          fields: 'display_phone_number,messaging_product',
          access_token: TOKEN
        }
      }
    );
    
    console.log('✅ TOKEN IS VALID!\n');
    console.log('📱 Phone Details:');
    console.log(`   Display Phone: ${response.data.display_phone_number}`);
    console.log(`   Messaging Product: ${response.data.messaging_product}`);
    console.log('\n✅ Enromatics WABA is ready to use!\n');
    
  } catch (error) {
    console.log('❌ TOKEN ERROR!\n');
    if (error.response?.data?.error) {
      console.log(`Error: ${error.response.data.error.message}`);
    } else {
      console.log(`Error: ${error.message}`);
    }
    console.log('\n⚠️  Token may be expired or invalid. Get a new one from Railway.\n');
  }
}

testToken();
