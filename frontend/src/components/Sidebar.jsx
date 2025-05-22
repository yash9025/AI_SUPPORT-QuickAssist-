import { useState } from "react";

const Sidebar = ({ conversations, activeConversation, setActiveConversation }) => {
  const [readConversations, setReadConversations] = useState(new Set());

  // Mark conversation as active and read
  const handleConversationClick = (conversation) => {
    setActiveConversation(conversation);
    setReadConversations((prev) => new Set(prev).add(conversation._id));
  };

  return (
    <div className="w-72 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-semibold">Your inbox</h1>
      </div>

      {/* Filters/Sort UI */}
      <div className="flex items-center px-4 py-2 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">5 Open</span>
          <svg
            className="h-4 w-4 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        <div className="ml-auto flex items-center space-x-2">
          <span className="text-sm font-medium">Waiting longest</span>
          <svg
            className="h-4 w-4 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Conversation List */}
      <div className="overflow-y-auto flex-1">
        {conversations.map((conversation) => {
          const isRead = readConversations.has(conversation._id);
          const isActive = activeConversation?._id === conversation._id;

          return (
            <div
              key={conversation._id}
              onClick={() => handleConversationClick(conversation)}
              className={`p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer ${
                isActive ? "bg-[#eef1ff]" : ""
              }`}
            >
              <div className="flex items-start">
                {/* Avatar or system icon */}
                {conversation.isSystem ? (
                  <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-white flex-shrink-0">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-800 font-medium flex-shrink-0">
                    {conversation.customer.name.charAt(0).toUpperCase()}
                  </div>
                )}

                {/* Conversation Info */}
                <div className="ml-3 flex-1 min-w-0">
                  <div className="flex items-center min-w-0">
                    <p
                      className={`text-sm truncate min-w-0 ${
                        isRead ? "text-gray-900 font-normal" : "text-black font-semibold"
                      }`}
                    >
                      {conversation.customer.name} · {conversation.source}
                      {conversation.company && (
                        <span className="text-gray-500"> · {conversation.company}</span>
                      )}
                    </p>
                  </div>
                  <p
                    className={`text-sm truncate ${
                      isRead ? "text-gray-500 font-normal" : "text-black font-semibold"
                    }`}
                  >
                    {conversation.lastMessage}
                  </p>
                </div>
              </div>

              {/* Priority label if available */}
              {conversation.priority && (
                <div className="mt-1 ml-11">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                    {conversation.priority}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;
