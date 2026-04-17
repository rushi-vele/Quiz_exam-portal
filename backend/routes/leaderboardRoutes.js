const express = require('express');
const router = express.Router();
const { getLeaderboardByExam, getGlobalLeaderboard } = require('../controllers/leaderboardController');
const { protect } = require('../middleware/authMiddleware');

router.get('/exam/:examId', protect, getLeaderboardByExam);
router.get('/global', protect, getGlobalLeaderboard);

module.exports = router;
