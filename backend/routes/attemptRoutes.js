const express = require('express');
const router = express.Router();
const { startAttempt, saveAnswer, submitExam } = require('../controllers/attemptController');
const { protect } = require('../middleware/authMiddleware');

router.post('/start', protect, startAttempt);
router.post('/answers/save', protect, saveAnswer);
router.post('/:id/submit', protect, submitExam);

module.exports = router;
