const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leave.controller');

router.get('/', leaveController.getLeaves);
router.post('/', leaveController.createLeave);
const { authenticate } = require('../middleware/auth');
const hrOnly = require('../middleware/hr');
router.patch('/:id/review', authenticate, hrOnly, leaveController.reviewLeave);

module.exports = router;
