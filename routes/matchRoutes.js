import express from 'express';
import {
  findPotentialMatches,
  getMatchRecommendations,
  sendMatchRequest,
  getReceivedRequests,
  getSentRequests,
  respondToRequest,
  cancelRequest
} from '../controllers/matchController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.get('/find', findPotentialMatches);
router.get('/recommendations', getMatchRecommendations);
router.post('/request', sendMatchRequest);
router.get('/received', getReceivedRequests);
router.get('/sent', getSentRequests);
router.put('/:id/respond', respondToRequest);
router.put('/:id/cancel', cancelRequest);

export default router;
