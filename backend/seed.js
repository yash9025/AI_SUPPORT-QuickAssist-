import mongoose from "mongoose"
import dotenv from "dotenv"
import Conversation from "./models/Conversation.js"

dotenv.config()

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err))

// Sample data
const sampleConversations = [
  {
    customer: {
      name: "Luis Easton",
      email: "luis.easton@example.com",
    },
    source: "GitHub",
    messages: [
      {
        sender: "customer",
        text: "I bought a product from your store in November as a Christmas gift for a member of my family. However, it turns out they have something very similar already. I was hoping you'd be able to refund me, as it is un-opened.",
        time: "30m",
      },
      {
        sender: "agent",
        text: "Let me just look into this for you, Luis.",
        time: "1m",
      },
    ],
    lastMessage: "Let me just look into this for you, Luis.",
    lastMessageTime: "1m",
    unread: false,
  },
  {
    customer: {
      name: "Ivan",
      email: "ivan@example.com",
    },
    source: "Nike",
    messages: [
      {
        sender: "customer",
        text: "Hi there, I have a question about my recent order.",
        time: "30m",
      },
    ],
    lastMessage: "Hi there, I have a question about my recent order.",
    lastMessageTime: "30m",
    unread: true,
  },
  {
    customer: {
      name: "Lead from New York",
      email: "lead@example.com",
    },
    source: "Website",
    messages: [
      {
        sender: "customer",
        text: "Good morning, let me know about your services.",
        time: "40m",
      },
    ],
    lastMessage: "Good morning, let me know about your services.",
    lastMessageTime: "40m",
    unread: false,
  },
  {
    customer: {
      name: "Luis",
      email: "luis@example.com",
    },
    source: "Small Crafts",
    messages: [
      {
        sender: "customer",
        text: "Bug report",
        time: "45m",
      },
    ],
    lastMessage: "Bug report",
    lastMessageTime: "45m",
    unread: false,
  },
  {
    customer: {
      name: "Miracle",
      email: "miracle@example.com",
    },
    source: "Exemplary Bank",
    messages: [
      {
        sender: "customer",
        text: "Hey there, I'm here to discuss my account.",
        time: "45m",
      },
    ],
    lastMessage: "Hey there, I'm here to discuss my account.",
    lastMessageTime: "45m",
    unread: false,
  },
]

// Seed the database
const seedDatabase = async () => {
  try {
    // Clear existing data
    await Conversation.deleteMany({})

    // Insert sample data
    await Conversation.insertMany(sampleConversations)

    console.log("Database seeded successfully")
    mongoose.connection.close()
  } catch (error) {
    console.error("Error seeding database:", error)
    mongoose.connection.close()
  }
}

seedDatabase()
