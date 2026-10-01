const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');

// 1. Quản lý tài khoản người dùng (User Story 39)
router.get('/users', adminController.getUsers);
router.post('/users', adminController.createUser);
router.put('/users/:id', adminController.updateUser);
router.patch('/users/:id/status', adminController.toggleUserStatus);

// 2. Phân quyền chi tiết hệ thống (User Story 40)
router.get('/permissions', adminController.getPermissions);
router.put('/permissions', adminController.updatePermissions);

module.exports = router;
