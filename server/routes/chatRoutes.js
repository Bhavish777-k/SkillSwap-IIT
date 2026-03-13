import express from 'express';
import {
  getOrCreateChat,
  getChats,
  getChat,
  sendMessage,
  deleteChat
} from '../controllers/chatController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.post('/', getOrCreateChat);
router.get('/', getChats);
router.get('/:id', getChat);
router.post('/:id/messages', sendMessage);
router.delete('/:id', deleteChat);

export default router;
