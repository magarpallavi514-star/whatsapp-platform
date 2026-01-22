import mongoose from 'mongoose';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config({ path: '.env' });

// Define schemas
const accountSchema = new mongoose.Schema({
  accountId: String,
  name: String,
  email: String,
  plan: String,
  company: String,
  phone: String,
  timezone: String
});

const subscriptionSchema = new mongoose.Schema({
  accountId: mongoose.Schema.Types.ObjectId,
  planId: mongoose.Schema.Types.ObjectId,
  status: String,
  billingCycle: String,
  discount: Number,
  discountType: String,
  amount: Number,
  currency: String,
  startDate: Date,
  renewalDate: Date,
  createdAt: Date
});

const pricingPlanSchema = new mongoose.Schema({
  name: String,
  monthlyPrice: Number,
  setupFee: Number
});

const Account = mongoose.model('Account', accountSchema);
const Subscription = mongoose.model('Subscription', subscriptionSchema);
const PricingPlan = mongoose.model('PricingPlan', pricingPlanSchema);

async function sendSubscriptionEmail() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find Enromatics account
    const account = await Account.findOne({ name: 'Enromatics' });
    if (!account) {
      console.log('❌ Account not found');
      process.exit(1);
    }

    // Find subscription with plan
    const subscription = await Subscription.findOne({ 
      accountId: account._id 
    }).populate('planId');

    if (!subscription) {
      console.log('❌ Subscription not found');
      process.exit(1);
    }

    console.log('📧 Preparing subscription confirmation email...\n');

    const planName = subscription.planId?.name || 'Pro';
    const monthlyPrice = subscription.planId?.monthlyPrice || 4999;
    const setupFee = subscription.planId?.setupFee || 3000;
    const subtotal = monthlyPrice + setupFee;
    const discountAmount = (subtotal * subscription.discount) / 100;
    const totalAmount = subtotal - discountAmount;

    const invoiceNumber = `INV-${account.accountId.toUpperCase()}-${Date.now()}`;
    const invoiceDate = new Date().toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const renewalDate = new Date(subscription.renewalDate).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Prepare email HTML
    const emailHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
    .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
    .invoice { background: white; padding: 20px; margin: 20px 0; border: 1px solid #e0e0e0; border-radius: 8px; }
    .invoice-header { border-bottom: 2px solid #667eea; padding-bottom: 15px; margin-bottom: 15px; }
    .invoice-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
    .invoice-row.total { font-weight: bold; font-size: 18px; border-top: 2px solid #667eea; padding-top: 15px; margin-top: 10px; }
    .status-badge { display: inline-block; background: #4CAF50; color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px; margin: 10px 0; }
    .footer { background: #f0f0f0; padding: 20px; text-align: center; font-size: 12px; color: #666; }
    .button { background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Subscription Confirmed!</h1>
      <p>Your WhatsApp Business Account is ready to use</p>
    </div>

    <div class="content">
      <p>Hi <strong>${account.name}</strong>,</p>
      
      <p>Thank you for activating your subscription! Your WhatsApp Business Account is now fully set up and ready to use.</p>

      <div class="invoice">
        <div class="invoice-header">
          <h2 style="margin: 0;">Invoice #${invoiceNumber}</h2>
          <p style="margin: 5px 0 0 0; color: #666;">Date: ${invoiceDate}</p>
        </div>

        <h3 style="margin-top: 20px; color: #667eea;">Account Details</h3>
        <div class="invoice-row">
          <span><strong>Account Name:</strong></span>
          <span>${account.name}</span>
        </div>
        <div class="invoice-row">
          <span><strong>Company:</strong></span>
          <span>${account.company || 'N/A'}</span>
        </div>
        <div class="invoice-row">
          <span><strong>Email:</strong></span>
          <span>${account.email}</span>
        </div>
        <div class="invoice-row">
          <span><strong>Phone:</strong></span>
          <span>${account.phone || 'N/A'}</span>
        </div>

        <h3 style="margin-top: 20px; color: #667eea;">Subscription Details</h3>
        <div class="invoice-row">
          <span><strong>Plan:</strong></span>
          <span>${planName} Plan</span>
        </div>
        <div class="invoice-row">
          <span><strong>Status:</strong></span>
          <span><span class="status-badge">Active</span></span>
        </div>
        <div class="invoice-row">
          <span><strong>Billing Cycle:</strong></span>
          <span>${subscription.billingCycle.charAt(0).toUpperCase() + subscription.billingCycle.slice(1)}</span>
        </div>
        <div class="invoice-row">
          <span><strong>Next Renewal:</strong></span>
          <span>${renewalDate}</span>
        </div>

        <h3 style="margin-top: 20px; color: #667eea;">Billing Summary</h3>
        <div class="invoice-row">
          <span>Monthly Fee</span>
          <span>₹${monthlyPrice.toLocaleString('en-IN')}</span>
        </div>
        <div class="invoice-row">
          <span>Setup Fee</span>
          <span>₹${setupFee.toLocaleString('en-IN')}</span>
        </div>
        <div class="invoice-row">
          <span><strong>Subtotal</strong></span>
          <span><strong>₹${subtotal.toLocaleString('en-IN')}</strong></span>
        </div>
        <div class="invoice-row">
          <span style="color: #4CAF50;">Discount (${subscription.discount}%)</span>
          <span style="color: #4CAF50;">-₹${discountAmount.toLocaleString('en-IN')}</span>
        </div>
        <div class="invoice-row total">
          <span>Total Due</span>
          <span>₹${totalAmount.toLocaleString('en-IN')}</span>
        </div>
      </div>

      <h3 style="color: #667eea;">What's Included in Your Plan</h3>
      <ul style="line-height: 2;">
        <li>✅ Unlimited message sending</li>
        <li>✅ Conversation management dashboard</li>
        <li>✅ Message templates and automation</li>
        <li>✅ Contact management</li>
        <li>✅ Chat analytics and reporting</li>
        <li>✅ Priority email support</li>
      </ul>

      <p style="margin-top: 30px;">
        <a href="https://replysys.com/dashboard" class="button">Go to Dashboard</a>
      </p>

      <p>If you have any questions, reply to this email or visit our <a href="https://replysys.com/support">support page</a>.</p>

      <p style="margin-top: 30px; color: #666; font-size: 14px;">
        Best regards,<br>
        <strong>ReplySync Team</strong>
      </p>
    </div>

    <div class="footer">
      <p>&copy; 2026 ReplySync. All rights reserved.</p>
      <p>This is an automated email. Please do not reply directly.</p>
    </div>
  </div>
</body>
</html>
    `;

    console.log('📧 Email Details:');
    console.log(`   To: ${account.email}`);
    console.log(`   Subject: Subscription Confirmed - ${planName} Plan`);
    console.log(`   Invoice: ${invoiceNumber}`);
    console.log(`   Amount: ₹${totalAmount.toLocaleString('en-IN')}\n`);

    // Send email via ZeptoMail
    console.log('🚀 Sending email via ZeptoMail...\n');

    const response = await axios.post(process.env.ZEPTO_API_URL, {
      from: {
        address: process.env.EMAIL_FROM,
        name: 'ReplySync'
      },
      to: [
        {
          email_address: {
            address: account.email,
            name: account.name
          }
        }
      ],
      subject: `Subscription Confirmed - ${planName} Plan - Invoice ${invoiceNumber}`,
      htmlbody: emailHTML
    }, {
      headers: {
        'Authorization': process.env.ZEPTOMAIL_API_TOKEN,
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 200) {
      console.log('✅ Email sent successfully!');
      console.log('\n📋 Email Details:');
      console.log(`   Request ID: ${response.data.request_id}`);
      console.log(`   Status: Sent`);
      console.log(`   Recipient: ${account.email}`);
      console.log(`   Invoice: ${invoiceNumber}`);
      console.log(`   Plan: ${planName}`);
      console.log(`   Amount: ₹${totalAmount.toLocaleString('en-IN')}`);
      console.log(`   Discount: ${subscription.discount}% (₹${discountAmount.toLocaleString('en-IN')})\n`);
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

sendSubscriptionEmail();
