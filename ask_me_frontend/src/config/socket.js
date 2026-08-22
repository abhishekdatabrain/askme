import { io } from 'socket.io-client';
import { SOCKET_URL } from './api';

let socket = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: true,
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('[Socket.IO Frontend] Connected to server:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('[Socket.IO Frontend] Disconnected from server');
    });
  }
  return socket;
};
