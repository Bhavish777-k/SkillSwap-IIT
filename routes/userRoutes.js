import express from 'express';
import {
  getUsers,
  getUser,
  updateProfile,
  deleteAccount,
  getDashboard
} from '../controllers/userController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getUsers);
router.get('/:id', getUser);

// Protected routes
router.get('/dashboard/stats', protect, getDashboard);
router.put('/profile', protect, updateProfile);
router.delete('/account', protect, deleteAccount);

export default router;
