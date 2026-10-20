const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendance.controller');
const { authenticate, requirePermission } = require('../middleware/auth');

router.get('/', authenticate, attendanceController.getAttendance);
router.post('/mark', authenticate, requirePermission('profile_manage', 2), attendanceController.markAttendance);
router.post('/check-in-out', authenticate, attendanceController.toggleCheckInOut);

module.exports = router;
