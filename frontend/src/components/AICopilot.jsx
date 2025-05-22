import { useState, useEffect, useRef } from "react"

const AICopilot = ({ conversation, getAIResponse, onCopy }) => {
  const [question, setQuestion] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [aiSuggestions] = useState([
    "How do I get a refund?",
    "What is the return policy?",
    "How long does shipping take?",
  ])
  const [isOpen, setIsOpen] = useState(false)
  const scrollRef = useRef(null)

  const scrollToBottom = () => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [conversation?.aiResponses])

  const handleSubmitQuestion = async (e) => {
    e.preventDefault()
    if (!question.trim()) return
    setIsLoading(true)
    await getAIResponse(question)
    setQuestion("")
    setIsLoading(false)
    scrollToBottom()  // scroll after sending question
  }

  const handleSuggestionClick = async (suggestion) => {
    setIsLoading(true)
    await getAIResponse(suggestion)
    setIsLoading(false)
    scrollToBottom()  // scroll after clicking suggestion
  }

  // Pass AI answer to parent to copy into chat input (not AI Copilot's input)
  const handleCopyToInput = (text) => {
    onCopy?.(text)
  }

  return (
    <div className="w-80 bg-white border-l border-gray-200 h-screen flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-2 bg-gradient-to-r from-black via-gray-900 to-gray-800 text-cyan-400 px-4 py-1.5 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.7)] animate-pulse">
          <svg className="h-5 w-5 text-cyan-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.868v4.264a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-semibold tracking-wide text-sm">AI Copilot</span>
        </div>

        {/* Icons */}
        <div className="flex items-center">
          <button className="text-gray-500 hover:text-gray-700 mx-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
          </button>
          <button className="relative group text-gray-500 hover:text-gray-700 mx-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            <div className="absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-300 bg-white border border-gray-300 shadow-lg rounded-md px-3 py-2 text-sm text-gray-800 z-50 max-w-xs" role="tooltip">
              FinAI
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-l border-t border-gray-300 rotate-45" aria-hidden="true" />
            </div>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex items-center justify-center mb-4">
          <div className="w-10 h-10 bg-black rounded-md flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
        </div>
        <h3 className="text-center font-medium mb-1">Hi, I'm AI Copilot</h3>
        <p className="text-center text-sm text-gray-500 mb-6">Ask me anything about this conversation.</p>

        {conversation?.aiResponses?.map((response, index) => (
          <div key={index} className="mb-4">
            <p className="text-sm text-gray-700 mb-2">{response.question}</p>
            <div className="bg-gray-100 p-3 rounded-lg text-sm flex justify-between items-start">
              <div>{response.answer}</div>
              <button onClick={() => handleCopyToInput(response.answer)} className="ml-4 text-gray-500 hover:text-gray-700" title="Copy answer to chat input">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8 2a2 2 0 00-2 2v1H5a2 2 0 00-2 2v9a2 2 0 002 2h7a2 2 0 002-2v-1h1a2 2 0 002-2V8a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H8zM7 4a1 1 0 012 0v1H7V4zm6 10H7v-1h6v1zm0-3H7v-1h6v1z" />
                </svg>
              </button>
            </div>
          </div>
        ))}

        <div ref={scrollRef} />

        {isLoading && (
          <div className="relative flex items-center justify-center py-6">
            <div className="absolute inset-0 mx-4 rounded-lg bg-gradient-to-br from-purple-100 via-indigo-100 to-blue-100 backdrop-blur-sm border border-purple-200 shadow-lg z-0" />
            <div className="relative z-10 flex flex-col items-center space-y-3">
              <div className="flex space-x-2">
                <span className="w-3 h-3 rounded-full bg-purple-500 animate-bounce [animation-delay:-0.3s]" />
                <span className="w-3 h-3 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.15s]" />
                <span className="w-3 h-3 rounded-full bg-blue-500 animate-bounce" />
              </div>
              <span className="text-sm text-gray-700 font-medium animate-pulse">AI Copilot is thinking...</span>
            </div>
          </div>
        )}
      </div>

      {/* Suggested and input */}
      <div className="border-t border-gray-200 p-4">
        <div className="mb-4 max-w-md mx-auto px-2">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex justify-between items-center text-sm font-medium text-gray-700 mb-2 cursor-pointer"
          >
            Suggested
            <svg
              className={`h-5 w-5 text-gray-600 transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <div
            className={`overflow-hidden border rounded-md bg-white shadow-sm transition-[max-height,opacity] duration-300 ease-in-out ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              }`}
          >
            {aiSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="block w-full text-left p-2 rounded-md hover:bg-gray-100 text-sm mb-1 cursor-pointer"
              >
                <span className="text-yellow-400 mr-2">💡</span> {suggestion}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmitQuestion}>
          <div className="relative">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question..."
              className="w-full border border-gray-300 rounded-md py-2 pl-3 pr-10"
            />
            <button type="submit" disabled={isLoading} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AICopilot
