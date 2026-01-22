import dotenv from 'dotenv';
dotenv.config();

const token = process.env.WHATSAPP_ACCESS_TOKEN;

console.log('🔍 Token Analysis:');
console.log(`Length: ${token.length}`);
console.log(`Starts with: EA${token.substring(2, 10)}...`);
console.log(`Ends with: ...${token.substring(token.length - 5)}`);
console.log(`Contains spaces: ${token.includes(' ')}`);
console.log(`Contains newlines: ${token.includes('\n')}`);

// Check if it has the right format (should start with EA)
if (token.startsWith('EA')) {
  console.log('✅ Token starts correctly (EA prefix)');
} else {
  console.log('❌ Token does NOT start with EA - format issue!');
}

// Try a different endpoint - check permissions
async function checkTokenInfo() {
  try {
    const response = await fetch(
      `https://graph.instagram.com/v20.0/me?access_token=${token}`,
      {
        method: 'GET'
      }
    );

    const data = await response.json();
    console.log('\n📊 Token Info:');
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.log(`Error: ${error.message}`);
  }
}

checkTokenInfo();
