const express = require('express');
const router = express.Router();
const { createStudent, getStudents, getStudentById, updateStudent, deleteStudent } = require('../controllers/studentController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, admin, getStudents)
    .post(protect, admin, createStudent);

router.route('/:id')
    .get(protect, admin, getStudentById)
    .put(protect, admin, updateStudent)
    .delete(protect, admin, deleteStudent);

module.exports = router;
