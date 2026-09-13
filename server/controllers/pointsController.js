import User from '../models/User.js';
import PointTransaction from '../models/PointTransaction.js';

/**
 * @desc    Get user's point balance and transactions
 * @route   GET /api/points
 * @access  Private
 */
export const getPointsBalance = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('points totalPointsEarned totalPointsSpent');
    
    res.status(200).json({
      success: true,
      data: {
        currentBalance: user.points,
        totalEarned: user.totalPointsEarned,
        totalSpent: user.totalPointsSpent
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user's point transaction history
 * @route   GET /api/points/transactions
 * @access  Private
 */
export const getPointTransactions = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, type } = req.query;
    
    const query = { user: req.user.id };
    if (type) {
      query.type = type;
    }

    const transactions = await PointTransaction.find(query)
      .populate('relatedSession', 'scheduledDate status')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await PointTransaction.countDocuments(query);

    res.status(200).json({
      success: true,
      data: transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Purchase points
 * @route   POST /api/points/purchase
 * @access  Private
 */
export const purchasePoints = async (req, res, next) => {
  try {
    const { amount, paymentId } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid point amount'
      });
    }

    // Verify payment (in real app, integrate with payment gateway)
    if (!paymentId) {
      return res.status(400).json({
        success: false,
        message: 'Payment ID required'
      });
    }

    const user = await User.findById(req.user.id);
    
    // Update user points
    user.points += amount;
    user.totalPointsEarned += amount;
    await user.save();

    // Create transaction record
    await PointTransaction.create({
      user: req.user.id,
      type: 'purchased',
      amount,
      description: `Purchased ${amount} points`,
      paymentId,
      balanceAfter: user.points
    });

    res.status(200).json({
      success: true,
      message: `Successfully purchased ${amount} points`,
      data: {
        newBalance: user.points
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Deduct points (internal use)
 * @access  Private - Called by other controllers
 */
export const deductPoints = async (userId, amount, description, sessionId = null) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error('User not found');
  }

  if (user.points < amount) {
    throw new Error('Insufficient points');
  }

  // Deduct points
  user.points -= amount;
  user.totalPointsSpent += amount;
  await user.save();

  // Create transaction record
  await PointTransaction.create({
    user: userId,
    type: 'spent',
    amount,
    description,
    relatedSession: sessionId,
    balanceAfter: user.points
  });

  return user.points;
};

/**
 * @desc    Add points (internal use - for rewards, refunds, etc.)
 * @access  Private - Called by other controllers
 */
export const addPoints = async (userId, amount, type, description, sessionId = null) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error('User not found');
  }

  // Add points
  user.points += amount;
  if (type === 'earned' || type === 'bonus') {
    user.totalPointsEarned += amount;
  }
  await user.save();

  // Create transaction record
  await PointTransaction.create({
    user: userId,
    type,
    amount,
    description,
    relatedSession: sessionId,
    balanceAfter: user.points
  });

  return user.points;
};

/**
 * @desc    Get point pricing packages
 * @route   GET /api/points/packages
 * @access  Public
 */
export const getPointPackages = async (req, res, next) => {
  try {
    const packages = [
      { points: 50, price: 4.99, bonus: 0, popular: false },
      { points: 100, price: 9.99, bonus: 10, popular: false },
      { points: 250, price: 19.99, bonus: 50, popular: true },
      { points: 500, price: 34.99, bonus: 100, popular: false },
      { points: 1000, price: 59.99, bonus: 250, popular: false }
    ];

    res.status(200).json({
      success: true,
      data: packages
    });
  } catch (error) {
    next(error);
  }
};
