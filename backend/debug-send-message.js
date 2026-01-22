#!/usr/bin/env node
/**
 * DEBUG: Check what happens when sending a message
 * Simulates the complete request flow
 */

import mongoose from 'mongoose';

console.log('\n🔍 DEBUGGING: Live Chat Message Send Flow\n');
console.log('═'.repeat(70));

// Simulate request object
const mockReqWithAuth = {
  account: {
    _id: new mongoose.Types.ObjectId('695a15a5c526dbe7c085ece2'),
    accountId: 'pixels_internal',
    name: 'Superadmin'
  },
  accountId: 'pixels_internal',  // From jwtAuth (STRING)
  user: {
    email: 'admin@test.com',
    accountId: 'pixels_internal'
  },
  body: {
    phoneNumberId: '889344924259692',
    recipientPhone: '918087131777',
    message: 'Test message'
  },
  headers: {
    authorization: 'Bearer valid_token'
  }
};

console.log('\n1️⃣  REQUEST OBJECT AFTER AUTH MIDDLEWARE');
console.log('─'.repeat(70));
console.log('req.account:', mockReqWithAuth.account);
console.log('req.accountId:', mockReqWithAuth.accountId);
console.log('req.account._id type:', typeof mockReqWithAuth.account._id);
console.log('req.accountId type:', typeof mockReqWithAuth.accountId);

// Simulate phoneNumberHelper middleware
console.log('\n2️⃣  PHONE NUMBER HELPER MIDDLEWARE');
console.log('─'.repeat(70));
const accountId = mockReqWithAuth.account?._id || mockReqWithAuth.accountId;
console.log('Using accountId:', accountId);
console.log('Type:', typeof accountId);
console.log('Is ObjectId?:', accountId instanceof mongoose.Types.ObjectId);

// Check if phoneNumberId is provided
const phoneNumberId = mockReqWithAuth.body.phoneNumberId;
console.log('\nphoneNumberId from body:', phoneNumberId);
console.log('Check 1: phoneNumberId is provided?', !!phoneNumberId);

if (phoneNumberId) {
  console.log('→ ADVANCED MODE: Will query PhoneNumber with:');
  console.log('  { accountId: ObjectId(...), phoneNumberId: "' + phoneNumberId + '", isActive: true }');
  console.log('✅ Should find the phone');
} else {
  console.log('→ SIMPLE MODE: Will auto-detect phone');
  console.log('  { accountId: ObjectId(...), isActive: true }');
  console.log('✅ Should find a phone');
}

// Check body fields
console.log('\n3️⃣  VALIDATE REQUIRED FIELDS');
console.log('─'.repeat(70));
const { recipientPhone, message } = mockReqWithAuth.body;
console.log('recipientPhone:', recipientPhone);
console.log('message:', message);
console.log('Check: recipientPhone exists?', !!recipientPhone);
console.log('Check: message exists?', !!message);

if (!recipientPhone || !message) {
  console.log('❌ WILL FAIL: Missing required fields!');
  console.log('→ Return 400: Missing required fields');
} else {
  console.log('✅ PASS: All required fields present');
}

// Simulate whatsappService.getPhoneConfig
console.log('\n4️⃣  WHATSAPP SERVICE - GET PHONE CONFIG');
console.log('─'.repeat(70));
const configAccountId = '695a15a5c526dbe7c085ece2';  // From conversation or message
console.log('accountId from service:', configAccountId);
console.log('Type:', typeof configAccountId);

// Check if conversion needed
if (typeof configAccountId === 'string' && /^[a-f0-9]{24}$/.test(configAccountId)) {
  console.log('Detected 24-char hex string - will convert to ObjectId');
  const converted = new mongoose.Types.ObjectId(configAccountId);
  console.log('Converted to:', converted);
  console.log('✅ Query will use ObjectId');
} else {
  console.log('Not a hex string - will use as-is');
}

console.log('\n5️⃣  POTENTIAL FAILURE POINTS');
console.log('─'.repeat(70));
const failurePoints = [
  { 
    point: 'Auth middleware missing req.account._id',
    impact: 'phoneNumberHelper gets undefined accountId',
    symptom: 'TypeError: Cannot read property'
  },
  {
    point: 'phoneNumberHelper middleware catches error',
    impact: 'Returns 500 with error details',
    symptom: 'Empty error {} if error.message is undefined'
  },
  {
    point: 'PhoneNumber not found in ADVANCED MODE',
    impact: 'Returns 403 - Invalid or inactive phone number',
    symptom: 'Frontend shows error message'
  },
  {
    point: 'Missing recipientPhone or message in body',
    impact: 'Returns 400 - Missing required fields',
    symptom: 'Frontend shows validation error'
  },
  {
    point: 'whatsappService.sendTextMessage throws error',
    impact: 'Returns 500 with error.message',
    symptom: 'Empty error {} if error is undefined'
  },
  {
    point: 'Meta API rejects the request',
    impact: 'axios throws error in whatsappService',
    symptom: 'Shows axios error'
  }
];

failurePoints.forEach((fp, i) => {
  console.log(`\n${i + 1}. ${fp.point}`);
  console.log(`   Impact: ${fp.impact}`);
  console.log(`   Symptom: ${fp.symptom}`);
});

console.log('\n' + '═'.repeat(70));
console.log('\n✅ DIAGNOSTIC COMPLETE\n');
console.log('NEXT STEPS:');
console.log('1. Check browser console for full error details');
console.log('2. Check backend server logs for error messages');
console.log('3. Verify phoneNumberId is being sent in request body');
console.log('4. Verify JWT token is valid and contains accountId');
console.log('5. Verify phone number exists in database for this account\n');
