import mongoose from 'mongoose';
import Session from '../models/Session.js';

/**
 * @desc    Get teacher leaderboard for a particular skill
 * @route   GET /api/leaderboard/teachers?skillId=<skillId>
 * @access  Public
 */
export const getTeacherLeaderboard = async(req, res, next) => {
    try {
        const { skillId } = req.query;

        // skillId is required
        if (!skillId) {
            return res.status(400).json({
                success: false,
                message: 'skillId is required'
            });
        }

        // Validate MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(skillId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid skillId'
            });
        }

        /*
         * Only COMPLETED teaching sessions are considered.
         *
         * Each leaderboard entry is:
         * mentor + skill
         *
         * We calculate:
         * - total teaching time
         * - total sessions
         * - total students
         * - total points earned
         */
        const leaderboard = await Session.aggregate([
            // --------------------------------------------------
            // 1. Only completed sessions for requested skill
            // --------------------------------------------------
            {
                $match: {
                    status: 'completed',
                    skill: new mongoose.Types.ObjectId(skillId)
                }
            },

            // --------------------------------------------------
            // 2. Get skill information
            // --------------------------------------------------
            {
                $lookup: {
                    from: 'skills',
                    localField: 'skill',
                    foreignField: '_id',
                    as: 'skillInfo'
                }
            },

            {
                $unwind: '$skillInfo'
            },

            // --------------------------------------------------
            // 3. Group sessions by teacher
            // --------------------------------------------------
            {
                $group: {
                    _id: {
                        mentor: '$mentor',
                        skill: '$skill'
                    },

                    totalTeachingMinutes: {
                        $sum: '$duration'
                    },

                    totalSessions: {
                        $sum: 1
                    },

                    students: {
                        $addToSet: '$learner'
                    },

                    sessionIds: {
                        $push: '$_id'
                    },

                    // Points earned for teaching
                    //
                    // Existing project logic:
                    // points = ceil(duration / 60) × skill.pointValue
                    totalPoints: {
                        $sum: {
                            $multiply: [{
                                    $ceil: {
                                        $divide: ['$duration', 60]
                                    }
                                },
                                '$skillInfo.pointValue'
                            ]
                        }
                    },

                    skillName: {
                        $first: '$skillInfo.name'
                    },

                    skillIcon: {
                        $first: '$skillInfo.icon'
                    }
                }
            },

            // --------------------------------------------------
            // 4. Get teacher information
            // --------------------------------------------------
            {
                $lookup: {
                    from: 'users',
                    localField: '_id.mentor',
                    foreignField: '_id',
                    as: 'teacher'
                }
            },

            {
                $unwind: '$teacher'
            },

            // --------------------------------------------------
            // 5. Get reviews for this teacher's sessions
            // --------------------------------------------------
            {
                $lookup: {
                    from: 'reviews',

                    let: {
                        mentorId: '$_id.mentor',
                        sessions: '$sessionIds'
                    },

                    pipeline: [{
                            $match: {
                                $expr: {
                                    $and: [{
                                            $eq: [
                                                '$reviewee',
                                                '$$mentorId'
                                            ]
                                        },
                                        {
                                            $in: [
                                                '$session',
                                                '$$sessions'
                                            ]
                                        },
                                        {
                                            $eq: [
                                                '$isPublic',
                                                true
                                            ]
                                        }
                                    ]
                                }
                            }
                        },

                        {
                            $group: {
                                _id: null,

                                averageRating: {
                                    $avg: '$rating'
                                },

                                reviewCount: {
                                    $sum: 1
                                }
                            }
                        }
                    ],

                    as: 'reviewStats'
                }
            },

            // --------------------------------------------------
            // 6. Convert review array into object
            // --------------------------------------------------
            {
                $unwind: {
                    path: '$reviewStats',
                    preserveNullAndEmptyArrays: true
                }
            },

            // --------------------------------------------------
            // 7. Select required fields
            // --------------------------------------------------
            {
                $project: {
                    _id: 0,

                    teacherId: '$_id.mentor',

                    teacherName: '$teacher.name',

                    teacherAvatar: '$teacher.avatar',

                    teacherBio: '$teacher.bio',

                    skillId: '$_id.skill',

                    skillName: 1,

                    skillIcon: 1,

                    totalTeachingMinutes: 1,

                    totalSessions: 1,

                    totalStudents: {
                        $size: '$students'
                    },

                    totalPoints: 1,

                    averageRating: {
                        $ifNull: [
                            '$reviewStats.averageRating',
                            0
                        ]
                    },

                    reviewCount: {
                        $ifNull: [
                            '$reviewStats.reviewCount',
                            0
                        ]
                    }
                }
            }
        ]);

        // --------------------------------------------------
        // 8. Calculate maximum values
        // --------------------------------------------------

        const maxPoints = Math.max(
            ...leaderboard.map(item => item.totalPoints),
            1
        );

        const maxTeachingMinutes = Math.max(
            ...leaderboard.map(
                item => item.totalTeachingMinutes
            ),
            1
        );

        // --------------------------------------------------
        // 9. Calculate leaderboard score
        // --------------------------------------------------

        const rankedLeaderboard = leaderboard.map(item => {
            const ratingScore =
                (item.averageRating / 5) * 40;

            const pointsScore =
                (item.totalPoints / maxPoints) * 30;

            const timeScore =
                (item.totalTeachingMinutes /
                    maxTeachingMinutes) *
                30;

            const leaderboardScore =
                ratingScore +
                pointsScore +
                timeScore;

            return {
                ...item,

                ratingScore: Number(
                    ratingScore.toFixed(2)
                ),

                pointsScore: Number(
                    pointsScore.toFixed(2)
                ),

                timeScore: Number(
                    timeScore.toFixed(2)
                ),

                leaderboardScore: Number(
                    leaderboardScore.toFixed(2)
                )
            };
        });

        // --------------------------------------------------
        // 10. Sort highest score first
        // --------------------------------------------------

        rankedLeaderboard.sort(
            (a, b) =>
            b.leaderboardScore -
            a.leaderboardScore
        );

        // --------------------------------------------------
        // 11. Add rank
        // --------------------------------------------------

        const finalLeaderboard =
            rankedLeaderboard.map(
                (teacher, index) => ({
                    rank: index + 1,
                    ...teacher
                })
            );

        res.status(200).json({
            success: true,

            count: finalLeaderboard.length,

            weights: {
                rating: 40,
                points: 30,
                teachingTime: 30
            },

            data: finalLeaderboard
        });

    } catch (error) {
        next(error);
    }
};