const express = require('express');
const router = express.Router();
const notifController = require('../controllers/notification.controller');

router.get('/', notifController.getInAppNotifications);
router.post('/', notifController.createNotification);
router.put('/read-all', notifController.markAllAsRead);
router.put('/:id/read', notifController.markAsRead);
router.delete('/:id', notifController.deleteNotification);
router.post('/meetings', notifController.createMeeting);
router.get('/meetings', notifController.getMeetings);

module.exports = router;
