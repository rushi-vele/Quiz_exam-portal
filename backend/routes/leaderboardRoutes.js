const express = require('express');
const router = express.Router();
const { getLeaderboardByExam, getGlobalLeaderboard } = require('../controllers/leaderboardController');
const { protect } = require('../middleware/authMiddleware');

router.get('/global', protect, getGlobalLeaderboard);
router.get('/:examId', protect, getLeaderboardByExam);

module.exports = router;
