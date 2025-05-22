import { CohereClient } from "cohere-ai";
import dotenv from "dotenv";
dotenv.config();

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY,
});

const replyCounts = new Map(); // Map<conversationId, number>
const inProgressReplies = new Set(); // Set<conversationId>

const canUserReply = (conversationId) => {
  const count = replyCounts.get(conversationId) || 0;
  return count < 5;
};

const generateUserReply = async (conversationId, agentMessage) => {
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

    const text = response.generations?.[0]?.text?.trim();

    if (!text) return null;

    // Only increment count after successful reply
    const currentCount = replyCounts.get(conversationId) || 0;
    if (currentCount >= 3) return null;

    replyCounts.set(conversationId, currentCount + 1);
    return text;
  } catch (error) {
    console.error("Cohere error:", error);
    return null;
  } finally {
    inProgressReplies.delete(conversationId);
  }
};

const handleGenerateUserReply = async (req, res) => {
  const { conversationId, agentMessage } = req.body;

  if (!conversationId || !agentMessage) {
    return res.status(400).json({ message: 'conversationId and agentMessage are required' });
  }

  const reply = await generateUserReply(conversationId, agentMessage);

  if (!reply) {
    return res.status(429).json({ message: 'User reply limit reached, already replying, or generation failed' });
  }

  res.json({ reply });
};

export {
  canUserReply,
  generateUserReply,
  handleGenerateUserReply
};