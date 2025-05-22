import express from "express";
import {
  getAIResponse,
  humanizeText,
  rephraseText,
  makeMoreFriendly,
  makeMoreFormal,
  fixGrammar,
} from "../controllers/aiController.js";

const router = express.Router();

router.post("/response", getAIResponse);
router.post("/humanize", humanizeText);
router.post("/rephrase", rephraseText);
router.post("/more-friendly", makeMoreFriendly);
router.post("/more-formal", makeMoreFormal);
router.post("/fix-grammar", fixGrammar);

export default router;
