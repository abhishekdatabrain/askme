const { Server } = require('socket.io');
const ChatMessageModel = require('../models/ChatMessageModel');

let io = null;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    // 1. JOIN SESSION ROOM: live_session_{session_id}
    socket.on('join_session', async ({ sessionId, userType, userId, userName }) => {
      if (!sessionId) return;
      const roomName = `live_session_${sessionId}`;
      socket.join(roomName);
      console.log(`[Socket.IO] Socket ${socket.id} joined room: ${roomName}`);

      // Send recent chat history to newly joined client
      try {
        const history = await ChatMessageModel.findAll({
          where: { session_id: sessionId, is_deleted: false },
          order: [['created_at', 'ASC']],
          limit: 100,
        });

        socket.emit('chat_history', {
          sessionId,
          messages: history.map(m => ({
            id: m.id,
            sessionId: m.session_id,
            senderType: m.sender_type,
            senderId: m.sender_id,
            senderName: m.sender_name || (m.sender_type === 'creator' ? 'Creator Host' : 'Viewer'),
            donationId: m.donation_id,
            message: m.message,
            messageType: m.message_type,
            createdAt: m.created_at || m.createdAt,
          })),
        });
      } catch (err) {
        console.error('[Socket.IO] Error fetching chat history:', err.message);
      }
    });

    // 2. LEAVE SESSION ROOM
    socket.on('leave_session', ({ sessionId }) => {
      if (!sessionId) return;
      const roomName = `live_session_${sessionId}`;
      socket.leave(roomName);
      console.log(`[Socket.IO] Socket ${socket.id} left room: ${roomName}`);
    });

    // 3. SEND NORMAL CHAT MESSAGE
    socket.on('send_message', async ({ sessionId, senderType, senderId, senderName, message }) => {
      if (!sessionId || !message || !message.trim()) return;

      const roomName = `live_session_${sessionId}`;

      try {
        const savedMsg = await ChatMessageModel.create({
          session_id: sessionId,
          sender_type: senderType || 'viewer',
          sender_id: senderId || 0,
          sender_name: senderName || (senderType === 'creator' ? 'Creator Host' : 'Viewer'),
          donation_id: null,
          message: message.trim(),
          message_type: 'chat',
          is_deleted: false,
        });

        const formattedMsg = {
          id: savedMsg.id,
          sessionId: savedMsg.session_id,
          senderType: savedMsg.sender_type,
          senderId: savedMsg.sender_id,
          senderName: savedMsg.sender_name,
          donationId: null,
          message: savedMsg.message,
          messageType: 'chat',
          createdAt: savedMsg.created_at || new Date(),
        };

        // Broadcast to all clients in live_session_{session_id}
        io.to(roomName).emit('new_message', formattedMsg);
      } catch (err) {
        console.error('[Socket.IO] Error saving chat message:', err.message);
        socket.emit('chat_error', { message: 'Failed to send message' });
      }
    });

    // 4. CREATOR REPLIES TO A DONATION (donation_reply)
    socket.on('send_donation_reply', async ({ sessionId, senderId, senderName, donationId, message }) => {
      if (!sessionId || !donationId || !message || !message.trim()) return;

      const roomName = `live_session_${sessionId}`;

      try {
        const replyMsg = await ChatMessageModel.create({
          session_id: sessionId,
          sender_type: 'creator',
          sender_id: senderId || 1,
          sender_name: senderName || 'Creator Host',
          donation_id: donationId,
          message: message.trim(),
          message_type: 'donation_reply',
          is_deleted: false,
        });

        const formattedReply = {
          id: replyMsg.id,
          sessionId: replyMsg.session_id,
          senderType: 'creator',
          senderId: replyMsg.sender_id,
          senderName: replyMsg.sender_name,
          donationId: replyMsg.donation_id,
          message: replyMsg.message,
          messageType: 'donation_reply',
          createdAt: replyMsg.created_at || new Date(),
        };

        // Broadcast reply to room
        io.to(roomName).emit('donation_replied', formattedReply);
        io.to(roomName).emit('new_message', formattedReply);
      } catch (err) {
        console.error('[Socket.IO] Error saving donation reply:', err.message);
        socket.emit('chat_error', { message: 'Failed to send donation reply' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    console.warn('[Socket.IO] Warning: io instance requested before initialization');
  }
  return io;
};

module.exports = {
  initSocket,
  getIO,
};
