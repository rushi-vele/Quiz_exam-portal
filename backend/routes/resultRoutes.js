const express = require('express');
const router = express.Router();
const { getResultByAttemptId, getMyResults, getAllResults } = require('../controllers/resultController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/my-results', protect, getMyResults);
router.get('/attempt/:id', protect, getResultByAttemptId);
router.get('/exam/:examId', protect, admin, getAllResults);

module.exports = router;
