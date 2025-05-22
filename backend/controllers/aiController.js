import { CohereClient } from "cohere-ai";
import Conversation from "../models/Conversation.js";

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY,
});

// Generate AI response based on conversation history and new customer question
const getAIResponse = async (req, res) => {
  try {
    const { conversationId, question } = req.body;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    // Build prompt with conversation history for context
    const conversationHistory = conversation.messages
      .map(msg => `${msg.sender === "customer" ? "Customer" : "Agent"}: ${msg.text}`)
      .join("\n");

    const prompt = `
You are a helpful customer support assistant. Provide concise, accurate, and helpful responses to customer inquiries.

Conversation History:
${conversationHistory}

Customer: ${question}
Agent:
    `;

    // Generate AI completion from Cohere
    const response = await cohere.generate({
      model: "command-r-plus",
      prompt,
      max_tokens: 500,
      temperature: 0.5,
    });

    const aiResponse = response.generations[0].text.trim();

    // Store the Q&A pair in conversation for future reference
    conversation.aiResponses = conversation.aiResponses || [];
    conversation.aiResponses.push({ question, answer: aiResponse });
    await conversation.save();

    res.status(200).json({ response: aiResponse });
  } catch (error) {
    console.error("Error getting AI response:", error);
    res.status(500).json({ message: error.message });
  }
};

// Rewrites AI-generated text to sound friendly and conversational
const humanizeText = async (req, res) => {
  try {
    const { text } = req.body;

    const prompt = `
You are an assistant that rewrites AI-generated text to sound like a friendly and natural human customer support agent. Keep the same meaning but make it sound more conversational and empathetic.

Original: ${text}
Humanized:
    `;

    const response = await cohere.generate({
      model: "command-r-plus",
      prompt,
      max_tokens: 300,
      temperature: 0.7,
    });

    const humanizedText = response.generations[0].text.trim();

    res.status(200).json({ humanizedText });
  } catch (error) {
    console.error("Error humanizing text:", error);
    res.status(500).json({ message: error.message });
  }
};

// Rephrase text while keeping it professional and clear
const rephraseText = async (req, res) => {
  try {
    const { text } = req.body;

    const prompt = `
Rephrase the following customer support message to say the same thing in a different way, keeping it clear and professional.

Original: ${text}
Rephrased:
    `;

    const response = await cohere.generate({
      model: "command-r-plus",
      prompt,
      max_tokens: 300,
      temperature: 0.7,
    });

    const rephrasedText = response.generations[0].text.trim();

    res.status(200).json({ rephrasedText });
  } catch (error) {
    console.error("Error rephrasing text:", error);
    res.status(500).json({ message: error.message });
  }
};

// Make the customer support message sound warmer and more friendly
const makeMoreFriendly = async (req, res) => {
  try {
    const { text } = req.body;

    const prompt = `
Rewrite the following customer support message to sound more friendly and warm, while keeping the original meaning.

Original: ${text}
More friendly:
    `;

    const response = await cohere.generate({
      model: "command-r-plus",
      prompt,
      max_tokens: 300,
      temperature: 0.7,
    });

    const friendlyText = response.generations[0].text.trim();

    res.status(200).json({ friendlyText });
  } catch (error) {
    console.error("Error making text more friendly:", error);
    res.status(500).json({ message: error.message });
  }
};

// Rewrite text to a more formal tone while retaining original meaning
const makeMoreFormal = async (req, res) => {
  try {
    const { text } = req.body;

    const prompt = `
You are an assistant that rewrites the given text to sound more formal while keeping the original meaning.

Original: ${text}
Formal version:
    `;

    const response = await cohere.generate({
      model: "command-r-plus",
      prompt,
      max_tokens: 300,
      temperature: 0.6,
    });

    const formalText = response.generations[0].text.trim();

    res.status(200).json({ formalText });
  } catch (error) {
    console.error("Error generating formal text:", error);
    res.status(500).json({ message: error.message });
  }
};

// Fix grammar and spelling errors while preserving meaning
const fixGrammar = async (req, res) => {
  try {
    const { text } = req.body;

    const prompt = `
Correct any grammar and spelling mistakes in the following customer support message. Keep the original meaning intact.

Original: ${text}
Corrected:
    `;

    const response = await cohere.generate({
      model: "command-r-plus",
      prompt,
      max_tokens: 300,
      temperature: 0.3,
    });

    const correctedText = response.generations[0].text.trim();

    res.status(200).json({ correctedText });
  } catch (error) {
    console.error("Error fixing grammar and spelling:", error);
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
