import express from 'express';
import {
  createSession,
  getSessions,
  getSession,
  updateSession,
  completeSession,
  cancelSession
} from '../controllers/sessionController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.post('/', createSession);
router.get('/', getSessions);
router.get('/:id', getSession);
router.put('/:id', updateSession);
router.put('/:id/complete', completeSession);
router.put('/:id/cancel', cancelSession);

export default router;
