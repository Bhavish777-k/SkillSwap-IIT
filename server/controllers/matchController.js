import MatchRequest from '../models/MatchRequest.js';
import User from '../models/User.js';
import { findMatches, getRecommendations } from '../utils/matchingAlgorithm.js';

/**
 * @desc    Find potential matches
 * @route   GET /api/matches/find
 * @access  Private
 */
export const findPotentialMatches = async (req, res, next) => {
  try {
    const { skillNeeded, skillOffered, limit } = req.query;

    const matches = await findMatches(req.user.id, {
      skillNeeded,
      skillOffered,
      limit: parseInt(limit) || 20
    });

    res.status(200).json({
      success: true,
      count: matches.length,
      data: matches
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get personalized recommendations
 * @route   GET /api/matches/recommendations
 * @access  Private
 */
export const getMatchRecommendations = async (req, res, next) => {
  try {
    const recommendations = await getRecommendations(req.user.id);

    res.status(200).json({
      success: true,
      count: recommendations.length,
      data: recommendations
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Send match request
 * @route   POST /api/matches/request
 * @access  Private
 */
export const sendMatchRequest = async (req, res, next) => {
  try {
    const { mentorId, skillOffered, skillNeeded, message } = req.body;

    // Validate mentor exists
    const mentor = await User.findById(mentorId);
    if (!mentor) {
      return res.status(404).json({
        success: false,
        message: 'Mentor not found'
      });
    }

    // Check if request already exists
    const existingRequest = await MatchRequest.findOne({
      requester: req.user.id,
      mentor: mentorId,
      status: { $in: ['pending', 'accepted'] }
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active request with this user'
      });
    }

    // Create match request
    const matchRequest = await MatchRequest.create({
      requester: req.user.id,
      mentor: mentorId,
      skillOffered,
      skillNeeded,
      message
    });

    const populatedRequest = await MatchRequest.findById(matchRequest._id)
      .populate('requester', 'name avatar email')
      .populate('mentor', 'name avatar email')
      .populate('skillOffered')
      .populate('skillNeeded');

    res.status(201).json({
      success: true,
      message: 'Match request sent successfully',
      data: populatedRequest
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get received match requests
 * @route   GET /api/matches/received
 * @access  Private
 */
export const getReceivedRequests = async (req, res, next) => {
  try {
    const { status } = req.query;

    const query = { mentor: req.user.id };
    if (status) {
      query.status = status;
    }

    const requests = await MatchRequest.find(query)
      .populate('requester', 'name avatar email rating')
      .populate('skillOffered')
      .populate('skillNeeded')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get sent match requests
 * @route   GET /api/matches/sent
 * @access  Private
 */
export const getSentRequests = async (req, res, next) => {
  try {
    const { status } = req.query;

    const query = { requester: req.user.id };
    if (status) {
      query.status = status;
    }

    const requests = await MatchRequest.find(query)
      .populate('mentor', 'name avatar email rating')
      .populate('skillOffered')
      .populate('skillNeeded')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Respond to match request
 * @route   PUT /api/matches/:id/respond
 * @access  Private
 */
export const respondToRequest = async (req, res, next) => {
  try {
    const { status, responseMessage } = req.body;

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be "accepted" or "rejected"'
      });
    }

    const matchRequest = await MatchRequest.findById(req.params.id);

    if (!matchRequest) {
      return res.status(404).json({
        success: false,
        message: 'Match request not found'
      });
    }

    // Verify user is the mentor
    if (matchRequest.mentor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to respond to this request'
      });
    }

    if (matchRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Request has already been responded to'
      });
    }

    matchRequest.status = status;
    matchRequest.responseMessage = responseMessage;
    matchRequest.respondedAt = new Date();

    await matchRequest.save();

    const updatedRequest = await MatchRequest.findById(matchRequest._id)
      .populate('requester', 'name avatar email')
      .populate('mentor', 'name avatar email')
      .populate('skillOffered')
      .populate('skillNeeded');

    res.status(200).json({
      success: true,
      message: `Request ${status} successfully`,
      data: updatedRequest
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel match request
 * @route   PUT /api/matches/:id/cancel
 * @access  Private
 */
export const cancelRequest = async (req, res, next) => {
  try {
    const matchRequest = await MatchRequest.findById(req.params.id);

    if (!matchRequest) {
      return res.status(404).json({
        success: false,
        message: 'Match request not found'
      });
    }

    // Verify user is the requester
    if (matchRequest.requester.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this request'
      });
    }

    if (matchRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Can only cancel pending requests'
      });
    }

    matchRequest.status = 'cancelled';
    await matchRequest.save();

    res.status(200).json({
      success: true,
      message: 'Request cancelled successfully'
    });
  } catch (error) {
    next(error);
  }
};
