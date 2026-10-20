const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, notificationController.getInAppNotifications);
router.post('/', authenticate, notificationController.createNotification);
router.put('/read-all', authenticate, notificationController.markAllAsRead);
router.put('/:id/read', authenticate, notificationController.markAsRead);
router.delete('/:id', authenticate, notificationController.deleteNotification);

router.post('/meetings', authenticate, notificationController.createMeeting);
router.get('/meetings', authenticate, notificationController.getMeetings);

module.exports = router;
