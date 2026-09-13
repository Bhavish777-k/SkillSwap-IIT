import express from 'express';

import {
    getTeacherLeaderboard
} from '../controllers/leaderboardController.js';

const router = express.Router();

// Public leaderboard
router.get('/teachers', getTeacherLeaderboard);

export default router;