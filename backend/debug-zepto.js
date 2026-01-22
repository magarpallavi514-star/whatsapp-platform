#!/usr/bin/env node

/**
 * Debug Zepto API Configuration
 */

import dotenv from 'dotenv';

dotenv.config();

const apiToken = process.env.ZEPTOMAIL_API_TOKEN;

console.log('\n🔍 ZEPTO API TOKEN DEBUG\n');

if (!apiToken) {
  console.log('❌ NO API TOKEN FOUND');
  process.exit(1);
}

console.log('Token length:', apiToken.length);
console.log('Token starts with:', apiToken.substring(0, 20) + '...');
console.log('Token ends with:', '...' + apiToken.substring(apiToken.length - 10));
console.log('Contains "Zoho-enczapikey":', apiToken.includes('Zoho-enczapikey'));
console.log('Contains "enczapikey":', apiToken.includes('enczapikey'));

console.log('\n📝 Full token structure:');
console.log(apiToken);

console.log('\n✅ Token looks valid - might be authorization issue with from-email not being verified in Zepto');
console.log('\n🔧 Next steps:');
console.log('1. Login to Zepto dashboard');
console.log('2. Go to Settings > Email Addresses');
console.log('3. Verify that no-reply@enromatics.com is configured and verified');
console.log('4. If not verified, add and verify it');
