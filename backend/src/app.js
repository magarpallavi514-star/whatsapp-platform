import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Import middleware
import { authenticate } from './middlewares/auth.js';
import { requireJWT } from './middlewares/jwtAuth.js';

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

// Mount dashboard routes (JWT AUTH - for logged-in dashboard users)
app.use('/api/settings', requireJWT, settingsRoutes);
app.use('/api/templates', requireJWT, templateRoutes);
app.use('/api/chatbots', requireJWT, chatbotRoutes);
app.use('/api/messages', requireJWT, messageRoutes);
app.use('/api/conversations', requireJWT, conversationRoutes);
app.use('/api/contacts', requireJWT, contactRoutes);
app.use('/api/broadcasts', requireJWT, broadcastRoutes);
app.use('/api/campaigns', requireJWT, campaignRoutes);
app.use('/api/notifications', requireJWT, notificationRoutes);

// Mount self-service account routes (JWT AUTH - for dashboard users)
app.use('/api/account', requireJWT, accountRoutes);

// Mount integration routes (INTEGRATION TOKEN AUTH - for Enromatics, third-party apps)
app.use('/api/integrations', integrationsRoutes);

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
