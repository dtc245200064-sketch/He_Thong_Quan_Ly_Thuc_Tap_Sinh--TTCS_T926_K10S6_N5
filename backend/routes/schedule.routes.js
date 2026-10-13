const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/schedule.controller');

// CRUD endpoints cho lịch thực tập
router.get('/', scheduleController.getSchedules);
router.post('/', scheduleController.createSchedule);
router.put('/:id', scheduleController.updateSchedule);
router.delete('/:id', scheduleController.deleteSchedule);

module.exports = router;
