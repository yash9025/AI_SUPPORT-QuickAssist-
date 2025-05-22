import mongoose from "mongoose"

const messageSchema = new mongoose.Schema({
  sender: {
    type: String,
    required: true,
    enum: ["customer", "agent", "ai"],
  },
  text: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    default: () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  },
  isHumanized: {
    type: Boolean,
    default: false,
  },
})

const aiResponseSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  answer: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
})

const conversationSchema = new mongoose.Schema(
  {
    customer: {
      name: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
    },
    source: {
      type: String,
      required: true,
    },
    messages: [messageSchema],
    aiResponses: [aiResponseSchema],
    lastMessage: {
      type: String,
      default: "",
    },
    lastMessageTime: {
      type: String,
      default: () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
    unread: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.model("Conversation", conversationSchema)
