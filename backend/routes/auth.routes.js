const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');
const { loginRateLimiter } = require('../middleware/rateLimiter');

// POST /api/auth/login (Có Rate Limiter chống dò mật khẩu - B05)
router.post('/login', loginRateLimiter, authController.login);

// POST /api/auth/register (Đăng ký tài khoản Thực tập sinh trực tuyến - STT 6)
router.post('/register', loginRateLimiter, authController.register);

// GET /api/auth/me (Lấy thông tin tài khoản và phân quyền từ MySQL)
router.get('/me', authenticate, authController.getMe);

module.exports = router;
