#!/usr/bin/env node

/**
 * Debug Environment Variables
 */

import dotenv from 'dotenv';
dotenv.config();

console.log('🔍 ========== AWS ENVIRONMENT VARIABLES ==========\n');

console.log('AWS_REGION:', process.env.AWS_REGION);
console.log('AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? '✓ Set (' + process.env.AWS_ACCESS_KEY_ID.length + ' chars)' : '✗ Missing');
console.log('AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? '✓ Set (' + process.env.AWS_SECRET_ACCESS_KEY.length + ' chars)' : '✗ Missing');
console.log('S3_BUCKET_NAME:', process.env.S3_BUCKET_NAME);
console.log('WHATSAPP_MEDIA_PREFIX:', process.env.WHATSAPP_MEDIA_PREFIX || 'whatsapp-media/ (default)');

console.log('\n📋 All Environment Variables:');
const awsVars = Object.keys(process.env).filter(key => key.includes('AWS') || key.includes('S3'));
awsVars.forEach(key => {
  const value = process.env[key];
  if (key.includes('SECRET') || key.includes('KEY')) {
    console.log(`${key}=${value ? value.substring(0, 10) + '...' : 'NOT SET'}`);
  } else {
    console.log(`${key}=${value}`);
  }
});

console.log('\n========================================\n');
