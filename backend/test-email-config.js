#!/usr/bin/env node

/**
 * Test Email Configuration
 * Verifies that email service is configured correctly
 */

import dotenv from 'dotenv';

dotenv.config();

console.log('\n🔍 EMAIL CONFIGURATION CHECK\n');

console.log('Environment Variables:');
console.log('  ZEPTOMAIL_API_TOKEN:', process.env.ZEPTOMAIL_API_TOKEN ? '✅ SET' : '❌ NOT SET');
console.log('  ZEPTO_API_KEY:', process.env.ZEPTO_API_KEY ? '✅ SET' : '❌ NOT SET');
console.log('  EMAIL_FROM:', process.env.EMAIL_FROM || process.env.FROM_EMAIL);
console.log('  FRONTEND_URL:', process.env.FRONTEND_URL);

const apiKey = process.env.ZEPTOMAIL_API_TOKEN || process.env.ZEPTO_API_KEY;

if (!apiKey) {
  console.log('\n❌ ERROR: No API key found!');
  console.log('   Please set ZEPTOMAIL_API_TOKEN in .env file');
  process.exit(1);
}

const emailFrom = process.env.EMAIL_FROM || process.env.FROM_EMAIL;
if (!emailFrom) {
  console.log('\n⚠️  WARNING: No FROM email address set!');
  console.log('   Using default: noreply@yourdomain.com');
}

console.log('\n✅ Email configuration looks good!');
console.log('\nTo test sending an email, run:');
console.log('  node test-email-send.js');

process.exit(0);
