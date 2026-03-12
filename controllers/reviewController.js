import Review from '../models/Review.js';
import Session from '../models/Session.js';
import User from '../models/User.js';

/**
 * @desc    Create review
 * @route   POST /api/reviews
 * @access  Private
 */
export const createReview = async (req, res, next) => {
  try {
    const {
      sessionId,
      revieweeId,
      rating,
      comment,
      categories
    } = req.body;

    // Verify session exists and is completed
    const session = await Session.findById(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    if (session.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only review completed sessions'
      });
    }

    // Verify user was part of the session
    const isLearner = session.learner.toString() === req.user.id;
    const isMentor = session.mentor.toString() === req.user.id;

    if (!isLearner && !isMentor) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to review this session'
      });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({
      session: sessionId,
      reviewer: req.user.id
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this session'
      });
    }

    // Create review
    const review = await Review.create({
      session: sessionId,
      reviewer: req.user.id,
      reviewee: revieweeId,
      rating,
      comment,
      categories
    });

    // Update user's rating
    await updateUserRating(revieweeId);

    const populatedReview = await Review.findById(review._id)
      .populate('reviewer', 'name avatar')
      .populate('reviewee', 'name avatar')
      .populate('session');

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: populatedReview
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get reviews for a user
 * @route   GET /api/reviews/user/:userId
 * @access  Public
 */
export const getUserReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({
      reviewee: req.params.userId,
      isPublic: true
    })
      .populate('reviewer', 'name avatar')
      .populate('session', 'scheduledDate')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single review
 * @route   GET /api/reviews/:id
 * @access  Public
 */
export const getReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('reviewer', 'name avatar')
      .populate('reviewee', 'name avatar')
      .populate('session');

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.status(200).json({
      success: true,
      data: review
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update review
 * @route   PUT /api/reviews/:id
 * @access  Private
 */
export const updateReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Verify user is the reviewer
    if (review.reviewer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this review'
      });
    }

    // Update allowed fields
    const allowedFields = ['rating', 'comment', 'categories', 'isPublic'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        review[field] = req.body[field];
      }
    });

    await review.save();

    // Update user rating if rating changed
    if (req.body.rating !== undefined) {
      await updateUserRating(review.reviewee);
    }

    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      data: review
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Respond to review
 * @route   PUT /api/reviews/:id/respond
 * @access  Private
 */
export const respondToReview = async (req, res, next) => {
  try {
    const { response } = req.body;

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Verify user is the reviewee
    if (review.reviewee.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to respond to this review'
      });
    }

    review.response = response;
    review.respondedAt = new Date();
    await review.save();

    res.status(200).json({
      success: true,
      message: 'Response added successfully',
      data: review
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete review
 * @route   DELETE /api/reviews/:id
 * @access  Private
 */
export const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Verify user is the reviewer or admin
    if (review.reviewer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this review'
      });
    }

    const revieweeId = review.reviewee;
    await review.deleteOne();

    // Update user rating
    await updateUserRating(revieweeId);

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Helper function to update user's average rating
 */
const updateUserRating = async (userId) => {
  const reviews = await Review.find({ reviewee: userId });

  if (reviews.length === 0) {
    await User.findByIdAndUpdate(userId, {
      'rating.average': 0,
      'rating.count': 0
    });
    return;
  }

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = totalRating / reviews.length;

  await User.findByIdAndUpdate(userId, {
    'rating.average': averageRating.toFixed(2),
    'rating.count': reviews.length
  });
};
