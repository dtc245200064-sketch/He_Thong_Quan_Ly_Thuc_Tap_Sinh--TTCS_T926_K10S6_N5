const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leave.controller');
const { authenticate, requirePermission } = require('../middleware/auth');

router.get('/', authenticate, leaveController.getLeaves);
router.post('/', authenticate, leaveController.createLeave);
router.patch('/:id/review', authenticate, requirePermission('review_docs', 4), leaveController.reviewLeave);

module.exports = router;
