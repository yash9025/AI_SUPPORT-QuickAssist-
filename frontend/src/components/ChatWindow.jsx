import axios from "axios";
import {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { BoltIcon, ChatBubbleLeftIcon } from "@heroicons/react/24/outline";

// Chat window component for agent-customer interaction
const ChatWindow = forwardRef(function ChatWindow({ conversation, sendMessage }, ref) {
  const [message, setMessage] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const [loadingOption, setLoadingOption] = useState(null);
  const [loadingDots, setLoadingDots] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef(null);
  const optionsRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.messages]);

  // Auto-resize textarea height based on input
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  // Animate loading dots when AI is processing
  useEffect(() => {
    if (!loadingOption) {
      setLoadingDots("");
      return;
    }
    const interval = setInterval(() => {
      setLoadingDots((dots) => (dots.length >= 3 ? "" : dots + "."));
    }, 500);
    return () => clearInterval(interval);
  }, [loadingOption]);

  // Close options dropdown on outside click
  useEffect(() => {
    if (!showOptions) return;
    const handleClickOutside = (e) => {
      if (optionsRef.current && !optionsRef.current.contains(e.target)) {
        setShowOptions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showOptions]);

  // Allow parent to control message input value
  useImperativeHandle(ref, () => ({
    setInputValue: (text) => setMessage(text),
  }));

  const callAIEndpoint = async (endpoint, inputText) => {
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URI}/api/ai/${endpoint}`,
        { text: inputText }
      );
      switch (endpoint) {
        case "humanize":
          return data.humanizedText;
        case "rephrase":
          return data.rephrasedText;
        case "more-friendly":
          return data.friendlyText;
        case "more-formal":
          return data.formalText;
        case "fix-grammar":
          return data.correctedText;
        default:
          return null;
      }
    } catch (err) {
      console.error(`Error calling ${endpoint}:`, err);
      return null;
    }
  };

  const handleOptionClick = async (option) => {
    if (!message.trim() || loadingOption) return;
    setShowOptions(false);
    setLoadingOption(option);

    const loadingTexts = {
      humanize: "Humanizing",
      rephrase: "Rephrasing",
      "more-friendly": "Making friendly",
      "more-formal": "Making formal",
      "fix-grammar": "Fixing grammar",
    };
    setMessage(loadingTexts[option] || "Processing");

    const aiText = await callAIEndpoint(option, message);

    setLoadingOption(null);
    if (aiText) setMessage(aiText);
    else setMessage("");
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || loadingOption) return;

    const agentMessage = message.trim();

    // Optimistically send agent message
    sendMessage(agentMessage, "agent");
    setMessage("");

    if (!conversation?._id) return;

    try {
      setTimeout(() => {
        setIsTyping(true);
      }, 800);

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URI}/api/simulate-user-reply`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversationId: conversation._id,
            agentMessage,
          }),
        }
      );

      const data = await res.json();

      if (data.reply) {
        setTimeout(() => {
          sendMessage(data.reply, "customer");
          setIsTyping(false);
        }, 1200);
      } else {
        setIsTyping(false);
      }
    } catch (err) {
      console.error("Error getting simulated user reply:", err);
      setIsTyping(false);
    }
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Select a conversation to start chatting</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white h-full">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center">
          <ChatBubbleLeftIcon className="h-5 w-5 text-gray-500" />
          <span className="ml-2 font-medium">Chat</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 ml-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
        {conversation.messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.sender === "agent" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`p-3 rounded-lg break-words max-w-[80%] w-fit ${
                msg.sender === "agent"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-black"
              }`}
            >
              {msg.text.startsWith("http") ? (
                <img
                  src={msg.text}
                  alt="sent content"
                  className="max-w-full h-auto rounded-md"
                />
              ) : (
                <span>{msg.text}</span>
              )}

              {msg.sender === "agent" && (
                <div className="text-xs text-gray-300 mt-1 text-right">
                  Seen · {msg.time}
                </div>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 text-gray-700 px-4 py-2 rounded-2xl text-sm italic shadow-sm flex items-center space-x-2 animate-pulse border border-gray-300">
              <span>Customer is typing</span>
              <span className="dot-flash">
                <span className="dot" />
                <span className="dot" />
                <span className="dot" />
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input and buttons */}
      <div className="border-t border-gray-200 px-4 pt-2 pb-4">
        <form onSubmit={handleSendMessage} className="flex items-end w-full gap-2">
          <div className="relative" ref={optionsRef}>
            <button
              type="button"
              onClick={() => setShowOptions((v) => !v)}
              className="p-2 rounded-full bg-gray-900 hover:bg-gray-700 transition-colors duration-300 ease-in-out"
              disabled={loadingOption !== null}
            >
              <BoltIcon className="h-6 w-6 text-gray-200 hover:text-white hover:scale-110 transition-transform duration-300 ease-in-out cursor-pointer" />
            </button>
            {showOptions && (
              <div className="absolute bottom-10 left-0 bg-white rounded-lg w-48 p-2 shadow-lg z-10">
                {[
                  { key: "rephrase", label: "Rephrase" },
                  { key: "humanize", label: "My tone of voice" },
                  { key: "more-friendly", label: "More friendly" },
                  { key: "more-formal", label: "More formal" },
                  { key: "fix-grammar", label: "Fix grammar & spelling" },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    disabled={loadingOption !== null}
                    className="w-full px-3 py-1 text-left hover:bg-gray-100 rounded text-sm mt-1 cursor-pointer first:mt-0"
                    onClick={() => handleOptionClick(key)}
                  >
                    {loadingOption === key ? `${label}...` : label}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={loadingOption !== null}
                  className="w-full px-3 py-1 text-left hover:bg-gray-100 rounded text-sm mt-1 cursor-pointer"
                  onClick={() => alert("Translate feature not implemented yet")}
                >
                  Translate...
                </button>
              </div>
            )}
          </div>

          <textarea
            ref={textareaRef}
            rows={1}
            className={`flex-1 resize-none border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 leading-snug ${
              loadingOption ? "italic text-blue-600" : ""
            }`}
            placeholder="Type your message..."
            value={loadingOption ? message + loadingDots : message}
            onChange={(e) => {
              if (!loadingOption) setMessage(e.target.value);
            }}
            style={{ minHeight: 40, overflowY: "hidden" }}
            disabled={loadingOption !== null}
          />
          <button
            type="submit"
            className="ml-2 px-4 py-2 text-sm bg-black text-white rounded-full hover:bg-gray-600 cursor-pointer"
            disabled={loadingOption !== null || !message.trim()}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
});

export default ChatWindow;
