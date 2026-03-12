import User from '../models/User.js';
import MatchRequest from '../models/MatchRequest.js';
import Session from '../models/Session.js';
import Review from '../models/Review.js';
import Skill from '../models/Skill.js';
import AdminAction from '../models/AdminAction.js';

/**
 * @desc    Get admin dashboard stats
 * @route   GET /api/admin/stats
 * @access  Private (Admin)
 */
export const getAdminStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalSkills,
      totalMatches,
      totalSessions,
      totalReviews,
      blockedUsers,
      premiumUsers,
      recentUsers
    ] = await Promise.all([
      User.countDocuments(),
      Skill.countDocuments(),
      MatchRequest.countDocuments(),
      Session.countDocuments(),
      Review.countDocuments(),
      User.countDocuments({ isBlocked: true }),
      User.countDocuments({ isPremium: true }),
      User.find().sort({ createdAt: -1 }).limit(5).select('name email createdAt')
    ]);

    // Get match statistics
    const matchStats = await MatchRequest.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get session statistics
    const sessionStats = await Session.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalSkills,
          totalMatches,
          totalSessions,
          totalReviews,
          blockedUsers,
          premiumUsers
        },
        matchStats,
        sessionStats,
        recentUsers
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all users (admin view)
 * @route   GET /api/admin/users
 * @access  Private (Admin)
 */
export const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, isBlocked, isPremium } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (isBlocked !== undefined) {
      query.isBlocked = isBlocked === 'true';
    }

    if (isPremium !== undefined) {
      query.isPremium = isPremium === 'true';
    }

    const users = await User.find(query)
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      count: users.length,
      total: count,
      pages: Math.ceil(count / limit),
      data: users
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Block user
 * @route   PUT /api/admin/users/:id/block
 * @access  Private (Admin)
 */
export const blockUser = async (req, res, next) => {
  try {
    const { reason } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot block admin users'
      });
    }

    user.isBlocked = true;
    user.blockedReason = reason || 'Violated platform policies';
    await user.save();

    // Log admin action
    await AdminAction.create({
      admin: req.user.id,
      actionType: 'block_user',
      targetModel: 'User',
      targetId: user._id,
      reason: reason || 'Violated platform policies',
      previousState: { isBlocked: false }
    });

    res.status(200).json({
      success: true,
      message: 'User blocked successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Unblock user
 * @route   PUT /api/admin/users/:id/unblock
 * @access  Private (Admin)
 */
export const unblockUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isBlocked = false;
    user.blockedReason = undefined;
    await user.save();

    // Log admin action
    await AdminAction.create({
      admin: req.user.id,
      actionType: 'unblock_user',
      targetModel: 'User',
      targetId: user._id,
      reason: 'Account reinstated',
      previousState: { isBlocked: true }
    });

    res.status(200).json({
      success: true,
      message: 'User unblocked successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Grant premium to user
 * @route   PUT /api/admin/users/:id/grant-premium
 * @access  Private (Admin)
 */
export const grantPremium = async (req, res, next) => {
  try {
    const { duration = 30 } = req.body; // duration in days

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + duration);

    user.isPremium = true;
    user.premiumExpiry = expiryDate;
    await user.save();

    // Log admin action
    await AdminAction.create({
      admin: req.user.id,
      actionType: 'grant_premium',
      targetModel: 'User',
      targetId: user._id,
      reason: `Premium granted for ${duration} days`,
      notes: `Expiry: ${expiryDate.toISOString()}`
    });

    res.status(200).json({
      success: true,
      message: 'Premium granted successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete user
 * @route   DELETE /api/admin/users/:id
 * @access  Private (Admin)
 */
export const deleteUser = async (req, res, next) => {
  try {
    const { reason } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete admin users'
      });
    }

    // Log admin action before deletion
    await AdminAction.create({
      admin: req.user.id,
      actionType: 'delete_user',
      targetModel: 'User',
      targetId: user._id,
      reason: reason || 'Account terminated by admin',
      previousState: user.toObject()
    });

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get admin action logs
 * @route   GET /api/admin/logs
 * @access  Private (Admin)
 */
export const getAdminLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, actionType } = req.query;

    const query = {};
    if (actionType) {
      query.actionType = actionType;
    }

    const logs = await AdminAction.find(query)
      .populate('admin', 'name email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await AdminAction.countDocuments(query);

    res.status(200).json({
      success: true,
      count: logs.length,
      total: count,
      pages: Math.ceil(count / limit),
      data: logs
    });
  } catch (error) {
    next(error);
  }
};
