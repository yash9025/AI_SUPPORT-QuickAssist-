import { useRef, useState } from "react";
import ChatWindow from "./ChatWindow";
import AICopilot from "./AICopilot";

const MainChat = () => {
  const chatRef = useRef(null);
  const [conversation, setConversation] = useState({
    messages: [],       // Chat messages between user and agent
    aiResponses: [],    // Logged AI copilot Q&A pairs
  });

  // Adds a new user message to the conversation
  const sendMessage = (message) => {
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const newMessage = { sender: "user", text: message, time };
    setConversation((prev) => ({
      ...prev,
      messages: [...prev.messages, newMessage],
    }));
  };

  // Handles AI copilot response generation and logs it in conversation
  const getAIResponse = async (question) => {
    await new Promise((r) => setTimeout(r, 1000)); 

    const answer = `AI says: This is a reply to "${question}"`;
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    setConversation((prev) => ({
      messages: [...prev.messages, { sender: "agent", text: answer, time }],
      aiResponses: [...prev.aiResponses, { question, answer }],
    }));
  };

  // Allows AI copilot to copy a suggestion into the input box
  const handleCopyToInput = (text) => {
    if (chatRef.current) {
      chatRef.current.setInputValue(text);
    }
  };

  return (
    <div className="flex h-screen w-full">
      <ChatWindow
        ref={chatRef}
        conversation={conversation}
        sendMessage={sendMessage}
      />
      <AICopilot
        conversation={conversation}
        getAIResponse={getAIResponse}
        onCopy={handleCopyToInput}
      />
    </div>
  );
};

export default MainChat;
