const express = require('express');
const router = express.Router();
const { getAllStudents, grantRetake } = require('../controllers/adminStudentController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/students', protect, admin, getAllStudents);
router.post('/grant-retake/:id', protect, admin, grantRetake);

module.exports = router;
