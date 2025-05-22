import Conversation from "../models/Conversation.js";
import { generateUserReply } from './userAiController.js'; 

const getAllConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find().sort({ updatedAt: -1 });
    res.status(200).json(conversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getConversationById = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) return res.status(404).json({ message: "Conversation not found" });
    res.status(200).json(conversation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new conversation document
const createConversation = async (req, res) => {
  const conversation = new Conversation({
    customer: req.body.customer,
    source: req.body.source,
    messages: req.body.messages || [],
    lastMessage: req.body.lastMessage || "",
    lastMessageTime: req.body.lastMessageTime || new Date(),
    unread: req.body.unread ?? true,
  });

  try {
    const newConversation = await conversation.save();
    res.status(201).json(newConversation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Add a new message to an existing conversation
// If sender is agent, generate and add AI reply as customer message
const addMessageToConversation = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) return res.status(404).json({ message: "Conversation not found" });

    const { sender, text } = req.body;
    if (!sender || !text) return res.status(400).json({ message: "sender and text are required" });

    const message = {
      sender,
      text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    conversation.messages.push(message);
    conversation.lastMessage = text;
    conversation.lastMessageTime = new Date();

    if (sender === "customer") {
      conversation.unread = true; 
    }

    await conversation.save();

    if (sender === "agent") {
      // Generate AI reply and append as customer message
      const aiReplyText = await generateUserReply(conversation._id.toString(), text);
      if (aiReplyText) {
        const aiMessage = {
          sender: "customer",
          text: aiReplyText,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        conversation.messages.push(aiMessage);
        conversation.lastMessage = aiReplyText;
        conversation.lastMessageTime = new Date();
        conversation.unread = false; 
        await conversation.save();
      }
    }

    res.status(200).json(conversation);
  } catch (error) {
    console.error("Error in addMessageToConversation:", error);
    res.status(400).json({ message: error.message });
  }
};

// Mark a conversation as read by setting unread flag to false
const markConversationAsRead = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) return res.status(404).json({ message: "Conversation not found" });

    conversation.unread = false;
    const updatedConversation = await conversation.save();
    res.status(200).json(updatedConversation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export {
  getAllConversations,
  getConversationById,
  createConversation,
  addMessageToConversation,
  markConversationAsRead,
};
