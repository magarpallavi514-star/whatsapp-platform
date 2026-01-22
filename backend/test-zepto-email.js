#!/usr/bin/env node
/**
 * Test Zepto Email Service
 * Sends a test email to verify Zepto Mail setup
 */

import { SendMailClient } from "zeptomail";
import dotenv from 'dotenv';

dotenv.config();

const ZEPTO_API_URL = process.env.ZEPTO_API_URL || "https://api.zeptomail.in/v1.1/email";
const ZEPTO_API_TOKEN = process.env.ZEPTO_API_TOKEN;
const ZEPTO_FROM = process.env.ZEPTO_FROM || "support@replysys.com";

console.log('🧪 Testing Zepto Email Service...\n');
console.log('📧 Configuration:');
console.log(`   From: ${ZEPTO_FROM}`);
console.log(`   API URL: ${ZEPTO_API_URL}`);
console.log(`   Token: ${ZEPTO_API_TOKEN ? '✅ Present' : '❌ Missing'}\n`);

if (!ZEPTO_API_TOKEN) {
  console.error('❌ ERROR: ZEPTO_API_TOKEN not found in .env file!\n');
  process.exit(1);
}

const client = new SendMailClient({ url: ZEPTO_API_URL, token: ZEPTO_API_TOKEN });

async function sendTestEmail() {
  try {
    console.log('📤 Sending test email to info@enromatics.com...\n');

    const response = await client.sendMail({
      from: {
        address: ZEPTO_FROM,
        name: "Replysys Support"
      },
      to: [
        {
          email_address: {
            address: "info@enromatics.com",
            name: "Entomatic Admin"
          }
        }
      ],
      subject: "🚀 Replysys Platform - Test Email",
      htmlbody: `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
              .container { max-width: 600px; margin: 0 auto; padding: 0; }
              .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px 20px; text-align: center; }
              .header h1 { margin: 0; font-size: 28px; }
              .content { background: #f9fafb; padding: 30px 20px; }
              .content p { margin: 15px 0; }
              .success { color: #10b981; font-weight: bold; }
              .highlight-box { background: white; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; }
              .highlight-box ul { margin: 10px 0; padding-left: 20px; }
              .highlight-box li { margin: 8px 0; }
              .footer { background: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; }
              .footer a { color: #10b981; text-decoration: none; }
              .cta-button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 15px 0; font-weight: bold; }
            </style>
          </head>
          <body style="margin: 0; padding: 0;">
            <div class="container">
              <div class="header">
                <h1>✅ Replysys Platform Email Test</h1>
                <p style="margin: 10px 0 0 0; font-size: 14px;">Email Service Verification</p>
              </div>
              <div class="content">
                <p>Hello Entomatic Admin,</p>
                <p>This is a <span class="success">test email</span> from our email service verification system. If you received this, our email service is <span class="success">working perfectly!</span></p>
                
                <div class="highlight-box">
                  <strong>📋 Email Service Details:</strong>
                  <ul>
                    <li><strong>Service:</strong> Zepto Mail (Zoho)</li>
                    <li><strong>From:</strong> ${ZEPTO_FROM}</li>
                    <li><strong>Status:</strong> ✅ OPERATIONAL</li>
                    <li><strong>Sent At:</strong> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</li>
                  </ul>
                </div>

                <h3>🎯 What's Next:</h3>
                <ol>
                  <li>✅ Confirm you received this email</li>
                  <li>📝 We'll create your Entomatic account</li>
                  <li>🔐 Send you login credentials</li>
                  <li>🚀 Begin WhatsApp automation</li>
                </ol>

                <p style="margin-top: 30px;">
                  <a href="https://replysys.com" class="cta-button">Visit Replysys Platform</a>
                </p>

                <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                  <strong>Replysys Platform</strong><br>
                  International WhatsApp Automation<br>
                  <a href="https://replysys.com" style="color: #10b981;">https://replysys.com</a><br>
                  <a href="mailto:support@replysys.com" style="color: #10b981;">support@replysys.com</a>
                </p>
              </div>
              <div class="footer">
                <p style="margin: 0;">© 2026 Replysys. All rights reserved.</p>
                <p style="margin: 5px 0 0 0; color: #9ca3af;">This is an automated test email. Please do not reply to this address.</p>
              </div>
            </div>
          </body>
        </html>
      `,
      reply_to: {
        address: "support@replysys.com",
        name: "Replysys Support"
      }
    });

    console.log('✅ SUCCESS! Email sent successfully!\n');
    console.log('📊 Response:');
    console.log(JSON.stringify(response, null, 2));
    console.log('\n✅ Zepto Mail is working correctly!');
    console.log('🎉 Ready to send client credentials!\n');

    return true;

  } catch (error) {
    console.error('❌ ERROR sending email:\n');
    console.error('Message:', error.message);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    }

    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check ZEPTO_API_TOKEN in .env');
    console.log('2. Verify ZEPTO_FROM email is verified in Zepto Mail account');
    console.log('3. Ensure ZEPTO_API_URL is correct');
    console.log('4. Check internet connection');
    console.log('5. Verify recipient email is valid\n');

    return false;
  }
}

// Run test
sendTestEmail().then(success => {
  process.exit(success ? 0 : 1);
});
