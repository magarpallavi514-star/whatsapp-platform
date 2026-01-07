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

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  'https://whatsapp-platform-nine.vercel.app',
  'https://mpiyush15-whatsapp-platform.vercel.app',
  'https://mpiyush15-whatsapp-platform.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
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

// Mount self-service account routes (ACCOUNT AUTH required)
app.use('/api/account', authenticate, accountRoutes);

// Mount API routes (API KEY AUTH - for external apps like Enromatics)
app.use('/api/messages', authenticate, messageRoutes);
app.use('/api/conversations', authenticate, conversationRoutes);
app.use('/api/contacts', authenticate, contactRoutes);
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

export default app;
