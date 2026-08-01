import { Server } from 'socket.io';
import { Queue } from 'bullmq';
import { redisConfig } from '../config/redis.js';
import Conversation from '../models/Conversation.js';
import { checkSentimentEscalation } from '../services/sentimentService.js';

// Setup BullMQ Queue for AI processing
export const aiProcessingQueue = new Queue('ai-processing', { connection: redisConfig });

let io;

export const initSockets = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*', // Adjust to specific origin in production
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Join a conversation room
    socket.on('join_conversation', (conversationId) => {
      socket.join(conversationId);
      console.log(`Socket ${socket.id} joined conversation ${conversationId}`);
    });

    // Handle new message from client
    socket.on('send_message', async (data) => {
      const { conversationId, sender, text } = data;
      
      try {
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) return;

        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const message = { sender, text, time };
        
        conversation.messages.push(message);
        conversation.lastMessage = text;
        conversation.lastMessageTime = new Date();
        conversation.unread = sender === 'customer';

        await conversation.save();

        // Broadcast message to everyone in the room
        io.to(conversationId).emit('receive_message', message);

        if (sender === 'customer') {
          // Check for emotion/sentiment escalation
          const escalation = await checkSentimentEscalation(text);
          if (escalation.escalate) {
             const systemMessage = {
               sender: 'system',
               text: escalation.reply,
               time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
               escalated: true
             };
             conversation.messages.push(systemMessage);
             conversation.lastMessage = systemMessage.text;
             conversation.lastMessageTime = new Date();
             await conversation.save();
             io.to(conversationId).emit('receive_message', systemMessage);
             io.to(conversationId).emit('escalation_alert', { conversationId, reason: escalation.reason });
          } else {
             // Enqueue for AI bot processing if not escalated
             await aiProcessingQueue.add('generate-reply', {
               conversationId,
               text
             });
          }
        } else if (sender === 'agent') {
            // If the agent replied directly, we could generate the AI customer reply mock
             await aiProcessingQueue.add('generate-customer-reply', {
               conversationId,
               text
             });
        }
      } catch (err) {
        console.error('Socket send_message error:', err);
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};
