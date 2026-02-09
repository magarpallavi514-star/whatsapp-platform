import app from './src/app.js';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5050;
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://pixelsagency:Pm02072023@pixelsagency.664wxw1.mongodb.net/pixelswhatsapp';

// Create HTTP server
const httpServer = createServer(app);

// Setup Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
  });

// Start server
httpServer.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════╗
║  🚀 SERVER STARTED SUCCESSFULLY       ║
╠═══════════════════════════════════════╣
║  Port: ${PORT.toString().padEnd(33)} ║
║  Environment: ${(process.env.NODE_ENV || 'development').padEnd(20)} ║
║  Timestamp: ${new Date().toISOString().padEnd(18)} ║
╚═══════════════════════════════════════╝
  `);
});

// Handle server errors
httpServer.on('error', (err) => {
  console.error('❌ Server error:', err);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});
