import jwt from 'jsonwebtoken';

const JWT_SECRET = 'whatsapp-platform-jwt-key';

// Generate tokens for known accounts
const accounts = [
  { email: 'info@enromatics.com', accountId: 'eno_2600003', name: 'Enromatics' },
  { email: 'admin@pixels.com', accountId: 'pixels_internal', name: 'Pixels Admin' },
  { email: 'demo@pixels.com', accountId: 'demo_admin_001', name: 'Demo Admin' }
];

console.log('🔐 Generating test JWT tokens:\n');

accounts.forEach(account => {
  const token = jwt.sign(
    { 
      accountId: account.accountId, 
      email: account.email,
      name: account.name
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
  
  console.log(`📧 ${account.email}`);
  console.log(`   Account ID: ${account.accountId}`);
  console.log(`   Token: ${token}`);
  console.log('');
});

console.log('✅ Use these tokens to test the API');
console.log('Example: curl http://localhost:5050/api/chatbots \\');
console.log('  -H "Authorization: Bearer <token>"');
