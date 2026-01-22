import axios from 'axios';
import crypto from 'crypto';

const CASHFREE_API_KEY = process.env.CASHFREE_SECRET_KEY;
const CASHFREE_CLIENT_ID = process.env.CASHFREE_CLIENT_ID;
const CASHFREE_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.cashfree.com/pg'
  : 'https://sandbox.cashfree.com/pg';

export const cashfreeService = {
  // Create payment order
  createOrder: async (orderData) => {
    try {
      console.log('📝 Creating Cashfree order:', {
        orderId: orderData.orderId,
        amount: orderData.amount,
        customerEmail: orderData.email
      });

      const response = await axios.post(
        `${CASHFREE_BASE_URL}/orders`,
        {
          order_id: orderData.orderId,
          order_amount: orderData.amount,
          order_currency: 'INR',
          customer_details: {
            customer_id: orderData.customerId,
            customer_email: orderData.email,
            customer_phone: orderData.phone || '9999999999'
          },
          order_meta: {
            notify_url: `${process.env.BACKEND_URL}/api/payment/webhook/confirm`,
            return_url: `${process.env.FRONTEND_URL}/payment-success?order_id=${orderData.orderId}`,
            payment_methods: 'upi,netbanking,wallet,card'
          },
          order_note: orderData.description || 'Pixels WhatsApp Subscription'
        },
        {
          headers: {
            'X-Client-Id': CASHFREE_CLIENT_ID,
            'X-Client-Secret': CASHFREE_API_KEY,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ Cashfree order created:', response.data.order_id);
      
      return {
        success: true,
        orderId: response.data.order_id,
        paymentSessionId: response.data.payment_session_id,
        redirectUrl: response.data.payment_url,
        cfOrderId: response.data.cf_order_id
      };
    } catch (error) {
      console.error('❌ Cashfree order creation failed:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  },

  // Get order status
  getOrderStatus: async (orderId) => {
    try {
      console.log('🔍 Fetching order status for:', orderId);

      const response = await axios.get(
        `${CASHFREE_BASE_URL}/orders/${orderId}`,
        {
          headers: {
            'X-Client-Id': CASHFREE_CLIENT_ID,
            'X-Client-Secret': CASHFREE_API_KEY,
            'Content-Type': 'application/json'
          }
        }
      );

      const orderData = response.data;
      console.log('Order status response:', orderData);

      // Get payment details if available
      let paymentData = null;
      if (orderData.order_status === 'PAID' && orderData.payments?.length > 0) {
        paymentData = orderData.payments[0];
      }

      return {
        success: true,
        status: orderData.order_status,
        amount: orderData.order_amount,
        paymentStatus: paymentData?.payment_status || null,
        paymentId: paymentData?.cf_payment_id || null,
        cfOrderId: orderData.cf_order_id
      };
    } catch (error) {
      console.error('❌ Order status fetch failed:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  },

  // Verify webhook signature
  verifyWebhookSignature: (signature, body) => {
    try {
      // Cashfree sends signature in x-webhook-signature header
      // Create HMAC SHA-256 of the body
      const computedSignature = crypto
        .createHmac('sha256', CASHFREE_API_KEY)
        .update(JSON.stringify(body))
        .digest('hex');

      const isValid = computedSignature === signature;
      console.log('🔐 Webhook signature verification:', isValid ? '✅ Valid' : '❌ Invalid');
      
      return isValid;
    } catch (error) {
      console.error('❌ Webhook verification failed:', error.message);
      return false;
    }
  },

  // Refund payment
  refundPayment: async (orderId, paymentId, refundAmount) => {
    try {
      console.log('💰 Processing refund:', { orderId, paymentId, refundAmount });

      const refundId = `REFUND-${Date.now()}`;
      
      const response = await axios.post(
        `${CASHFREE_BASE_URL}/orders/${orderId}/payments/${paymentId}/refunds`,
        {
          refund_id: refundId,
          refund_amount: refundAmount,
          refund_note: 'Customer requested refund'
        },
        {
          headers: {
            'X-Client-Id': CASHFREE_CLIENT_ID,
            'X-Client-Secret': CASHFREE_API_KEY,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ Refund processed:', response.data);
      
      return {
        success: true,
        refundId: response.data.refund_id,
        status: response.data.refund_status
      };
    } catch (error) {
      console.error('❌ Refund failed:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  },

  // Get refund status
  getRefundStatus: async (orderId, refundId) => {
    try {
      const response = await axios.get(
        `${CASHFREE_BASE_URL}/orders/${orderId}/refunds/${refundId}`,
        {
          headers: {
            'X-Client-Id': CASHFREE_CLIENT_ID,
            'X-Client-Secret': CASHFREE_API_KEY,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        status: response.data.refund_status,
        amount: response.data.refund_amount
      };
    } catch (error) {
      console.error('❌ Refund status fetch failed:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  }
};
