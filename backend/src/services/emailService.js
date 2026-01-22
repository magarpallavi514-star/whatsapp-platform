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
  }
};
