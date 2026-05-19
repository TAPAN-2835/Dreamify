import { io } from 'socket.io-client';

let socket = null;

export const connectSocket = (token) => {
  if (socket?.connected) return socket;

  socket = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000', {
    auth: { token },
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    transports: ['websocket', 'polling'],
  });

  socket.on('connect', () => {
    console.log('[Socket] Connected:', socket.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('[Socket] Disconnected:', reason);
  });

  socket.on('connect_error', (err) => {
    console.error('[Socket] Connection error:', err.message);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;

export const subscribeToJob = (jobId, callback) => {
  if (!socket) return;
  // Remove existing listener first to prevent duplicates
  socket.off('generation:update');
  socket.on('generation:update', (payload) => {
    if (payload.jobId === jobId) {
      callback(payload);
    }
  });
};

export const unsubscribeFromJob = () => {
  if (socket) socket.off('generation:update');
};
