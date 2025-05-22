import { useState, useEffect, useRef } from "react";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import AICopilot from "../components/AICopilot";
import axios from "axios";

const BACKEND_URI = import.meta.env.VITE_BACKEND_URI;

const Dashboard = () => {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showAICopilot, setShowAICopilot] = useState(false);

  const chatWindowRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0); 
    fetchConversations();
  }, []);

  // Fetch conversations
  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_URI}/api/conversations`);
      if (response?.data?.length) {
        setConversations(response.data);
        setActiveConversation(response.data[0]);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  // Send message and optimistically update UI before backend confirmation
  const sendMessage = async (text, sender = "agent") => {
    if (!activeConversation) {
      console.warn("No active conversation to send message");
      return;
    }

    const newMessage = {
      sender,
      text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setActiveConversation((prev) => {
      if (!prev) return prev;
      const updatedMessages = [...(prev.messages ?? []), newMessage];
      const updatedConv = { ...prev, messages: updatedMessages };

      setConversations((prevConvs) =>
        prevConvs.map((conv) => (conv._id === updatedConv._id ? updatedConv : conv))
      );

      return updatedConv;
    });

    try {
      const response = await axios.post(
        `${BACKEND_URI}/api/conversations/${activeConversation._id}/messages`,
        { sender, text }
      );

      const updatedConversation = response.data;

      // Merge backend messages with local state to avoid duplicates
      const mergeMessages = (existing = [], incoming = []) => {
        const merged = [...existing];
        incoming.forEach((msg) => {
          if (!existing.some((m) => m.sender === msg.sender && m.text === msg.text && m.time === msg.time)) {
            merged.push(msg);
          }
        });
        return merged;
      };

      setActiveConversation((prev) =>
        prev && prev._id === updatedConversation._id
          ? { ...prev, messages: mergeMessages(prev.messages, updatedConversation.messages) }
          : prev
      );

      setConversations((prevConvs) =>
        prevConvs.map((conv) =>
          conv._id === updatedConversation._id
            ? { ...conv, messages: mergeMessages(conv.messages, updatedConversation.messages) }
            : conv
        )
      );
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Request AI response and update conversation state
  const getAIResponse = async (question) => {
    if (!activeConversation) {
      console.warn("No active conversation to get AI response");
      return;
    }

    try {
      const response = await axios.post(`${BACKEND_URI}/api/ai/response`, {
        conversationId: activeConversation._id,
        question,
      });

      setActiveConversation((prev) => ({
        ...prev,
        aiResponses: [...(prev?.aiResponses ?? []), { question, answer: response.data.response }],
      }));

      return response.data.response;
    } catch (error) {
      console.error("Error getting AI response:", error);
    }
  };

  // Copy text from AI Copilot to chat input
const handleCopyToInput = (text) => {
  if (chatWindowRef.current) {
    chatWindowRef.current.setInputValue(text);
  }
  setShowSidebar(false); 
  setShowAICopilot(false); 
};


  // On conversation change, close sidebar and AI Copilot for better UX
  const handleSetActiveConversation = (conv) => {
    setActiveConversation(conv);
    setShowSidebar(false);
    setShowAICopilot(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-gray-600">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
        <p>Loading conversations...</p>
      </div>
    );
  }

  if (!conversations.length) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        No conversations found.
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-30 w-72 bg-white border-r border-gray-200 flex flex-col
          transform transition-transform duration-300 ease-in-out
          md:static md:translate-x-0 md:flex-shrink-0
          ${showSidebar ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <Sidebar
          conversations={conversations}
          activeConversation={activeConversation}
          setActiveConversation={handleSetActiveConversation}
        />
      </div>

      {showSidebar && (
        <div
          className="fixed inset-0 bg-black bg-opacity-25 z-20 md:hidden"
          onClick={() => setShowSidebar(false)}
          aria-hidden="true"
        />
      )}

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0 relative overflow-hidden">
        {/* Top bar for mobile */}
        <div className="flex items-center justify-between p-2 bg-white border-b border-gray-200 md:hidden">
          <button
            onClick={() => setShowSidebar(true)}
            className="p-2 rounded-md hover:bg-gray-100"
            aria-label="Open sidebar"
            aria-expanded={showSidebar}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <span className="font-semibold text-lg">Chat</span>

          <button
            onClick={() => setShowAICopilot(true)}
            className="p-2 rounded-md hover:bg-gray-100"
            aria-label="Open AI Copilot"
            aria-expanded={showAICopilot}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          </button>
        </div>

        {/* ChatWindow container with scrollable area */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          <ChatWindow ref={chatWindowRef} conversation={activeConversation} sendMessage={sendMessage} />
        </div>
      </div>

      {/* AI Copilot */}
      <div
        className={`
          fixed inset-y-0 right-0 z-30 w-80 bg-white border-l border-gray-200 flex flex-col
          transform transition-transform duration-300 ease-in-out
          md:static md:translate-x-0
          ${showAICopilot ? "translate-x-0" : "translate-x-full"}
        `}
      >
        <AICopilot conversation={activeConversation} getAIResponse={getAIResponse} onCopy={handleCopyToInput} />
      </div>

      {showAICopilot && (
        <div
          className="fixed inset-0 bg-black bg-opacity-25 z-20 md:hidden"
          onClick={() => setShowAICopilot(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default Dashboard;
