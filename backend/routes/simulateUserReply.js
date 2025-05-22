import express from 'express';
import { handleGenerateUserReply } from '../controllers/userAiController.js';

const router = express.Router();

router.post('/', handleGenerateUserReply);

export default router;
