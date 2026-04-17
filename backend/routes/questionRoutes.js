const express = require('express');
const router = express.Router();
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });
const { addQuestion, bulkUpload, batchAddQuestions, getQuestionsByExamId, updateQuestion, deleteQuestion, parseExcel } = require('../controllers/questionController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/', protect, admin, addQuestion);
router.get('/:examId', protect, admin, getQuestionsByExamId);
router.put('/:id', protect, admin, updateQuestion);
router.delete('/:id', protect, admin, deleteQuestion);
router.post('/add', protect, admin, batchAddQuestions);
router.post('/parse', protect, admin, upload.single('file'), parseExcel);
router.post('/bulk', protect, admin, upload.single('file'), bulkUpload);

module.exports = router;
