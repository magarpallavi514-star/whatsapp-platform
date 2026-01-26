import axios from 'axios';

const ZEPTO_API_KEY = process.env.ZEPTOMAIL_API_TOKEN || process.env.ZEPTO_API_TOKEN || process.env.ZEPTO_API_KEY;
const ZEPTO_BASE_URL = process.env.ZEPTO_API_URL || 'https://api.zeptomail.in/v1.1/email';
const FROM_EMAIL = process.env.EMAIL_FROM || process.env.FROM_EMAIL || 'noreply@yourdomain.com';
const FROM_NAME = 'Replysys'; // Changed from "Pixels WhatsApp" to "Replysys"
const ENABLE_EMAIL = process.env.ENABLE_EMAIL !== 'false';

// Helper function to send email via Zepto
const sendViaZepto = async (to, subject, htmlbody) => {
  if (!ZEPTO_API_KEY) {
    console.warn('⚠️  ZEPTO_API_KEY not configured');
    return { success: false, error: 'Email API key not configured' };
  }

  try {
    const response = await axios.post(
      ZEPTO_BASE_URL,
      {
        from: { address: FROM_EMAIL, name: FROM_NAME },
        to: [{ email_address: { address: to } }],
        subject: subject,
        htmlbody: htmlbody
      },
      {
        headers: {
          'Authorization': ZEPTO_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );
    return { success: true };
  } catch (error) {
    console.error('  Zepto Error:', error.response?.data || error.message);
    throw error;
  }
};

export const emailService = {
  // Generic send email function
  sendEmail: async (to, subject, htmlbody) => {
    try {
      if (!ENABLE_EMAIL) {
        console.log('✅ Email service disabled - skipping');
        return { success: true, skipped: true };
      }
      await sendViaZepto(to, subject, htmlbody);
      return { success: true };
    } catch (error) {
      console.error('❌ Error sending email:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Send welcome email on signup
  sendWelcomeEmail: async (email, name) => {
    try {
      console.log('📧 [EMAIL SERVICE] Attempting to send welcome email...');
      console.log('  To:', email);
      console.log('  Name:', name);
      console.log('  From:', FROM_EMAIL);
      console.log('  Email enabled:', ENABLE_EMAIL);
      
      if (!ENABLE_EMAIL) {
        console.log('✅ Email service disabled - skipping (set ENABLE_EMAIL=true to enable)');
        return { success: true, skipped: true };
      }

      await sendViaZepto(
        email,
        '🎉 Welcome to Replysys!',
        `
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
                <h2>Welcome to Replysys, ${name}! 🚀</h2>
              </div>
              <div class="content">
                <p>Your Replysys account has been created successfully!</p>
                <p>You can now:</p>
                <ul>
                  <li>Send WhatsApp broadcasts to thousands</li>
                  <li>Build powerful chatbots</li>
                  <li>Manage your team and agents</li>
                  <li>Track real-time analytics</li>
                </ul>
                <p>
                  <a href="${process.env.FRONTEND_URL}/login" class="button">Login to Replysys Dashboard</a>
                </p>
                <p>Need help? Reply to this email or contact our support team.</p>
              </div>
            </div>
          </body>
          </html>
        `
      );
      
      console.log('✅ Welcome email sent to', email);
      return { success: true };
    } catch (error) {
      console.error('❌ Welcome email failed:', error.message);
      if (error.response?.data) {
        console.error('  Response:', error.response.data);
      }
      return { success: false, error: error.message };
    }
  },

  // Send invoice email
  sendInvoiceEmail: async (email, invoiceNumber, pdfUrl, amount, organizationName) => {
    try {
      const response = await axios.post(
        `${ZEPTO_BASE_URL}/v1.1/email/send`,
        {
          from: { address: FROM_EMAIL, name: 'Pixels Billing' },
          to: [{ email_address: { address: email } }],
          subject: `Invoice #${invoiceNumber} - Pixels WhatsApp`,
          htmlbody: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .invoice-header { border-bottom: 2px solid #667eea; padding-bottom: 20px; margin-bottom: 20px; }
                .amount { font-size: 32px; font-weight: bold; color: #667eea; }
                .button { background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="invoice-header">
                  <h2>Invoice #${invoiceNumber}</h2>
                  <p>Organization: ${organizationName}</p>
                </div>
                <div>
                  <p class="amount">₹${amount.toLocaleString('en-IN')}</p>
                  <p>Due for payment</p>
                  <p style="margin: 20px 0;">
                    <a href="${pdfUrl}" class="button">Download Invoice PDF</a>
                  </p>
                  <p>Questions? Check your <a href="${process.env.FRONTEND_URL}/dashboard/invoices">billing dashboard</a></p>
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
      console.log('✅ Invoice email sent to', email);
      return { success: true };
    } catch (error) {
      console.error('❌ Invoice email failed:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Send password reset email
  sendPasswordResetEmail: async (email, resetToken) => {
    try {
      const resetLink = `${process.env.FRONTEND_URL}/auth/reset-password?token=${resetToken}`;
      const response = await axios.post(
        `${ZEPTO_BASE_URL}/v1.1/email/send`,
        {
          from: { address: FROM_EMAIL, name: FROM_NAME },
          to: [{ email_address: { address: email } }],
          subject: '🔐 Password Reset Request - Pixels WhatsApp',
          htmlbody: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .alert { background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0; }
                .button { background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; }
              </style>
            </head>
            <body>
              <div class="container">
                <h2>Password Reset Request</h2>
                <p>We received a request to reset your password. Click the link below:</p>
                <p style="margin: 20px 0;">
                  <a href="${resetLink}" class="button">Reset Password</a>
                </p>
                <div class="alert">
                  <strong>⚠️ Note:</strong> This link expires in 1 hour for security.
                </div>
                <p>If you didn't request this, please ignore this email.</p>
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
      console.log('✅ Password reset email sent to', email);
      return { success: true };
    } catch (error) {
      console.error('❌ Password reset email failed:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Send payment confirmation email
  sendPaymentConfirmationEmail: async (email, transactionId, amount, status, planName = 'WhatsApp Plan') => {
    try {
      const statusText = status === 'success' ? 'Successful ✅' : 'Failed ❌';
      const statusColor = status === 'success' ? '#28a745' : '#dc3545';
      
      const response = await axios.post(
        `${ZEPTO_BASE_URL}/v1.1/email/send`,
        {
          from: { address: FROM_EMAIL, name: 'Pixels Payments' },
          to: [{ email_address: { address: email } }],
          subject: `Payment ${statusText.replace(' ✅', '').replace(' ❌', '')} - ₹${amount}`,
          htmlbody: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .status-badge { 
                  display: inline-block; 
                  padding: 10px 20px; 
                  background: ${statusColor}; 
                  color: white; 
                  border-radius: 4px; 
                  font-weight: bold;
                }
                .details { background: #f8f9fa; padding: 15px; border-radius: 4px; margin: 20px 0; }
                .button { background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; }
              </style>
            </head>
            <body>
              <div class="container">
                <h2>Payment <span class="status-badge">${statusText}</span></h2>
                <div class="details">
                  <p><strong>Plan:</strong> ${planName}</p>
                  <p><strong>Amount:</strong> ₹${amount.toLocaleString('en-IN')}</p>
                  <p><strong>Transaction ID:</strong> ${transactionId}</p>
                  <p><strong>Status:</strong> ${status.toUpperCase()}</p>
                </div>
                <p style="margin: 20px 0;">
                  <a href="${process.env.FRONTEND_URL}/dashboard/invoices" class="button">View Invoice</a>
                </p>
                ${status === 'success' ? '<p>Your subscription is now active. Start sending WhatsApp campaigns!</p>' : '<p>If this failed, please try again or contact support.</p>'}
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
      console.log('✅ Payment confirmation email sent to', email);
      return { success: true };
    } catch (error) {
      console.error('❌ Payment email failed:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Send subscription renewal reminder
  sendRenewalReminderEmail: async (email, organizationName, renewalDate, amount) => {
    try {
      const formattedDate = new Date(renewalDate).toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      const response = await axios.post(
        `${ZEPTO_BASE_URL}/v1.1/email/send`,
        {
          from: { address: FROM_EMAIL, name: 'Pixels Billing' },
          to: [{ email_address: { address: email } }],
          subject: `Subscription Renewal Reminder - ${organizationName}`,
          htmlbody: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .reminder { background: #e7f3ff; padding: 15px; border-left: 4px solid #2196F3; }
              </style>
            </head>
            <body>
              <div class="container">
                <h2>Subscription Renewal Reminder</h2>
                <div class="reminder">
                  <p>Your Pixels WhatsApp subscription for <strong>${organizationName}</strong> will renew on:</p>
                  <p style="font-size: 18px; font-weight: bold; color: #2196F3;">${formattedDate}</p>
                  <p>Amount: <strong>₹${amount.toLocaleString('en-IN')}</strong></p>
                </div>
                <p>No action needed - your subscription will auto-renew. <a href="${process.env.FRONTEND_URL}/dashboard/billing">Manage billing here</a></p>
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
      console.log('✅ Renewal reminder email sent to', email);
      return { success: true };
    } catch (error) {
      console.error('❌ Renewal reminder email failed:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Send payment link email (when admin generates payment link for client)
  sendPaymentLinkEmail: async (email, paymentLink, invoiceNumber, amount, clientName) => {
    try {
      console.log('📧 [EMAIL SERVICE] Sending payment link email...');
      console.log('  To:', email);
      console.log('  Invoice:', invoiceNumber);
      console.log('  Amount:', amount);
      console.log('  Endpoint:', ZEPTO_BASE_URL);
      
      if (!ENABLE_EMAIL) {
        console.log('✅ Email service disabled - skipping (set ENABLE_EMAIL=true to enable)');
        return { success: true, skipped: true };
      }

      await sendViaZepto(
        email,
        `💳 Payment Link for Invoice #${invoiceNumber} - Replysys`,
        `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px; }
              .amount { font-size: 36px; font-weight: bold; color: #667eea; margin: 20px 0; }
              .payment-box { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .button { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold; }
              .details { background: #f0f0f0; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2>Payment Link Ready! 💳</h2>
                <p>Invoice #${invoiceNumber}</p>
              </div>
              
              <p>Hi ${clientName},</p>
              
              <p>Your payment link is ready. Click below to complete your payment:</p>
              
              <div class="payment-box">
                <p style="text-align: center; margin: 0;">Amount Due:</p>
                <p style="text-align: center;" class="amount">₹${amount.toLocaleString('en-IN')}</p>
                <p style="text-align: center; margin: 20px 0;">
                  <a href="${paymentLink}" class="button">Pay Now</a>
                </p>
              </div>

              <div class="details">
                <h4>Invoice Details</h4>
                <p><strong>Invoice #:</strong> ${invoiceNumber}</p>
                <p><strong>Amount:</strong> ₹${amount.toLocaleString('en-IN')}</p>
                <p><strong>Payment Link:</strong> <a href="${paymentLink}" style="color: #667eea;">${paymentLink}</a></p>
              </div>

              <p>You can also access this link anytime from your <a href="${process.env.FRONTEND_URL}/dashboard/invoices" style="color: #667eea;">Replysys dashboard</a>.</p>
              
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
              
              <p style="font-size: 12px; color: #999;">If you have any questions, please reply to this email or contact Replysys support.</p>
            </div>
          </body>
          </html>
        `
      );
      
      console.log('✅ Payment link email sent to', email);
      return { success: true };
    } catch (error) {
      console.error('❌ Payment link email failed:', error.message);
      if (error.response?.data) {
        console.error('  Response:', error.response.data);
      }
      return { success: false, error: error.message };
    }
  },

  // Send pending payment notification for subscription plans
  sendPendingPaymentEmail: async (email, name, plan, planAmount, billingCycle, paymentLink) => {
    try {
      console.log('📧 [EMAIL SERVICE] Sending pending payment email...');
      console.log('  To:', email);
      console.log('  Plan:', plan, 'Amount:', planAmount);
      
      if (!ENABLE_EMAIL) {
        console.log('✅ Email service disabled - skipping');
        return { success: true };
      }

      const planDisplay = {
        starter: 'Starter',
        pro: 'Pro',
        enterprise: 'Enterprise',
        custom: 'Custom'
      }[plan] || plan;

      const billingCycleDisplay = {
        monthly: 'Monthly',
        quarterly: 'Quarterly (3 Months)',
        annual: 'Annual (12 Months)'
      }[billingCycle] || billingCycle;

      const htmlbody = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; line-height: 1.6; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; border-radius: 8px 8px 0 0; text-align: center; }
              .header h1 { margin: 0; font-size: 28px; }
              .header p { margin: 10px 0 0 0; font-size: 16px; opacity: 0.95; }
              .content { background: white; padding: 30px; }
              .greeting { font-size: 18px; color: #333; margin-bottom: 20px; }
              .plan-box { background: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #667eea; }
              .plan-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e0e0e0; }
              .plan-row:last-child { border-bottom: none; }
              .plan-label { font-weight: 600; color: #666; }
              .plan-value { font-weight: bold; color: #111; }
              .amount { font-size: 32px; color: #667eea; font-weight: bold; margin-top: 10px; }
              .button { background: #667eea; color: white; padding: 14px 28px; border-radius: 6px; text-decoration: none; display: inline-block; margin: 25px 0; font-weight: bold; font-size: 16px; }
              .button:hover { background: #5568d3; }
              .button-container { text-align: center; }
              .benefits { background: #f0f4ff; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .benefits h3 { color: #667eea; margin-top: 0; }
              .benefits ul { margin: 10px 0; padding-left: 20px; }
              .benefits li { margin: 8px 0; color: #333; }
              .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Welcome to Replysys! 🚀</h1>
                <p>Let's get you started in just 1 click</p>
              </div>

              <div class="content">
                <p class="greeting">Hi ${name},</p>

                <p>Thank you so much for signing up for Replysys! We're thrilled to have you on board. Your selected plan is ready to activate—just one quick payment to unlock all the amazing features.</p>

                <div class="plan-box">
                  <div class="plan-row">
                    <span class="plan-label">Your Plan</span>
                    <span class="plan-value">${planDisplay}</span>
                  </div>
                  <div class="plan-row">
                    <span class="plan-label">Billing Cycle</span>
                    <span class="plan-value">${billingCycleDisplay}</span>
                  </div>
                  <div style="border-top: 2px solid #e0e0e0; margin-top: 15px; padding-top: 15px;">
                    <div class="plan-label">Total Amount</div>
                    <div class="amount">₹${planAmount.toLocaleString('en-IN')}</div>
                  </div>
                </div>

                <div class="button-container">
                  <a href="${paymentLink}" class="button">Complete Payment Now</a>
                </div>

                <div class="benefits">
                  <h3>What You'll Get:</h3>
                  <ul>
                    <li>📱 Send WhatsApp broadcasts to thousands instantly</li>
                    <li>🤖 Build intelligent chatbots without coding</li>
                    <li>👥 Manage your entire team in one dashboard</li>
                    <li>📊 Real-time analytics and insights</li>
                    <li>⚡ 24/7 priority support</li>
                  </ul>
                </div>

                <p>Payment is secure and encrypted. We accept all major credit cards, debit cards, and digital wallets.</p>

                <p>Have questions? We're here to help! Reply to this email or <a href="https://replysys.com/support" style="color: #667eea; text-decoration: none; font-weight: bold;">contact our support team</a>.</p>

                <p style="margin-top: 30px; color: #666;">
                  <strong>${name}</strong>, we can't wait to see you succeed with Replysys!<br/>
                  <em>— The Replysys Team</em>
                </p>

                <div class="footer">
                  <p>© ${new Date().getFullYear()} Replysys. All rights reserved.</p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `;

      return await sendViaZepto(
        email,
        `Welcome ${name}! Complete Your Payment to Start Using Replysys`,
        htmlbody
      );
    } catch (error) {
      console.error('❌ Pending payment email failed:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Send payment reminder email (for users who registered but haven't paid)
  sendPaymentReminderEmail: async (email, name, plan, planAmount, billingCycle, paymentLink) => {
    try {
      console.log('📧 [EMAIL SERVICE] Sending payment reminder email...');
      console.log('  To:', email);
      console.log('  Plan:', plan);
      
      if (!ENABLE_EMAIL) {
        console.log('✅ Email service disabled - skipping');
        return { success: true };
      }

      const planDisplay = {
        starter: 'Starter',
        pro: 'Pro',
        enterprise: 'Enterprise',
        custom: 'Custom'
      }[plan] || plan;

      const billingCycleDisplay = {
        monthly: 'Monthly',
        quarterly: 'Quarterly (3 Months)',
        annual: 'Annual (12 Months)'
      }[billingCycle] || billingCycle;

      const htmlbody = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; line-height: 1.6; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; border-radius: 8px 8px 0 0; text-align: center; }
              .header h1 { margin: 0; font-size: 24px; }
              .content { background: white; padding: 30px; }
              .reminder-box { background: #f0f4ff; border-left: 4px solid #667eea; padding: 15px; border-radius: 6px; margin: 20px 0; }
              .plan-details { background: #f8f9fa; padding: 15px; border-radius: 6px; margin: 20px 0; }
              .plan-row { display: flex; justify-content: space-between; padding: 8px 0; }
              .plan-label { font-weight: 600; color: #666; }
              .plan-value { font-weight: bold; }
              .amount { font-size: 24px; color: #667eea; font-weight: bold; }
              .button { background: #667eea; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block; margin: 20px 0; font-weight: bold; }
              .button:hover { background: #5568d3; }
              .button-container { text-align: center; }
              .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>One More Step! ⏰</h1>
              </div>

              <div class="content">
                <p>Hi ${name},</p>

                <p>We hope you're excited about Replysys! It looks like you haven't completed your payment yet. We're here to help you get started quickly.</p>

                <div class="reminder-box">
                  <strong>Your plan is reserved:</strong> ${planDisplay} (${billingCycleDisplay})
                  <div style="margin-top: 10px; font-size: 18px; color: #667eea;">
                    ₹${planAmount.toLocaleString('en-IN')}
                  </div>
                </div>

                <div class="button-container">
                  <a href="${paymentLink}" class="button">Complete Payment Now</a>
                </div>

                <p>If you're having any trouble completing the payment or have questions, our support team is here to help. Just reply to this email.</p>

                <p style="margin-top: 30px; font-size: 14px; color: #666;">
                  Looking forward to helping you succeed!<br/>
                  <em>— The Replysys Team</em>
                </p>

                <div class="footer">
                  <p>© ${new Date().getFullYear()} Replysys. All rights reserved.</p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `;

      return await sendViaZepto(
        email,
        `Complete Your Payment - Unlock Replysys Now`,
        htmlbody
      );
    } catch (error) {
      console.error('❌ Payment reminder email failed:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Send payment confirmation email
  sendPaymentConfirmationEmail: async (email, name, plan, planAmount, transactionId) => {
    try {
      console.log('📧 [EMAIL SERVICE] Sending payment confirmation email...');
      console.log('  To:', email);
      console.log('  Transaction ID:', transactionId);
      
      if (!ENABLE_EMAIL) {
        console.log('✅ Email service disabled - skipping');
        return { success: true };
      }

      const planDisplay = {
        starter: 'Starter',
        pro: 'Pro',
        enterprise: 'Enterprise',
        custom: 'Custom'
      }[plan] || plan;

      const htmlbody = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
              .content { background: #f0fdf4; padding: 20px; border-left: 4px solid #16a34a; }
              .success-box { background: #dcfce7; border: 1px solid #86efac; color: #166534; padding: 15px; border-radius: 6px; margin: 15px 0; }
              .details { background: white; padding: 15px; border: 1px solid #bbf7d0; border-radius: 6px; margin: 15px 0; }
              .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #d1fae5; }
              .detail-row:last-child { border-bottom: none; }
              .button { background: #16a34a; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block; margin: 20px 0; font-weight: bold; }
              .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #d1fae5; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0;">✓ Payment Confirmed</h1>
                <p style="margin: 5px 0 0 0;">Your account is now active</p>
              </div>

              <div class="content">
                <p>Hi <strong>${name}</strong>,</p>

                <div class="success-box">
                  <strong>✓ Your payment has been successfully processed!</strong><br>
                  Your account is now fully activated and all features are available.
                </div>

                <h3 style="margin-top: 20px;">Payment Details</h3>
                <div class="details">
                  <div class="detail-row">
                    <span><strong>Plan</strong></span>
                    <span>${planDisplay}</span>
                  </div>
                  <div class="detail-row">
                    <span><strong>Amount Paid</strong></span>
                    <span>₹${planAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div class="detail-row">
                    <span><strong>Transaction ID</strong></span>
                    <span>${transactionId}</span>
                  </div>
                  <div class="detail-row">
                    <span><strong>Date</strong></span>
                    <span>${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                </div>

                <p style="text-align: center;">
                  <a href="${process.env.FRONTEND_URL || 'https://app.pixelswhatsapp.com'}/dashboard" class="button">Go to Dashboard →</a>
                </p>

                <p>You now have full access to all features. If you need any assistance, our support team is here to help.</p>

                <div class="footer">
                  <p>© ${new Date().getFullYear()} PixelsWhatsApp. All rights reserved.</p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `;

      return await sendViaZepto(
        email,
        `✓ Payment Confirmed - Your Account is Now Active`,
        htmlbody
      );
    } catch (error) {
      console.error('❌ Payment confirmation email failed:', error.message);
      return { success: false, error: error.message };
    }
  },

  // 🔴 Send payment confirmation email using pricing snapshot (NEVER fetch live prices)
  sendPaymentConfirmationEmailWithSnapshot: async (email, name, pricingSnapshot, transactionId) => {
    try {
      console.log('📧 [EMAIL SERVICE] Sending payment confirmation email with pricing snapshot...');
      console.log('  To:', email);
      console.log('  Plan:', pricingSnapshot?.planName);
      console.log('  Amount:', pricingSnapshot?.calculatedAmount);
      
      if (!ENABLE_EMAIL) {
        console.log('✅ Email service disabled - skipping');
        return { success: true };
      }

      const htmlbody = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
              .content { background: #f0fdf4; padding: 20px; border-left: 4px solid #16a34a; }
              .success-box { background: #dcfce7; border: 1px solid #86efac; color: #166534; padding: 15px; border-radius: 6px; margin: 15px 0; }
              .details { background: white; padding: 15px; border: 1px solid #bbf7d0; border-radius: 6px; margin: 15px 0; }
              .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #d1fae5; }
              .detail-row:last-child { border-bottom: none; }
              .amount-highlight { color: #16a34a; font-weight: bold; font-size: 24px; }
              .button { background: #16a34a; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block; margin: 20px 0; font-weight: bold; }
              .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #d1fae5; }
              .snapshot-note { background: #fef3c7; border: 1px solid #fcd34d; padding: 10px; border-radius: 4px; font-size: 12px; color: #92400e; margin-top: 15px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0;">✓ Payment Confirmed</h1>
                <p style="margin: 5px 0 0 0;">Your account is now active</p>
              </div>

              <div class="content">
                <p>Hi <strong>${name}</strong>,</p>

                <div class="success-box">
                  <strong>✓ Your payment has been successfully processed!</strong><br>
                  Your account is now fully activated and all features are available.
                </div>

                <h3 style="margin-top: 20px;">Payment Details</h3>
                <div class="details">
                  <div class="detail-row">
                    <span><strong>Plan</strong></span>
                    <span>${pricingSnapshot?.planName || 'WhatsApp Plan'}</span>
                  </div>
                  <div class="detail-row">
                    <span><strong>Billing Cycle</strong></span>
                    <span>${(pricingSnapshot?.selectedBillingCycle || 'monthly').toUpperCase()}</span>
                  </div>
                  <div class="detail-row">
                    <span><strong>Monthly Price</strong></span>
                    <span>₹${pricingSnapshot?.monthlyPrice?.toLocaleString('en-IN') || 'N/A'}</span>
                  </div>
                  ${pricingSnapshot?.discountApplied ? `
                  <div class="detail-row">
                    <span><strong>Discount Applied</strong></span>
                    <span>${pricingSnapshot.discountApplied}% (${pricingSnapshot.discountReason})</span>
                  </div>
                  ` : ''}
                  <div class="detail-row" style="border-bottom: none; margin-top: 10px; padding-top: 10px; border-top: 2px solid #d1fae5;">
                    <span><strong>Total Amount Paid</strong></span>
                    <span class="amount-highlight">₹${pricingSnapshot?.calculatedAmount?.toLocaleString('en-IN') || 'N/A'}</span>
                  </div>
                  <div class="detail-row">
                    <span><strong>Transaction ID</strong></span>
                    <span>${transactionId}</span>
                  </div>
                  <div class="detail-row">
                    <span><strong>Date</strong></span>
                    <span>${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                </div>

                <div class="snapshot-note">
                  ℹ️ This email confirms the exact plan and pricing that was shown at checkout time. The amount you were charged is locked and cannot change.
                </div>

                <p style="margin: 20px 0; text-align: center;">
                  <a href="${process.env.FRONTEND_URL}/dashboard/invoices" class="button">View Your Invoice</a>
                </p>

                <p>Your subscription is now active. You can start using all features immediately. If you have any questions, please contact our support team.</p>

                <div class="footer">
                  <p>Thank you for choosing Replysys!</p>
                  <p>This is an automated email. Please do not reply to this address.</p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `;

      await sendViaZepto(
        email,
        `Payment Confirmed - ₹${pricingSnapshot?.calculatedAmount?.toLocaleString('en-IN') || 'N/A'} - ${pricingSnapshot?.planName}`,
        htmlbody
      );

      console.log('✅ Payment confirmation email (with snapshot) sent to', email);
      return { success: true };
    } catch (error) {
      console.error('❌ Payment confirmation email (with snapshot) failed:', error.message);
      return { success: false, error: error.message };
    }
  },

  // ✅ Send payment failed/timeout email
  sendPaymentFailedEmail: async ({ email, name, plan, amount, paymentDeadline, retryLink, reason }) => {
    try {
      console.log('📧 [EMAIL SERVICE] Sending payment failed email...');
      console.log('  To:', email);
      console.log('  Plan:', plan);
      console.log('  Reason:', reason);
      
      if (!ENABLE_EMAIL) {
        console.log('✅ Email service disabled - skipping');
        return { success: true };
      }

      const planDisplay = {
        starter: 'Starter',
        pro: 'Pro',
        enterprise: 'Enterprise',
        custom: 'Custom'
      }[plan] || plan;

      const htmlbody = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; line-height: 1.6; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px 20px; border-radius: 8px 8px 0 0; text-align: center; }
              .header h1 { margin: 0; font-size: 24px; }
              .content { background: white; padding: 30px; }
              .alert-box { background: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; border-radius: 6px; margin: 20px 0; }
              .alert-title { color: #991b1b; font-weight: 600; }
              .plan-details { background: #f9fafb; padding: 15px; border-radius: 6px; margin: 20px 0; }
              .plan-row { display: flex; justify-content: space-between; padding: 8px 0; }
              .plan-label { font-weight: 600; color: #666; }
              .plan-value { font-weight: bold; }
              .amount { font-size: 24px; color: #ef4444; font-weight: bold; }
              .button { background: #ef4444; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block; margin: 20px 0; font-weight: bold; }
              .button:hover { background: #dc2626; }
              .button-container { text-align: center; }
              .deadline { background: #fef3c7; border: 1px solid #fcd34d; padding: 12px; border-radius: 6px; color: #92400e; font-weight: 600; margin: 20px 0; }
              .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>❌ Payment Failed</h1>
              </div>

              <div class="content">
                <p>Hi ${name},</p>

                <div class="alert-box">
                  <div class="alert-title">⚠️ Payment Timeout</div>
                  <p style="margin: 10px 0 0 0; color: #7f1d1d;">${reason}</p>
                </div>

                <p>Your subscription activation is on hold. To activate your ${planDisplay} plan and start using Replysys, please complete the payment.</p>

                <div class="plan-details">
                  <div class="plan-row">
                    <span class="plan-label">Plan:</span>
                    <span class="plan-value">${planDisplay}</span>
                  </div>
                  <div class="plan-row">
                    <span class="plan-label">Amount Due:</span>
                    <span class="amount">₹${amount?.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div class="deadline">
                  ⏰ Complete payment by ${paymentDeadline?.toLocaleDateString('en-IN')} to keep your plan reserved.
                </div>

                <div class="button-container">
                  <a href="${retryLink}" class="button">Retry Payment Now</a>
                </div>

                <h3 style="color: #374151; margin-top: 30px;">What Happens Next?</h3>
                <ul style="color: #666; line-height: 1.8;">
                  <li>✅ Click "Retry Payment" to complete your subscription</li>
                  <li>✅ Once payment is successful, all features will be immediately activated</li>
                  <li>❌ If payment is not completed within 24 hours, your plan reservation will be cancelled</li>
                </ul>

                <p style="margin-top: 30px; color: #999;">
                  <strong>Need help?</strong> Our support team is here to assist. Reply to this email or contact us at support@replysys.com
                </p>
              </div>

              <div class="footer">
                <p>© ${new Date().getFullYear()} Replysys. All rights reserved.</p>
                <p>This is an automated message, please do not reply with sensitive information.</p>
              </div>
            </div>
          </body>
        </html>
      `;

      await sendViaZepto(
        email,
        '❌ Payment Failed - Please Retry',
        htmlbody
      );

      console.log('✅ Payment failed email sent to', email);
      return { success: true };
    } catch (error) {
      console.error('❌ Payment failed email failed:', error.message);
      if (error.response?.data) {
        console.error('  Response:', error.response.data);
      }
      return { success: false, error: error.message };
    }
  }
};
