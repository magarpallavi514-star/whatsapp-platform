import jwt from 'jsonwebtoken';
import { Server } from 'socket.io';
import { JWT_SECRET } from '../config/jwt.js';

/**
 * Initialize Socket.io for real-time chat
 * Handles WebSocket connections, authentication, and event broadcasting
 */
export const initSocketIO = (server) => {
  
  const io = new Server(server, {
    cors: {
      origin: [
        'http://localhost:3000',
        'https://whatsapp-platform-nine.vercel.app',
        'https://mpiyush15-whatsapp-platform.vercel.app'
      ].filter(Boolean),
      credentials: true,
    },
  });

  // Authentication middleware for WebSocket
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    console.log('\n🔐 Socket Auth Verification:');
    console.log('  Token exists:', !!token);
    console.log('  Token length:', token?.length || 0);
    console.log('  Token starts:', token?.substring(0, 20) || 'none');
    console.log('  JWT_SECRET configured:', !!JWT_SECRET);
    console.log('  JWT_SECRET length:', JWT_SECRET.length);
    console.log('  JWT_SECRET matches expected:', JWT_SECRET === process.env.JWT_SECRET);
    
    if (!token) {
      console.error('  ❌ No token provided');
      return next(new Error('Authentication error'));
    }

    try {
      const cleanToken = token.replace('Bearer ', '');
      console.log('  Clean token length:', cleanToken.length);
      console.log('  Attempting verification with SECRET of length:', JWT_SECRET.length);
      
      const decoded = jwt.verify(cleanToken, JWT_SECRET);
      console.log('  ✅ Token verified successfully');
      console.log('  Token email:', decoded.email);
      console.log('  Token accountId:', decoded.accountId);
      
      socket.userId = decoded.accountId;
      socket.email = decoded.email;
      socket.accountId = decoded.accountId;
      next();
    } catch (error) {
      console.error('  ❌ JWT Verification FAILED:');
      console.error('    Error:', error.message);
      console.error('    Error Code:', error.code);
      console.error('    Error Name:', error.name);
      if (error.name === 'JsonWebTokenError') {
        console.error('    This is a signature verification error');
        console.error('    Likely cause: JWT_SECRET mismatch between token creation and verification');
      }
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
