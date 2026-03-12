import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import {
  getPointsBalance,
  getPointTransactions,
  purchasePoints,
  getPointPackages
} from '../controllers/pointsController.js';

const router = express.Router();

// Public routes
router.get('/packages', getPointPackages);

// Protected routes
router.use(protect);

router.get('/', getPointsBalance);
router.get('/transactions', getPointTransactions);
router.post('/purchase', purchasePoints);

export default router;
