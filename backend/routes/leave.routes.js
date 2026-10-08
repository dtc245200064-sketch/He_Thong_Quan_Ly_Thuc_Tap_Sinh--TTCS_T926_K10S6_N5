const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leave.controller');

router.get('/', leaveController.getLeaves);
router.post('/', leaveController.createLeave);
router.patch('/:id/review', leaveController.reviewLeave);

module.exports = router;
