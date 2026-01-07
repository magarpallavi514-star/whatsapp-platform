#!/usr/bin/env node

/**
 * Generate Admin API Key
 * Run this once to create the platform admin key
 * 
 * Usage: node generate-admin-key.js
 */

import { generateAdminKey } from './src/middlewares/adminAuth.js';

console.log('\n🔐 ========== PLATFORM ADMIN KEY GENERATOR ==========\n');
console.log('This will generate a new ADMIN API KEY for platform management.');
console.log('Use this key to create/manage customer accounts.\n');
console.log('⚠️  WARNING: This key has FULL PLATFORM ACCESS!\n');

// Generate the key
const { adminKey, adminKeyHash } = generateAdminKey();

console.log('📝 NEXT STEPS:\n');
console.log('1. Copy the ADMIN_API_KEY_HASH to your .env file');
console.log('2. Store the admin key in a secure password manager');
console.log('3. Use the admin key to create customer accounts\n');

console.log('Example - Create a customer account:');
console.log('─'.repeat(60));
console.log(`curl -X POST http://localhost:5050/api/admin/accounts \\`);
console.log(`  -H "Authorization: Bearer ${adminKey}" \\`);
console.log(`  -H "Content-Type: application/json" \\`);
console.log(`  -d '{`);
console.log(`    "accountId": "customer1",`);
console.log(`    "name": "Customer Company",`);
console.log(`    "email": "info@customer.com",`);
console.log(`    "type": "client",`);
console.log(`    "plan": "pro"`);
console.log(`  }'`);
console.log('');
console.log('This will return a TENANT API KEY for the customer.');
console.log('─'.repeat(60));
console.log('');
