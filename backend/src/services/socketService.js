import jwt from 'jsonwebtoken';
import { Server } from 'socket.io';
import { JWT_SECRET } from '../config/jwt.js';

/**
 * Initialize Socket.io for real-time chat
 * Handles WebSocket connections, authentication, and event broadcasting
 */
export const initSocketIO = (server) => {
  
  // ✅ CRITICAL FIX: Configure Socket.io properly for production
  const io = new Server(server, {
    // ✅ Enable both WebSocket and HTTP polling (with polling as fallback)
    transports: ['websocket', 'polling'],
    
    // ✅ Configure HTTP polling to handle intermittent connections
    httpCompression: true,
    pingInterval: 25000,  // Send ping every 25s (default is 25000)
    pingTimeout: 20000,   // Wait 20s for pong response (default is 20000)
    
    // ✅ Allow polling with proper settings
    polling: {
      maxHttpBufferSize: 1e5  // 100KB (default is 1e6)
    },
    
    // ✅ CORS configuration for production
    cors: {
      origin: [
        'http://localhost:3000',
        'https://whatsapp-platform-nine.vercel.app',
        'https://mpiyush15-whatsapp-platform.vercel.app',
        'https://replysys.com',
        'https://www.replysys.com',
        process.env.FRONTEND_URL
      ].filter(Boolean),
      credentials: true,
      methods: ['GET', 'POST']
    },
    
    // ✅ Add connection timeout and upgrade settings
    allowUpgrades: true,
    connectTimeout: 45000,  // 45s to establish connection
  });

  // ✅ CRITICAL FIX: Add connection error handler at server level
  io.engine.on('connection_error', (err) => {
    console.error('❌ Socket.io engine connection error:', {
      code: err.code,
      message: err.message,
      type: err.type
    });
  });

  // Authentication middleware for WebSocket
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    console.log('\n🔐 Socket Auth Verification:');
    console.log('  Transport:', socket.conn?.transport?.name);
    console.log('  Token exists:', !!token);
    console.log('  Token length:', token?.length || 0);
    
    if (!token) {
      console.error('  ❌ No token provided');
      return next(new Error('Authentication error - no token'));
    }

    try {
      const cleanToken = token.replace('Bearer ', '');
      const decoded = jwt.verify(cleanToken, JWT_SECRET);
      console.log('  ✅ Token verified');
      
      socket.userId = decoded.accountId;
      socket.email = decoded.email;
      socket.accountId = decoded.accountId;
      next();
    } catch (error) {
      console.error('  ❌ JWT Verification FAILED:', error.message);
      next(new Error('Invalid token: ' + error.message));
    }
  });

  // Track user's current conversation
  const userConversations = new Map();
  const conversationUsers = new Map();

  io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.id} (${socket.email})`);

    /**
     * Join a specific conversation room
     * Enables real-time updates for that conversation
     */
    socket.on('join_conversation', (data) => {
      const { conversationId } = data;
      if (conversationId) {
        socket.join(`conversation:${conversationId}`);
        userConversations.set(socket.id, conversationId);
        
        // Track which users are in this conversation
        if (!conversationUsers.has(conversationId)) {
          conversationUsers.set(conversationId, new Set());
        }
        conversationUsers.get(conversationId).add(socket.id);
        
        console.log(`📍 User ${socket.email} joined conversation ${conversationId}`);
      }
    });

    /**
     * Leave a conversation room
     */
    socket.on('leave_conversation', (data) => {
      const { conversationId } = data;
      if (conversationId) {
        socket.leave(`conversation:${conversationId}`);
        userConversations.delete(socket.id);
        
        const users = conversationUsers.get(conversationId);
        if (users) {
          users.delete(socket.id);
          if (users.size === 0) {
            conversationUsers.delete(conversationId);
          }
        }
        
        console.log(`📍 User ${socket.email} left conversation ${conversationId}`);
      }
    });

    /**
     * Subscribe to all conversations for the user
     */
    socket.on('subscribe_conversations', () => {
      socket.join(`user:${socket.accountId}`);
      console.log(`📭 User ${socket.email} subscribed to conversations`);
    });

    /**
     * Handle typing indicator
     */
    socket.on('typing', (data) => {
      const { conversationId, isTyping } = data;
      if (conversationId) {
        io.to(`conversation:${conversationId}`).emit('typing', {
          userId: socket.accountId,
          isTyping,
          timestamp: new Date().toISOString(),
        });
      }
    });

    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.id} (${socket.email})`);
      userConversations.delete(socket.id);
    });
  });

  return io;
};

/**
 * Broadcast new message to all users in a conversation
 * Called from webhook or message controller
 */
export const broadcastNewMessage = (io, conversationId, message) => {
  io.to(`conversation:${conversationId}`).emit('new_message', {
    conversationId,
    message,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Broadcast conversation update to all users
 */
export const broadcastConversationUpdate = (io, accountId, conversation) => {
  io.to(`user:${accountId}`).emit('conversation_update', {
    conversation,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Broadcast message status update
 */
export const broadcastMessageStatus = (io, conversationId, messageId, status) => {
  io.to(`conversation:${conversationId}`).emit('message_status', {
    messageId,
    status,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Broadcast phone status change to all users in account
 * Called when phone connection test succeeds/fails
 */
export const broadcastPhoneStatusChange = (io, accountId, phoneNumber) => {
  console.log('📡 Broadcasting phone status change:', {
    accountId,
    phoneNumberId: phoneNumber.phoneNumberId,
    isActive: phoneNumber.isActive,
    qualityRating: phoneNumber.qualityRating
  });
  
  io.to(`user:${accountId}`).emit('phone_status_changed', {
    phoneNumberId: phoneNumber.phoneNumberId,
    isActive: phoneNumber.isActive,
    qualityRating: phoneNumber.qualityRating,
    displayPhoneNumber: phoneNumber.displayPhoneNumber,
    lastTestedAt: phoneNumber.lastTestedAt,
    verifiedName: phoneNumber.verifiedName,
    status: phoneNumber.isActive ? 'ACTIVE' : 'INACTIVE',
    timestamp: new Date().toISOString(),
  });
};
