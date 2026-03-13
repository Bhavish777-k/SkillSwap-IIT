import express from 'express';
import {
  getAdminStats,
  getAllUsers,
  blockUser,
  unblockUser,
  grantPremium,
  deleteUser,
  getAdminLogs
} from '../controllers/adminController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All routes require admin authentication
router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.put('/users/:id/block', blockUser);
router.put('/users/:id/unblock', unblockUser);
router.put('/users/:id/grant-premium', grantPremium);
router.delete('/users/:id', deleteUser);
router.get('/logs', getAdminLogs);

export default router;
