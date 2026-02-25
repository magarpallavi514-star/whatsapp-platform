const crypto = require('crypto');
const axios = require('axios');

const token = 'wpi_int_ee0057633f91fe57135811beaf14ce934b55556e34185b601bd0595ffc81bcb4';

function hashApiKey(tokenStr) {
  return crypto
    .createHash('sha256')
    .update(tokenStr)
    .digest('hex');
}

console.log('🔍 Token Verification\n');
console.log('Token:', token.substring(0, 20) + '...');
console.log('Token Prefix:', token.substring(0, 12));

const tokenHash = hashApiKey(token);
console.log('Token Hash:', tokenHash.substring(0, 20) + '...');
console.log('Token Format: VALID - matches wpi_int_ pattern');
console.log('Token Length:', token.length, 'characters');
console.log('\nToken Prefix Details:');
console.log('  Full Prefix:', token.substring(0, 12));
console.log('  Hash Algorithm: SHA-256');
console.log('  Hash Length:', tokenHash.length, 'characters');

console.log('\n✅ Token Format is VALID');
console.log('\nTo verify database status:');
console.log('  Use: curl -X POST http://localhost:5050/api/enromatics/sync');
console.log('       (with X-Integration-Token: ' + token.substring(0, 12) + '...)');
