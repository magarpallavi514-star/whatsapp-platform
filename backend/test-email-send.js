#!/usr/bin/env node

/**
 * Test Email Sending
 * Send a test welcome email to verify Zepto configuration
 */

import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const ZEPTO_API_KEY = process.env.ZEPTOMAIL_API_TOKEN || process.env.ZEPTO_API_TOKEN || process.env.ZEPTO_API_KEY;
const ZEPTO_BASE_URL = process.env.ZEPTO_API_URL || 'https://api.zeptomail.in/v1.1/email'; // Use from .env or correct default
const FROM_EMAIL = process.env.EMAIL_FROM || 'noreply@yourdomain.com';
const FROM_NAME = 'Pixels WhatsApp';

// Test email address (use the one you want to test)
const TEST_EMAIL = process.argv[2] || 'info@enromatics.com';
const TEST_NAME = process.argv[3] || 'Enromatics Team';

async function sendTestEmail() {
  try {
    console.log('\n📧 SENDING TEST WELCOME EMAIL\n');
    console.log('Configuration:');
    console.log('  To:', TEST_EMAIL);
    console.log('  Name:', TEST_NAME);
    console.log('  From:', FROM_EMAIL);
    console.log('  API URL:', ZEPTO_BASE_URL);
    console.log('  API Key:', ZEPTO_API_KEY ? '✅ Present' : '❌ Missing');

    if (!ZEPTO_API_KEY) {
      throw new Error('API Key not configured');
    }

    console.log('\nSending email...');

    const response = await axios.post(
      ZEPTO_BASE_URL,
      {
        from: { address: FROM_EMAIL, name: FROM_NAME },
        to: [{ email_address: { address: TEST_EMAIL } }],
        subject: '🎉 Welcome to Replysys! (Test)',
        htmlbody: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; }
              .content { padding: 20px 0; }
              .button { background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2>Welcome ${TEST_NAME}! 🚀</h2>
                <p style="font-size: 12px; margin-top: 10px;">This is a TEST email to verify configuration</p>
              </div>
              <div class="content">
                <p>Your Replysys account has been created successfully!</p>
                <p>You can now:</p>
                <ul>
                  <li>Start sending WhatsApp broadcasts to thousands</li>
                  <li>Build no-code chatbots</li>
                  <li>Manage your team and agents</li>
                  <li>Track real-time analytics</li>
                </ul>
                <p>
                  <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" class="button">Login to Dashboard</a>
                </p>
                <p>Need help? Reply to this email or visit our documentation.</p>
              </div>
            </div>
          </body>
          </html>
        `
      },
      {
        headers: {
          'Authorization': ZEPTO_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('\n✅ SUCCESS! Email sent');
    console.log('Response:', response.data);
    console.log('\n📧 Please check your inbox for the test email at:', TEST_EMAIL);

  } catch (error) {
    console.log('\n❌ ERROR: Failed to send email');
    console.log('Message:', error.message);
    
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Response Data:', error.response.data);
    }
    
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check if ZEPTOMAIL_API_TOKEN is correct in .env');
    console.log('2. Check if FROM_EMAIL/EMAIL_FROM is set and verified in Zepto');
    console.log('3. Check if the email address is valid');
    console.log('4. Check Zepto dashboard for rate limits or issues');
    
    process.exit(1);
  }
}

sendTestEmail();
