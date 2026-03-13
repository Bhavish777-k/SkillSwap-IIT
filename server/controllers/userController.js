import User from '../models/User.js';
import Review from '../models/Review.js';

/**
 * @desc    Get all users (with filters)
 * @route   GET /api/users
 * @access  Public
 */
export const getUsers = async (req, res, next) => {
  try {
    const { search, skill, college, isPremium, page = 1, limit = 10 } = req.query;

    // Build query
    const query = { isBlocked: false };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (skill) {
      query.$or = [
        { skillsOffered: skill },
        { skillsNeeded: skill }
      ];
    }

    if (college) {
      query.college = { $regex: college, $options: 'i' };
    }

    if (isPremium) {
      query.isPremium = isPremium === 'true';
    }

    // Execute query with pagination
    const users = await User.find(query)
      .populate('skillsOffered')
      .populate('skillsNeeded')
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ 'rating.average': -1, createdAt: -1 });

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
 * @desc    Get single user by ID
 * @route   GET /api/users/:id
 * @access  Public
 */
export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('skillsOffered')
      .populate('skillsNeeded')
      .select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user reviews
    const reviews = await Review.find({ reviewee: req.params.id, isPublic: true })
      .populate('reviewer', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        ...user.toObject(),
        reviews
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
export const updateProfile = async (req, res, next) => {
  try {
    const {
      name,
      bio,
      avatar,
      college,
      branch,
      year,
      skillsOffered,
      skillsNeeded,
      availability,
      linkedin,
      github,
      portfolio
    } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update fields
    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (avatar) user.avatar = avatar;
    if (college) user.college = college;
    if (branch) user.branch = branch;
    if (year) user.year = year;
    if (skillsOffered) user.skillsOffered = skillsOffered;
    if (skillsNeeded) user.skillsNeeded = skillsNeeded;
    if (availability) user.availability = availability;
    if (linkedin !== undefined) user.linkedin = linkedin;
    if (github !== undefined) user.github = github;
    if (portfolio !== undefined) user.portfolio = portfolio;

    await user.save();

    const updatedUser = await User.findById(user.id)
      .populate('skillsOffered')
      .populate('skillsNeeded');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete user account
 * @route   DELETE /api/users/account
 * @access  Private
 */
export const deleteAccount = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.user.id);

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user's dashboard stats
 * @route   GET /api/users/dashboard
 * @access  Private
 */
export const getDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Import models here to avoid circular dependencies
    const MatchRequest = (await import('../models/MatchRequest.js')).default;
    const Session = (await import('../models/Session.js')).default;

    // Get stats
    const [
      sentRequests,
      receivedRequests,
      upcomingSessions,
      completedSessions
    ] = await Promise.all([
      MatchRequest.countDocuments({ requester: userId }),
      MatchRequest.countDocuments({ mentor: userId }),
      Session.countDocuments({ 
        $or: [{ learner: userId }, { mentor: userId }],
        status: 'scheduled',
        scheduledDate: { $gte: new Date() }
      }),
      Session.countDocuments({
        $or: [{ learner: userId }, { mentor: userId }],
        status: 'completed'
      })
    ]);

    const user = await User.findById(userId)
      .populate('skillsOffered')
      .populate('skillsNeeded');

    res.status(200).json({
      success: true,
      data: {
        user,
        stats: {
          sentRequests,
          receivedRequests,
          upcomingSessions,
          completedSessions,
          rating: user.rating.average,
          reviewCount: user.rating.count
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
