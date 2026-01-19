import { io, Socket } from 'socket.io-client';
import { authService } from './auth';

let socket: Socket | null = null;

export const initSocket = (): Socket => {
  if (socket?.connected) {
    console.log('📌 Socket already connected, reusing:', socket?.id);
    return socket;
  }

  // Socket.io connects to the ROOT server, not /api endpoint
  const SOCKET_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050').replace('/api', '');
  const token = authService.getToken();

  console.log('🔌 Socket Init Debug:');
  console.log('  Socket URL:', SOCKET_URL);
  console.log('  Token exists:', !!token);
  console.log('  Token length:', token?.length || 0);
  console.log('  Auth status:', authService.isAuthenticated());

  if (!token) {
    console.warn('⚠️ No authentication token found - socket connection may fail');
  }

  socket = io(SOCKET_URL, {
    auth: {
      token: token ? `Bearer ${token}` : '',
    },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  });

  socket.on('connect', () => {
    console.log('✅ Socket connected:', socket?.id);
    console.log('🔗 Connected to:', SOCKET_URL);
  });

  socket.on('disconnect', () => {
    console.log('❌ Socket disconnected');
  });

  socket.on('error', (error) => {
    console.error('🔴 Socket error:', error);
  });

  socket.on('connect_error', (error) => {
    console.error('🔴 Socket connection error:', error.message);
    console.error('  Error details:', error);
    if (error.message.includes('Invalid token')) {
      console.error('  💡 Token is invalid, corrupted, or was signed with a different secret');
      console.error('  💡 This usually means:');
      console.error('     1. JWT_SECRET on backend changed');
      console.error('     2. Token stored in localStorage is stale');
      console.error('     3. Token was corrupted during transmission');
      console.error('  Solution: Clear localStorage and login again');
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('user');
        console.error('  ✅ Cleared localStorage. Please refresh and login again.');
      }
    }
  });

  return socket;
};

export const getSocket = (): Socket | null => {
  return socket;
};

export const closeSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Socket event listeners
export const onNewMessage = (callback: (data: any) => void) => {
  const sock = getSocket();
  if (sock) {
    sock.on('new_message', callback);
  }
};

export const onConversationUpdate = (callback: (data: any) => void) => {
  const sock = getSocket();
  if (sock) {
    sock.on('conversation_update', callback);
  }
};

export const onTyping = (callback: (data: any) => void) => {
  const sock = getSocket();
  if (sock) {
    sock.on('typing', callback);
  }
};

// Socket event emitters
export const joinConversation = (conversationId: string) => {
  const sock = getSocket();
  if (sock) {
    sock.emit('join_conversation', { conversationId });
  }
};

export const leaveConversation = (conversationId: string) => {
  const sock = getSocket();
  if (sock) {
    sock.emit('leave_conversation', { conversationId });
  }
};

export const emitTyping = (conversationId: string, isTyping: boolean) => {
  const sock = getSocket();
  if (sock) {
    sock.emit('typing', { conversationId, isTyping });
  }
};

export const subscribeToConversations = () => {
  const sock = getSocket();
  if (sock) {
    sock.emit('subscribe_conversations');
  }
};
