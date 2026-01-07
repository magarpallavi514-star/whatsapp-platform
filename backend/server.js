import app, { setupSocketIO } from './src/app.js';
import connectDB from './src/config/database.js';
import { initSocketIO } from './src/services/socketService.js';
import http from 'http';

// Get port from environment
const PORT = process.env.PORT || 5050;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io for real-time chat
const io = initSocketIO(server);
app.io = io; // Make io available to controllers/routes

// Setup Socket.io for controllers (pass io instance)
setupSocketIO(io);

// Start server function
const startServer = async () => {
  try {
    // Connect to MongoDB
    console.log('🔄 Connecting to MongoDB...');
    await connectDB();
    
    // Start server with Socket.io
    server.listen(PORT, () => {
      console.log('='.repeat(50));
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📍 Local: http://localhost:${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔌 WebSocket (Socket.io) enabled for real-time chat`);
      console.log('='.repeat(50));
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();
