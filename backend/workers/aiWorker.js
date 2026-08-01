import { Worker } from 'bullmq';
import { redisConfig } from '../config/redis.js';
import { CohereClient } from 'cohere-ai';
import Conversation from '../models/Conversation.js';
import { getIO } from '../sockets/index.js';
import { generateUserReply } from '../controllers/userAiController.js'; 

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY,
});
const COHERE_MODEL = "command-r-plus-08-2024";

// Dedicated worker for handling AI generation asynchronously
export const startAiWorker = () => {
  const worker = new Worker('ai-processing', async (job) => {
    const { conversationId, text } = job.data;
    
    if (job.name === 'generate-reply') {
      try {
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) return;

        // Construct history
        const chatHistory = conversation.messages
          .filter(msg => msg.sender !== 'system') // exclude system messages
          .map((msg) => ({
            role: msg.sender === 'customer' ? 'USER' : 'CHATBOT',
            message: msg.text,
          }));

        // AI Request
        const response = await cohere.chat({
          model: COHERE_MODEL,
          message: text,
          chatHistory,
          preamble: "You are 'QuickAssist', an expert customer support agent for a leading delivery platform. Be empathetic, proactive, and concise. You have the authority to process standard requests.",
          temperature: 0.3,
        });

        const aiResponse = response.text.trim();
        
        // Emitting suggested AI reply back to the agent UI via WebSockets
        const io = getIO();
        io.to(conversationId).emit('ai_suggestion_ready', {
          conversationId,
          suggestion: aiResponse
        });

      } catch (error) {
        console.error('Error generating AI reply in worker:', error);
      }
    } else if (job.name === 'generate-customer-reply') {
       try {
          const aiReplyText = await generateUserReply(conversationId, text);
          if (aiReplyText) {
             const conversation = await Conversation.findById(conversationId);
             if (conversation) {
               const aiMessage = {
                 sender: "customer",
                 text: aiReplyText,
                 time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
               };
               conversation.messages.push(aiMessage);
               conversation.lastMessage = aiReplyText;
               conversation.lastMessageTime = new Date();
               conversation.unread = true; // because the 'customer' replied
               await conversation.save();
               
               const io = getIO();
               io.to(conversationId).emit('receive_message', aiMessage);
             }
          }
       } catch (err) {
          console.error('Error generating mock customer reply in worker:', err);
       }
    }

  }, { connection: redisConfig });

  worker.on('completed', job => {
    console.log(`Job ${job.id} has completed!`);
  });

  worker.on('failed', (job, err) => {
    console.error(`Job ${job.id} has failed with ${err.message}`);
  });

  console.log('AI Worker started successfully.');
};
