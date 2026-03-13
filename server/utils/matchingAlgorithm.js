/**
 * Advanced skill matching algorithm
 * Matches users based on:
 * 1. Skill compatibility (offered vs needed)
 * 2. Availability overlap
 * 3. Rating score
 * 4. Activity level
 */

import User from '../models/User.js';
import MatchRequest from '../models/MatchRequest.js';

/**
 * Calculate match score between two users
 */
export const calculateMatchScore = (currentUser, potentialMatch) => {
  let score = 0;

  // 1. Skill match (40 points)
  const skillMatch = hasSkillMatch(currentUser, potentialMatch);
  if (skillMatch) {
    score += 40;
  }

  // 2. Availability overlap (30 points)
  const availabilityScore = calculateAvailabilityOverlap(
    currentUser.availability,
    potentialMatch.availability
  );
  score += availabilityScore * 30;

  // 3. Rating (20 points)
  const ratingScore = (potentialMatch.rating.average / 5) * 20;
  score += ratingScore;

  // 4. Premium bonus (10 points)
  if (potentialMatch.isPremium) {
    score += 10;
  }

  return Math.round(score);
};

/**
 * Check if there's a skill match between users
 */
const hasSkillMatch = (user1, user2) => {
  const user1Offered = user1.skillsOffered.map(s => s.toString());
  const user1Needed = user1.skillsNeeded.map(s => s.toString());
  const user2Offered = user2.skillsOffered.map(s => s.toString());
  const user2Needed = user2.skillsNeeded.map(s => s.toString());

  // Check if user1's needed skills match user2's offered skills
  const match1 = user1Needed.some(skill => user2Offered.includes(skill));
  
  // Check if user2's needed skills match user1's offered skills (optional)
  const match2 = user2Needed.some(skill => user1Offered.includes(skill));

  return match1 || match2;
};

/**
 * Calculate availability overlap (0 to 1)
 */
const calculateAvailabilityOverlap = (avail1, avail2) => {
  if (!avail1 || !avail2) return 0;

  // Calculate day overlap
  const days1 = avail1.days || [];
  const days2 = avail2.days || [];
  const dayOverlap = days1.filter(day => days2.includes(day)).length;
  const dayScore = days1.length > 0 ? dayOverlap / days1.length : 0;

  // Calculate time slot overlap
  const slots1 = avail1.timeSlots || [];
  const slots2 = avail2.timeSlots || [];
  const slotOverlap = slots1.filter(slot => slots2.includes(slot)).length;
  const slotScore = slots1.length > 0 ? slotOverlap / slots1.length : 0;

  // Average of day and slot scores
  return (dayScore + slotScore) / 2;
};

/**
 * Find potential matches for a user
 */
export const findMatches = async (userId, filters = {}) => {
  try {
    // Get current user with populated skills
    const currentUser = await User.findById(userId)
      .populate('skillsOffered')
      .populate('skillsNeeded');

    if (!currentUser) {
      throw new Error('User not found');
    }

    // Build query for potential matches
    const query = {
      _id: { $ne: userId }, // Exclude self
      isBlocked: false // Exclude blocked users
    };

    // Filter by skill offered (users who can teach what current user needs)
    if (filters.skillNeeded) {
      query.skillsOffered = filters.skillNeeded;
    }

    // Filter by skill needed (users who need what current user offers)
    if (filters.skillOffered) {
      query.skillsNeeded = filters.skillOffered;
    }

    // Get potential matches
    let potentialMatches = await User.find(query)
      .populate('skillsOffered')
      .populate('skillsNeeded')
      .select('-password');

    // Calculate match scores
    const matchesWithScores = potentialMatches.map(match => {
      const score = calculateMatchScore(currentUser, match);
      return {
        user: match,
        matchScore: score,
        skillsOffered: match.skillsOffered,
        skillsNeeded: match.skillsNeeded,
        rating: match.rating.average,
        isPremium: match.isPremium
      };
    });

    // Sort by match score (highest first)
    matchesWithScores.sort((a, b) => b.matchScore - a.matchScore);

    // Apply pagination if specified
    const limit = filters.limit || 20;
    const matches = matchesWithScores.slice(0, limit);

    return matches;
  } catch (error) {
    throw error;
  }
};

/**
 * Get match recommendations based on user's profile
 */
export const getRecommendations = async (userId) => {
  try {
    const currentUser = await User.findById(userId)
      .populate('skillsOffered')
      .populate('skillsNeeded');

    if (!currentUser || currentUser.skillsNeeded.length === 0) {
      return [];
    }

    // Find users who offer what the current user needs
    const recommendations = await findMatches(userId, {
      limit: 10
    });

    return recommendations;
  } catch (error) {
    throw error;
  }
};
