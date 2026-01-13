import { CohereClient } from "cohere-ai";
import Conversation from "../models/Conversation.js";

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY,
});

const COHERE_MODEL = "command-r-plus-08-2024";

// Helper for single-turn text transformations
const transformText = async (text, instruction, temp = 0.3) => {
  try {
    const response = await cohere.chat({
      model: COHERE_MODEL,
      message: text,
      preamble: `${instruction} Return ONLY the processed text. Do not add quotes or intro.`,
      temperature: temp,
    });
    return response.text.trim();
  } catch (error) {
    throw new Error(`Cohere API Error: ${error.message}`);
  }
};

const getAIResponse = async (req, res) => {
  try {
    const { conversationId, question } = req.body;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return res.status(404).json({ message: "Conversation not found" });

    // Map MongoDB messages to Cohere history format
    const chatHistory = conversation.messages.map((msg) => ({
      role: msg.sender === "customer" ? "USER" : "CHATBOT",
      message: msg.text,
    }));

    const response = await cohere.chat({
      model: COHERE_MODEL,
      message: question,
      chatHistory,
      preamble: "You are 'QuickAssist', an expert support agent. Be concise, accurate, and polite. If unsure, ask clarifying questions. Do not hallucinate.",
      temperature: 0.3,
    });

    const aiResponse = response.text.trim();

    conversation.aiResponses = conversation.aiResponses || [];
    conversation.aiResponses.push({ question, answer: aiResponse });
    await conversation.save();

    res.status(200).json({ response: aiResponse });
  } catch (error) {
    console.error("AI Response Error:", error);
    res.status(500).json({ message: error.message });
  }
};

const humanizeText = async (req, res) => {
  try {
    const result = await transformText(
      req.body.text,
      "Rewrite to sound like a warm, empathetic, and natural human support agent.",
      0.7
    );
    res.status(200).json({ humanizedText: result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const rephraseText = async (req, res) => {
  try {
    const result = await transformText(
      req.body.text,
      "Rephrase to be clearer and more concise while maintaining a professional tone.",
      0.5
    );
    res.status(200).json({ rephrasedText: result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const makeMoreFriendly = async (req, res) => {
  try {
    const result = await transformText(
      req.body.text,
      "Rewrite to be noticeably friendlier and more inviting using positive language.",
      0.7
    );
    res.status(200).json({ friendlyText: result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const makeMoreFormal = async (req, res) => {
  try {
    const result = await transformText(
      req.body.text,
      "Rewrite to be strictly formal, professional, and business-appropriate.",
      0.2
    );
    res.status(200).json({ formalText: result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const fixGrammar = async (req, res) => {
  try {
    const result = await transformText(
      req.body.text,
      "Strictly correct grammar, spelling, and punctuation. Do not change tone or style.",
      0.0
    );
    res.status(200).json({ correctedText: result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  getAIResponse,
  humanizeText,
  rephraseText,
  makeMoreFriendly,
  makeMoreFormal,
  fixGrammar,
};