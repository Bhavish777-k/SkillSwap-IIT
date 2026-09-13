import Session from '../models/Session.js';
import MatchRequest from '../models/MatchRequest.js';
import { deductPoints, addPoints } from './pointsController.js';
import Skill from '../models/Skill.js';

/**
 * @desc    Create new session
 * @route   POST /api/sessions
 * @access  Private
 */
export const createSession = async (req, res, next) => {
  try {
    const {
      matchRequestId,
      scheduledDate,
      duration,
      mode,
      meetingLink,
      location,
      notes
    } = req.body;

    // Verify match request exists and is accepted
    const matchRequest = await MatchRequest.findById(matchRequestId);

    if (!matchRequest) {
      return res.status(404).json({
        success: false,
        message: 'Match request not found'
      });
    }

    if (matchRequest.status !== 'accepted') {
      return res.status(400).json({
        success: false,
        message: 'Can only create sessions for accepted match requests'
      });
    }

    // Verify user is part of the match
    const isRequester = matchRequest.requester.toString() === req.user.id;
    const isMentor = matchRequest.mentor.toString() === req.user.id;

    if (!isRequester && !isMentor) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to create session for this match'
      });
    }

    // Fetch skill details from match request
    const skill = await Skill.findById(matchRequest.skillNeeded);

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }

    // Points cost = duration (hours) × skill pointValue
    const pointsCost = Math.ceil(duration / 60) * skill.pointValue;

    // Deduct points from the learner (requester)
    try {
      await deductPoints(
        matchRequest.requester.toString(),
        pointsCost,
        `Session booking: ${duration} minutes for skill ${skill.name}`,
        null // We'll update this with session ID after creation
      );
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    // Create session
    const session = await Session.create({
      matchRequest: matchRequestId,
      learner: matchRequest.requester,
      mentor: matchRequest.mentor,
      skill: matchRequest.skillNeeded,
      scheduledDate,
      duration,
      mode,
      meetingLink,
      location,
      notes
    });

    const populatedSession = await Session.findById(session._id)
      .populate('learner', 'name avatar email')
      .populate('mentor', 'name avatar email')
      .populate('skill');

    res.status(201).json({
      success: true,
      message: `Session created successfully. ${pointsCost} points deducted for ${duration} minutes of ${skill.name}.`,
      data: populatedSession
    });
  } catch (error) {
    next(error);
  }
};
// /**
//  * @desc    Create new session
//  * @route   POST /api/sessions
//  * @access  Private
//  */
// export const createSession = async (req, res, next) => {
//   try {
//     const {
//       matchRequestId,
//       scheduledDate,
//       duration,
//       mode,
//       meetingLink,
//       location,
//       notes
//     } = req.body;

//     // Verify match request exists and is accepted
//     const matchRequest = await MatchRequest.findById(matchRequestId);

//     if (!matchRequest) {
//       return res.status(404).json({
//         success: false,
//         message: 'Match request not found'
//       });
//     }

//     if (matchRequest.status !== 'accepted') {
//       return res.status(400).json({
//         success: false,
//         message: 'Can only create sessions for accepted match requests'
//       });
//     }

//     // Verify user is part of the match
//     const isRequester = matchRequest.requester.toString() === req.user.id;
//     const isMentor = matchRequest.mentor.toString() === req.user.id;

//     if (!isRequester && !isMentor) {
//       return res.status(403).json({
//         success: false,
//         message: 'Not authorized to create session for this match'
//       });
//     }

//     // Calculate points cost based on duration (10 points per hour)
//     const pointsCost = Math.ceil(duration / 60) * 10;

//     // Deduct points from the learner (requester)
//     try {
//       await deductPoints(
//         matchRequest.requester.toString(),
//         pointsCost,
//         `Session booking: ${duration} minutes`,
//         null // We'll update this with session ID after creation
//       );
//     } catch (error) {
//       return res.status(400).json({
//         success: false,
//         message: error.message
//       });
//     }

//     // Create session
//     const session = await Session.create({
//       matchRequest: matchRequestId,
//       learner: matchRequest.requester,
//       mentor: matchRequest.mentor,
//       skill: matchRequest.skillNeeded,
//       scheduledDate,
//       duration,
//       mode,
//       meetingLink,
//       location,
//       notes
//     });

//     const populatedSession = await Session.findById(session._id)
//       .populate('learner', 'name avatar email')
//       .populate('mentor', 'name avatar email')
//       .populate('skill');

//     res.status(201).json({
//       success: true,
//       message: `Session created successfully. ${pointsCost} points deducted from learner.`,
//       data: populatedSession
//     });
//   } catch (error) {
//     next(error);
//   }
// };

/**
 * @desc    Get user's sessions
 * @route   GET /api/sessions
 * @access  Private
 */
export const getSessions = async (req, res, next) => {
  try {
    const { status, type } = req.query;

    let query = {
      $or: [
        { learner: req.user.id },
        { mentor: req.user.id }
      ]
    };

    if (status) {
      query.status = status;
    }

    // Filter by user type (as learner or mentor)
    if (type === 'learning') {
      query = { learner: req.user.id };
    } else if (type === 'teaching') {
      query = { mentor: req.user.id };
    }

    const sessions = await Session.find(query)
      .populate('learner', 'name avatar email')
      .populate('mentor', 'name avatar email')
      .populate('skill')
      .sort({ scheduledDate: -1 });

    res.status(200).json({
      success: true,
      count: sessions.length,
      data: sessions
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single session
 * @route   GET /api/sessions/:id
 * @access  Private
 */
export const getSession = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('learner', 'name avatar email')
      .populate('mentor', 'name avatar email')
      .populate('skill')
      .populate('matchRequest');

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Verify user is part of the session
    const isLearner = session.learner._id.toString() === req.user.id;
    const isMentor = session.mentor._id.toString() === req.user.id;

    if (!isLearner && !isMentor && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this session'
      });
    }

    res.status(200).json({
      success: true,
      data: session
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update session
 * @route   PUT /api/sessions/:id
 * @access  Private
 */
export const updateSession = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Verify user is part of the session
    const isLearner = session.learner.toString() === req.user.id;
    const isMentor = session.mentor.toString() === req.user.id;

    if (!isLearner && !isMentor) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this session'
      });
    }

    // Update allowed fields
    const allowedFields = ['scheduledDate', 'duration', 'mode', 'meetingLink', 'location', 'notes'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        session[field] = req.body[field];
      }
    });

    await session.save();

    const updatedSession = await Session.findById(session._id)
      .populate('learner', 'name avatar email')
      .populate('mentor', 'name avatar email')
      .populate('skill');

    res.status(200).json({
      success: true,
      message: 'Session updated successfully',
      data: updatedSession
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark session as completed
 * @route   PUT /api/sessions/:id/complete
 * @access  Private
 */
// export const completeSession = async (req, res, next) => {
//   try {
//     const session = await Session.findById(req.params.id);

//     if (!session) {
//       return res.status(404).json({
//         success: false,
//         message: 'Session not found'
//       });
//     }

//     // Verify user is the mentor
//     if (session.mentor.toString() !== req.user.id) {
//       return res.status(403).json({
//         success: false,
//         message: 'Only mentor can mark session as completed'
//       });
//     }

//     session.status = 'completed';
//     session.completedAt = new Date();
//     await session.save();

//     // Award points to mentor after session completion
//     const pointsEarned = Math.ceil(session.duration / 60) * 10;
//     try {
//       console.log(`Awarding ${pointsEarned} points to mentor ${session.mentor.toString()}`);
//       await addPoints(
//         session.mentor.toString(),
//         pointsEarned,
//         'earned',
//         `Teaching session completed: ${session.duration} minutes`,
//         session._id
//       );
//       console.log(`Successfully awarded ${pointsEarned} points to mentor`);
//     } catch (error) {
//       console.error('Error awarding points to mentor:', error.message);
//     }

//     const populatedSession = await Session.findById(session._id)
//       .populate('learner', 'name avatar email')
//       .populate('mentor', 'name avatar email')
//       .populate('skill');

//     res.status(200).json({
//       success: true,
//       message: `Session marked as completed. ${pointsEarned} points awarded to mentor!`,
//       data: populatedSession
//     });
//   } catch (error) {
//     next(error);
//   }
// };
/**
 * @desc    Mark session as completed
 * @route   PUT /api/sessions/:id/complete
 * @access  Private (mentor only)
 */
export const completeSession = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Verify user is the mentor
    if (session.mentor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only mentor can mark session as completed'
      });
    }

    session.status = 'completed';
    session.completedAt = new Date();
    await session.save();

    // Fetch skill details
    const skill = await Skill.findById(session.skill);
    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }

    // Award points = duration (hours) × skill pointValue
    const pointsEarned = Math.ceil(session.duration / 60) * skill.pointValue;

    try {
      console.log(`Awarding ${pointsEarned} points to mentor ${session.mentor.toString()}`);
      await addPoints(
        session.mentor.toString(),
        pointsEarned,
        'earned',
        `Teaching session completed: ${session.duration} minutes for skill ${skill.name}`,
        session._id
      );
      console.log(`Successfully awarded ${pointsEarned} points to mentor`);
    } catch (error) {
      console.error('Error awarding points to mentor:', error.message);
    }

    const populatedSession = await Session.findById(session._id)
      .populate('learner', 'name avatar email')
      .populate('mentor', 'name avatar email')
      .populate('skill');

    res.status(200).json({
      success: true,
      message: `Session marked as completed. ${pointsEarned} points awarded to mentor for teaching ${skill.name}!`,
      data: populatedSession
    });
  } catch (error) {
    next(error);
  }
};
/**
 * @desc    Cancel session
 * @route   PUT /api/sessions/:id/cancel
 * @access  Private
 */
export const cancelSession = async (req, res, next) => {
  try {
    const { cancellationReason } = req.body;

    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Verify user is part of the session
    const isLearner = session.learner.toString() === req.user.id;
    const isMentor = session.mentor.toString() === req.user.id;

    if (!isLearner && !isMentor) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this session'
      });
    }

    session.status = 'cancelled';
    session.cancelledBy = req.user.id;
    session.cancellationReason = cancellationReason;
    await session.save();

    res.status(200).json({
      success: true,
      message: 'Session cancelled successfully',
      data: session
    });
  } catch (error) {
    next(error);
  }
};
