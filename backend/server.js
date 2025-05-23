import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

import conversationRoutes from "./routes/conversationRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import simulateUserReplyRoute from "./routes/simulateUserReply.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use("/api/conversations", conversationRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/simulate-user-reply", simulateUserReplyRoute);

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get('/ping', (req, res) => {
  res.status(200).send('pong');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
