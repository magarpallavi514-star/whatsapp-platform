import mongoose from 'mongoose';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const phoneNumberSchema = new mongoose.Schema({}, { strict: false });
const PhoneNumber = mongoose.model('PhoneNumber', phoneNumberSchema);

async function checkToken() {
  try {
    console.log('\n🔍 Checking stored access token...\n');
    
    await mongoose.connect(process.env.MONGODB_URI);
    
    const phoneConfig = await PhoneNumber.findOne({
      accountId: '695a15a5c526dbe7c085ece2',
      phoneNumberId: '889344924259692'
    }).select('+accessToken');

    if (!phoneConfig) {
      console.log('❌ Phone config not found');
      process.exit(1);
    }

    const storedToken = phoneConfig.accessToken;
    const envToken = process.env.WHATSAPP_ACCESS_TOKEN;

    console.log('TOKEN COMPARISON:');
    console.log('═'.repeat(70));
    console.log(`\nStored in DB:`);
    console.log(`  First 20 chars: ${storedToken?.substring(0, 20)}...`);
    console.log(`  Last 20 chars: ...${storedToken?.substring(storedToken.length - 20)}`);
    console.log(`  Length: ${storedToken?.length}`);
    
    console.log(`\nIn .env file:`);
    console.log(`  First 20 chars: ${envToken?.substring(0, 20)}...`);
    console.log(`  Last 20 chars: ...${envToken?.substring(envToken.length - 20)}`);
    console.log(`  Length: ${envToken?.length}`);
    
    console.log(`\nAre they the same? ${storedToken === envToken ? '✅ YES' : '❌ NO'}`);
    
    console.log('\n📝 RECOMMENDATION:');
    if (storedToken === envToken) {
      console.log('  Both tokens are identical.');
      console.log('  The issue is likely token expiration.');
      console.log('  You need to generate a new access token from Meta.');
    } else {
      console.log('  Tokens are different!');
      console.log('  Database might have an old/different token.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkToken();
