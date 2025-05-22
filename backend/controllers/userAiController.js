import { CohereClient } from "cohere-ai";
import dotenv from "dotenv";
dotenv.config();

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY,
});

const replyCounts = new Map();
const inProgressReplies = new Set();

export const canUserReply = (conversationId) => {
  const count = replyCounts.get(conversationId) || 0;
  return count < 5;
};

// Pure function to generate reply (used internally)
export const generateUserReply = async (conversationId, agentMessage) => {
  if (!canUserReply(conversationId)) return null;
  if (inProgressReplies.has(conversationId)) return null;

  try {
    inProgressReplies.add(conversationId);

    const prompt = `Imagine you're a customer chatting with a support agent. 
The agent just said: "${agentMessage}" 
Now, respond as the user in a natural, casual tone.`;

    const response = await cohere.generate({
      model: "command-r-plus",
      prompt,
      max_tokens: 60,
      temperature: 0.7,
    });

    const userReply = response.generations[0].text.trim();
    replyCounts.set(conversationId, (replyCounts.get(conversationId) || 0) + 1);

    return userReply;
  } catch (error) {
    console.error("Cohere error:", error);
    return null;
  } finally {
    inProgressReplies.delete(conversationId);
  }
};

// Express route handler that uses generateUserReply
export const handleGenerateUserReply = async (req, res) => {
  const { conversationId, agentMessage } = req.body;

  if (!conversationId || !agentMessage) {
    return res.status(400).json({ message: 'conversationId and agentMessage are required' });
  }

  const reply = await generateUserReply(conversationId, agentMessage);

  if (!reply) {
    return res.status(429).json({ message: 'User reply limit reached or reply in progress' });
  }

  res.json({ reply });
};
