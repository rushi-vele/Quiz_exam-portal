const express = require('express');
const router = express.Router();
const { createExam, getExams, getExamById, publishExam, getActiveExams, updateExam, deleteExam } = require('../controllers/examController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/active', protect, getActiveExams);
router.route('/')
    .get(protect, admin, getExams)
    .post(protect, admin, createExam);

router.route('/:id')
    .get(protect, getExamById)
    .put(protect, admin, updateExam)
    .delete(protect, admin, deleteExam);

router.put('/:id/publish', protect, admin, publishExam);

module.exports = router;
