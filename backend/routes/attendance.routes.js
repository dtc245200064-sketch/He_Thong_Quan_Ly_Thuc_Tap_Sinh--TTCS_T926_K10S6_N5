const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendance.controller');

router.get('/', attendanceController.getAttendance);
router.post('/mark', attendanceController.markAttendance);
router.post('/check-in-out', attendanceController.toggleCheckInOut);

module.exports = router;
