const express = require('express');
const router = express.Router();
const { createRetakeRequest, getStudentRequests, getAllRequests, processRequest } = require('../controllers/retakeRequestController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/request', protect, createRetakeRequest);
router.get('/my-requests', protect, getStudentRequests);
router.get('/all', protect, admin, getAllRequests);
router.put('/:id', protect, admin, processRequest);

module.exports = router;
