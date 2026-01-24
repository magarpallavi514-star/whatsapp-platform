import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';

// Import middleware
import { authenticate } from './middlewares/auth.js';
import { requireJWT } from './middlewares/jwtAuth.js';
import requireSubscription from './middlewares/requireSubscription.js';

// Import routes
import webhookRoutes from './routes/webhookRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import conversationRoutes from './routes/conversationRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import accountRoutes from './routes/accountRoutes.js';
import templateRoutes from './routes/templateRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import chatbotRoutes from './routes/chatbotRoutes.js';
import authRoutes from './routes/authRoutes.js';
import integrationsRoutes from './routes/integrationsRoutes.js';
import broadcastRoutes from './routes/broadcastRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import campaignRoutes from './routes/campaignRoutes.js';
import pricingRoutes from './routes/pricingRoutes.js';
import subscriptionRoutes from './routes/subscriptionRoutes.js';
import billingRoutes from './routes/billingRoutes.js';
import paymentWebhookRoutes from './routes/paymentWebhookRoutes.js';
import organizationsRoutes from './routes/organizationsRoutes.js';
import leadRoutes from './routes/leadRoutes.js';
import paymentReminderRoutes from './routes/paymentReminderRoutes.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:3002',
  'https://whatsapp-platform-nine.vercel.app',
  'https://mpiyush15-whatsapp-platform.vercel.app',
  'https://mpiyush15-whatsapp-platform-57rcl0koq-piyushs-projects-5d893f5f.vercel.app',
  'https://mpiyush15-whatsapp-platform-iq3skf8bi-piyushs-projects-5d893f5f.vercel.app',
  'https://replysys.com',
  'https://www.replysys.com',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Development: allow any localhost origin
    if (origin && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
      return callback(null, true);
    }
    
    if (origin && allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else if (!origin) {
      callback(null, true);
    } else {
      console.log('⚠️ CORS rejected origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 200
}));

// JSON and URL-encoded body parsing (JWT is stateless - no session needed)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (uploads)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Basic health check route
app.get('/', (req, res) => {
  res.json({
    message: '🚀 WhatsApp Platform API is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Server is healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Debug endpoint - check JWT validation
app.post('/api/debug/verify-token', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'No token provided',
        authHeader: authHeader ? 'present' : 'missing'
      });
    }
    
    // Import jwt here to verify
    import('jsonwebtoken').then(jwt => {
      const JWT_SECRET = process.env.JWT_SECRET || 'whatsapp-platform-jwt-secret-2026';
      try {
        const decoded = jwt.default.verify(token, JWT_SECRET);
        res.json({
          success: true,
          message: 'Token is valid',
          decoded,
          tokenLength: token.length,
          expiresAt: new Date(decoded.exp * 1000)
        });
      } catch (error) {
        res.status(401).json({
          success: false,
          message: 'Token verification failed',
          error: error.message,
          jwtSecret: JWT_SECRET ? '✅ Set' : '❌ Using default',
          tokenLength: token.length
        });
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Debug error',
      error: error.message
    });
  }
});

// Test database connection endpoint
app.get('/api/test-db', async (req, res) => {
  if (mongoose.connection.readyState === 1) {
    res.json({
      status: 'success',
      message: '✅ Database connected successfully!',
      database: mongoose.connection.name,
      host: mongoose.connection.host,
      collections: await mongoose.connection.db.listCollections().toArray()
    });
  } else {
    res.status(500).json({
      status: 'error',
      message: '❌ Database not connected',
      readyState: mongoose.connection.readyState
    });
  }
});

// Mount webhook routes (NO AUTH - verified by token)
app.use('/api/webhooks', webhookRoutes);

// Mount auth routes (NO AUTH - public login/logout)
app.use('/api/auth', authRoutes);

// Mount settings routes (JWT AUTH only - users need to configure phones even without subscription)
app.use('/api/settings', requireJWT, settingsRoutes);

// Mount dashboard routes (JWT AUTH + SUBSCRIPTION REQUIRED - for logged-in dashboard users)
app.use('/api/templates', requireJWT, requireSubscription, templateRoutes);
app.use('/api/chatbots', requireJWT, requireSubscription, chatbotRoutes);
app.use('/api/messages', requireJWT, requireSubscription, messageRoutes);
app.use('/api/conversations', requireJWT, requireSubscription, conversationRoutes);
app.use('/api/contacts', requireJWT, requireSubscription, contactRoutes);
app.use('/api/broadcasts', requireJWT, requireSubscription, broadcastRoutes);
app.use('/api/campaigns', requireJWT, requireSubscription, campaignRoutes);
app.use('/api/notifications', requireJWT, notificationRoutes); // Notifications accessible without subscription

// Mount pricing routes (PUBLIC for public plans, JWT AUTH for admin)
app.use('/api/pricing', pricingRoutes);

// Mount subscription routes (JWT AUTH for user subscriptions)
app.use('/api/subscriptions', requireJWT, subscriptionRoutes);

// Mount payment webhook routes (PUBLIC for Cashfree webhooks, JWT AUTH for status checks)
app.use('/api/payments', paymentWebhookRoutes);

// Mount billing routes (JWT AUTH for billing and invoices)
app.use('/api/billing', requireJWT, billingRoutes);

// Mount self-service account routes (JWT AUTH - for dashboard users)
app.use('/api/account', requireJWT, accountRoutes);

// Mount organizations admin routes (JWT AUTH - for admin)
app.use('/api/admin/organizations', requireJWT, organizationsRoutes);

// Mount payment reminder routes (JWT AUTH - for admin)
app.use('/api/admin/payment-reminders', requireJWT, paymentReminderRoutes);

// Mount integration routes (INTEGRATION TOKEN AUTH - for Enromatics, third-party apps)
app.use('/api/integrations', integrationsRoutes);

// Leads management (with JWT and subscription)
app.use('/api/leads', requireJWT, requireSubscription, leadRoutes);

// Mount API routes (API KEY AUTH - for external integrations only)
app.use('/api/stats', authenticate, statsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Setup Socket.io for controllers
export const setupSocketIO = (io) => {
  const { setSocketIO: setWebhookSocketIO } = webhookRoutes;
  const { setSocketIO: setMessageSocketIO } = messageRoutes;
  
  // Pass io instance to webhook controller
  import('./controllers/webhookController.js').then(module => {
    module.setSocketIO(io);
  });
  
  // Pass io instance to message controller
  import('./controllers/messageController.js').then(module => {
    module.setSocketIO(io);
  });
};

export default app;
