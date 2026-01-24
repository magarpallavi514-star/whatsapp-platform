import app, { setupSocketIO } from './src/app.js';
import connectDB from './src/config/database.js';
import { initSocketIO } from './src/services/socketService.js';
import { startPaymentTimeoutScheduler } from './src/schedulers/paymentTimeoutScheduler.js';
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

// ✅ Add health check endpoint for Socket.io connections
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    socketConnections: io.engine.clientsCount,
    environment: process.env.NODE_ENV || 'development'
  });
});

// ✅ Add Socket.io stats endpoint for debugging
app.get('/socket-stats', (req, res) => {
  const sockets = io.sockets.sockets;
  const stats = {
    totalConnections: sockets.size,
    connections: Array.from(sockets.values()).map(socket => ({
      id: socket.id,
      userId: socket.userId,
      email: socket.email,
      transport: socket.conn?.transport?.name,
      connected: socket.connected,
      connectedAt: socket.handshake.issued
    }))
  };
  res.json(stats);
});

// Start server function
const startServer = async () => {
  try {
    // Connect to MongoDB
    console.log('🔄 Connecting to MongoDB...');
    await connectDB();
    
    // Start payment timeout scheduler
    startPaymentTimeoutScheduler();
    
    // Start server with Socket.io
    server.listen(PORT, () => {
      console.log('='.repeat(50));
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📍 Local: http://localhost:${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔌 WebSocket (Socket.io) enabled for real-time chat`);
      console.log(`📊 Health check: GET /health`);
      console.log(`📊 Socket stats: GET /socket-stats`);
      console.log('='.repeat(50));
    });
    
    // ✅ Graceful shutdown handler
    process.on('SIGTERM', () => {
      console.log('SIGTERM received, closing server gracefully...');
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();
