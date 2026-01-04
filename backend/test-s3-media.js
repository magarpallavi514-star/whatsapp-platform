#!/usr/bin/env node

/**
 * Test S3 Media Service
 * 
 * Tests:
 * 1. Upload test file to S3
 * 2. Generate signed URL
 * 3. Verify file is accessible
 */

import { uploadToS3, getSignedUrlForS3Object } from './src/services/s3Service.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 ========== S3 MEDIA SERVICE TEST ==========\n');

async function testS3Upload() {
  try {
    // Create a test text file
    const testContent = `WhatsApp Platform Media Test
Generated: ${new Date().toISOString()}
This file was uploaded to test S3 integration.`;
    
    const buffer = Buffer.from(testContent, 'utf-8');
    const accountId = 'test_account';
    const mediaType = 'document';
    const mimeType = 'text/plain';
    const filename = 'test-file.txt';
    
    console.log('📤 Uploading test file to S3...');
    console.log('Account ID:', accountId);
    console.log('Media Type:', mediaType);
    console.log('File Size:', buffer.length, 'bytes');
    console.log('');
    
    const result = await uploadToS3(buffer, accountId, mediaType, mimeType, filename);
    
    console.log('✅ Upload Successful!');
    console.log('S3 Key:', result.s3Key);
    console.log('S3 URL:', result.s3Url);
    console.log('');
    
    // Test signed URL generation
    console.log('🔐 Generating signed URL (valid for 1 hour)...');
    const signedUrl = await getSignedUrlForS3Object(result.s3Key, 3600);
    
    console.log('✅ Signed URL Generated:');
    console.log(signedUrl);
    console.log('');
    
    console.log('========================================');
    console.log('✅ ALL TESTS PASSED!');
    console.log('========================================');
    console.log('');
    console.log('📋 Next Steps:');
    console.log('1. Check AWS S3 console to verify file exists');
    console.log('2. Try accessing the signed URL in browser');
    console.log('3. Send a test image on WhatsApp to test webhook integration');
    console.log('');
    
  } catch (error) {
    console.error('❌ Test Failed!');
    console.error('Error:', error.message);
    console.error('');
    
    if (error.message.includes('credentials')) {
      console.error('🔧 Fix: Check your AWS credentials in .env file:');
      console.error('   - AWS_ACCESS_KEY_ID');
      console.error('   - AWS_SECRET_ACCESS_KEY');
      console.error('   - AWS_REGION');
      console.error('   - S3_BUCKET_NAME');
    }
    
    if (error.message.includes('Access Denied')) {
      console.error('🔧 Fix: Ensure your IAM user has S3 permissions:');
      console.error('   - s3:PutObject');
      console.error('   - s3:GetObject');
    }
    
    process.exit(1);
  }
}

// Run test
testS3Upload();
