const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticate, requirePermission } = require('../middleware/auth');

// 1. Quản lý tài khoản người dùng (User Story 39)
// GET /api/admin/users (Xem danh sách tài khoản)
router.get('/users', authenticate, requirePermission('acc_manage', 0), adminController.getUsers);

// POST /api/admin/users (Thêm tài khoản mới)
router.post('/users', authenticate, requirePermission('acc_manage', 1), adminController.createUser);

// PUT /api/admin/users/:id (Chỉnh sửa tài khoản)
router.put('/users/:id', authenticate, requirePermission('acc_manage', 2), adminController.updateUser);

// PATCH /api/admin/users/:id/status (Khóa / Mở khóa / Xóa tài khoản)
router.patch('/users/:id/status', authenticate, requirePermission('acc_manage', 3), adminController.toggleUserStatus);

// 2. Phân quyền chi tiết hệ thống (User Story 40)
// GET /api/admin/permissions (Xem phân quyền - Cho phép người dùng đã xác thực xem ma trận quyền)
router.get('/permissions', authenticate, adminController.getPermissions);

// PUT /api/admin/permissions (Cập nhật ma trận phân quyền - Yêu cầu quyền Sửa của perm_system)
router.put('/permissions', authenticate, requirePermission('perm_system', 2), adminController.updatePermissions);

module.exports = router;
