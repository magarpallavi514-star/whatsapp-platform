import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Import middleware
import { authenticate } from './middlewares/auth.js';
import { authenticateAdmin } from './middlewares/adminAuth.js';

// Import routes
import webhookRoutes from './routes/webhookRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import conversationRoutes from './routes/conversationRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import adminAccountRoutes from './routes/adminAccountRoutes.js';
import accountRoutes from './routes/accountRoutes.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
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

// Mount admin routes (ADMIN AUTH required)
app.use('/api/admin/accounts', authenticateAdmin, adminAccountRoutes);

// Mount self-service account routes (ACCOUNT AUTH required)
app.use('/api/account', authenticate, accountRoutes);

// Mount API routes (PROTECTED by API key authentication)
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
