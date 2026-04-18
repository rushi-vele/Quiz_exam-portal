const express = require('express');
const router = express.Router();
const { createExam, getExams, getExamById, toggleExamStatus, getActiveExams, updateExam, deleteExam } = require('../controllers/examController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/active', protect, getActiveExams);
router.route('/')
    .get(protect, admin, getExams)
    .post(protect, admin, createExam);

router.route('/:id')
    .get(protect, getExamById)
    .put(protect, admin, updateExam)
    .delete(protect, admin, deleteExam);

router.put('/:id/toggle', protect, admin, toggleExamStatus);

module.exports = router;
