/**
 * Notification Routes - Định tuyến API thông báo và lịch họp
 * Phụ trách: Ma Công Đức (dtc245200136@ictu.edu.vn)
 * Nhiệm vụ Jira: SCRUM-56 / SCRUM-176
 */

const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const { authenticate } = require('../middleware/auth');

// --- CÁC ROUTE THÔNG BÁO IN-APP (STT 36) ---
// Lấy danh sách thông báo của người dùng
router.get('/', authenticate, notificationController.getInAppNotifications);

// Tạo thông báo in-app mới
router.post('/', authenticate, notificationController.createNotification);

// Đánh dấu tất cả thông báo của người dùng là đã đọc (B04)
router.put('/read-all', authenticate, notificationController.markAllAsRead);

// Đánh dấu 1 thông báo cụ thể là đã đọc
router.put('/:id/read', authenticate, notificationController.markAsRead);

// Xóa 1 thông báo
router.delete('/:id', authenticate, notificationController.deleteNotification);

// --- CÁC ROUTE LỊCH HỌP & EMAIL (STT 35) ---
// Tạo lịch họp mới và gửi email thông báo
router.post('/meetings', authenticate, notificationController.createMeeting);

// Lấy danh sách cuộc họp được mời tham gia
router.get('/meetings', authenticate, notificationController.getMeetings);

module.exports = router;
