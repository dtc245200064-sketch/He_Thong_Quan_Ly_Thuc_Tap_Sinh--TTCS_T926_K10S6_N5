const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/schedule.controller');
const { authenticate, requirePermission } = require('../middleware/auth');

router.get('/', authenticate, scheduleController.getSchedules);
router.post('/', authenticate, requirePermission('profile_manage', 1), scheduleController.createSchedule);
router.put('/:id', authenticate, requirePermission('profile_manage', 2), scheduleController.updateSchedule);
router.delete('/:id', authenticate, requirePermission('profile_manage', 3), scheduleController.deleteSchedule);

module.exports = router;
