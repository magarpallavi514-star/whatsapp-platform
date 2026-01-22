import https from 'https';

const webhookUrl = 'https://whatsapp-platform-production-e48b.up.railway.app/api/webhooks/whatsapp';
const verifyToken = 'pixels_webhook_secret_2025';
const challenge = 'test_challenge_12345';

// Test GET (webhook verification)
const getUrl = new URL(webhookUrl);
getUrl.searchParams.append('hub.mode', 'subscribe');
getUrl.searchParams.append('hub.verify_token', verifyToken);
getUrl.searchParams.append('hub.challenge', challenge);

console.log('🔍 Testing Webhook Configuration...\n');
console.log('URL:', getUrl.toString());

https.get(getUrl, (res) => {
  let data = '';
  
  console.log('Status:', res.statusCode);
  console.log('Headers:', res.headers);
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('\nResponse:', data);
    
    if (data === challenge && res.statusCode === 200) {
      console.log('\n✅ WEBHOOK CONFIGURATION IS CORRECT!');
      console.log('Meta will be able to verify your webhook.');
    } else {
      console.log('\n❌ WEBHOOK CONFIGURATION FAILED!');
      if (data !== challenge) console.log('  - Challenge mismatch');
      if (res.statusCode !== 200) console.log('  - Wrong status code');
    }
    
    process.exit(0);
  });
}).on('error', (error) => {
  console.error('❌ Network Error:', error.message);
  console.log('\nPossible issues:');
  console.log('1. Railway backend is not running');
  console.log('2. Webhook URL is incorrect');
  console.log('3. Domain not properly configured');
  process.exit(1);
});
