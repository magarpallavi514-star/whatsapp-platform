import dotenv from 'dotenv';
import axios from 'axios';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ZEPTO_BASE_URL = process.env.ZEPTO_API_URL || 'https://api.zeptomail.in/v1.1/email';
const ZEPTO_API_KEY = process.env.ZEPTOMAIL_API_TOKEN;
const FROM_EMAIL = process.env.EMAIL_FROM || 'support@replysys.com';
const FROM_NAME = 'Replysys';
const PRODUCTION_URL = process.env.FRONTEND_URL || 'https://app.replysys.com'; // Change to your production domain

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI).then(() => {
  console.log('✅ MongoDB Connected');
}).catch(err => {
  console.error('❌ MongoDB Connection Error:', err.message);
  process.exit(1);
});

// Load models
import User from './src/models/User.js';
import Subscription from './src/models/Subscription.js';
import Invoice from './src/models/Invoice.js';
import PricingPlan from './src/models/PricingPlan.js';

async function generatePassword() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendWelcomeEmail() {
  try {
    console.log('📧 SENDING WELCOME EMAIL FOR ENROMATICS\n');

    // Get Enromatics organization (stored as User)
    const org = await User.findOne({ email: 'info@enromatics.com' });
    if (!org) {
      console.error('❌ Organization not found');
      process.exit(1);
    }

    console.log('Organization found:', org.name);
    console.log('AccountId:', org.accountId, 'Type:', typeof org.accountId);

    // Generate 6-digit password
    const password = await generatePassword();
    console.log('Generated password:', password);

    // Get subscription and invoice details
    let subscriptionDetails = '';
    let invoiceLink = '';
    let planName = 'Starter';
    let amount = 'N/A';

    // Query using _id since accountId might be ObjectId or string
    let queryAccountId = org._id; // Try using user's _id first
    let subscription = await Subscription.findOne({ accountId: queryAccountId });
    if (subscription) {
      const plan = await PricingPlan.findById(subscription.planId);
      if (plan) {
        planName = plan.name;
        amount = plan.monthlyPrice || plan.price;
      }
      subscriptionDetails = `Plan: ${planName} | Amount: ₹${amount}`;
      
      // Get invoice
      const invoice = await Invoice.findOne({ accountId: org.accountId });
      if (invoice) {
        invoiceLink = `<p><a href="${PRODUCTION_URL}/invoices/${invoice._id}/download" class="button">Download Invoice PDF</a></p>`;
      }
    }

    // Update org with password (or store in a separate users collection)
    org.password = password; // Note: In production, hash this!
    await org.save();

    console.log(`\n📊 Client Details:
  Name: ${org.name}
  Email: ${org.email}
  Plan: ${planName}
  Amount: ₹${amount}
  Password: ${password}
  Login URL: ${PRODUCTION_URL}/login`);

    // Send welcome email
    const emailContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; }
          .content { padding: 20px 0; }
          .details-box { background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .button { background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 10px 5px 10px 0; }
          .credentials { background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; border-radius: 4px; margin: 15px 0; }
          code { background: #f0f0f0; padding: 2px 6px; border-radius: 3px; font-family: monospace; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Welcome to Replysys!</h2>
          </div>
          <div class="content">
            <p>Hi ${org.name},</p>
            <p>Your Replysys account has been created successfully!</p>
            <div class="credentials">
              <h3>Your Login Credentials</h3>
              <p><strong>Email:</strong> ${org.email}</p>
              <p><strong>Password:</strong> <code>${password}</code></p>
              <p style="color: red; font-size: 12px;">Please change your password after first login.</p>
            </div>
            <p><a href="${PRODUCTION_URL}/login" class="button">Login to Dashboard</a></p>
            <p>You can now:</p>
            <ul>
              <li>Send WhatsApp broadcasts</li>
              <li>Build chatbots</li>
              <li>Manage your team</li>
              <li>Track analytics</li>
            </ul>
            <p>Need help? Reply to this email or contact support@replysys.com</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const response = await axios.post(
      ZEPTO_BASE_URL,
      {
        from: { address: FROM_EMAIL, name: FROM_NAME },
        to: [{ email_address: { address: org.email } }],
        subject: `🎉 Welcome to Replysys, ${org.name}! Your Account is Ready`,
        htmlbody: emailContent
      },
      {
        headers: {
          'Authorization': ZEPTO_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('\n✅ SUCCESS! Welcome email sent');
    console.log('Response:', response.data);
    console.log('\n📧 Email sent to:', org.email);
    console.log('⏰ Login Details:');
    console.log(`   Email: ${org.email}`);
    console.log(`   Password: ${password}`);
    console.log(`   URL: ${PRODUCTION_URL}/login`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response?.data) {
      console.error('Response Status:', error.response.status);
      console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
    }
    if (error.response?.status === 500) {
      console.error('\n💡 Hint: Check if email body HTML is valid or try using plain text');
    }
    process.exit(1);
  }
}

sendWelcomeEmail();
