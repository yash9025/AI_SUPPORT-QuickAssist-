import express from "express";
import dotenv from "dotenv";
dotenv.config();

import {
  getAllConversations,
  getConversationById,
  createConversation,
  addMessageToConversation,
  markConversationAsRead,
} from "../controllers/conversationController.js";

const router = express.Router();

router.get("/", getAllConversations);
router.get("/:id", getConversationById);
router.post("/", createConversation);
router.post("/:id/messages", addMessageToConversation);
router.patch("/:id/read", markConversationAsRead);

export default router;
