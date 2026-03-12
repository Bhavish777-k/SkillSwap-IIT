import express from 'express';
import {
  createReview,
  getUserReviews,
  getReview,
  updateReview,
  respondToReview,
  deleteReview
} from '../controllers/reviewController.js';
import { protect, optionalAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/user/:userId', getUserReviews);
router.get('/:id', getReview);

// Protected routes
router.post('/', protect, createReview);
router.put('/:id', protect, updateReview);
router.put('/:id/respond', protect, respondToReview);
router.delete('/:id', protect, deleteReview);

export default router;
