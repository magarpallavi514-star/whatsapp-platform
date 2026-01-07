import { io, Socket } from 'socket.io-client';
import { authService } from './auth';

let socket: Socket | null = null;

export const initSocket = (): Socket => {
  if (socket?.connected) return socket;

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050';
  const token = authService.getToken();

  socket = io(API_URL, {
    auth: {
      token: `Bearer ${token}`,
    },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  });

  socket.on('connect', () => {
    console.log('✅ Socket connected:', socket?.id);
  });

  socket.on('disconnect', () => {
    console.log('❌ Socket disconnected');
  });

  socket.on('error', (error) => {
    console.error('🔴 Socket error:', error);
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
