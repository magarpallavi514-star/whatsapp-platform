import app from './src/app.js';
import connectDB from './src/config/database.js';
import { initSocketIO } from './src/services/socketService.js';
import { setSocketIO } from './src/controllers/webhookController.js';
import http from 'http';

const PORT = process.env.PORT || 5050;

// Initialize database and start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Create HTTP server
    const server = http.createServer(app);

    // Initialize Socket.io
    const io = initSocketIO(server);

    // Pass Socket.io instance to webhook controller
    setSocketIO(io);

    // Start server
    server.listen(PORT, () => {
      console.log(`\n✅ Server running on port ${PORT}`);
      console.log(`📡 WebSocket (Socket.io) enabled for real-time updates`);
      console.log(`🔗 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌍 Frontend URL: ${process.env.FRONTEND_URL || 'Not configured'}`);
      console.log(`\n═══════════════════════════════════════════\n`);
    });

    // Graceful shutdown handlers
    process.on('SIGTERM', () => {
      console.log('\n🛑 SIGTERM signal received: closing HTTP server');
      server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('\n🛑 SIGINT signal received: closing HTTP server');
      server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

// Start the server
startServer();
