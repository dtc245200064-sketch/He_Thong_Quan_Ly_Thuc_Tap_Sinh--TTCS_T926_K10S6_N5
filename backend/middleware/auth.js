const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'codegym_secret_key_2026';

function normalizeRole(role) {
  if (!role) return 'HR Manager';
  const r = role.toString().trim();
  if (r.toUpperCase() === 'ADMIN') return 'Admin';
  if (r.toUpperCase() === 'HR' || r === 'HR Manager') return 'HR Manager';
  if (r.toUpperCase() === 'MENTOR') return 'Mentor';
  if (r.toUpperCase() === 'INTERN' || r === 'Thực tập sinh') return 'Thực tập sinh';
  return r;
}

// 1. Xác thực người dùng (JWT Token từ Header Authorization, query, hoặc header x-user-role dự phòng)
const authenticate = async (req, res, next) => {
  try {
    let token = null;
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    } else if (req.query && req.query.token) {
      token = req.query.token;
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        // Kiểm tra thực tế trong CSDL MySQL
        const [users] = await db.query(
          'SELECT id, name, email, username, role, avatar, phone, status FROM users WHERE id = ? LIMIT 1',
          [decoded.id]
        );

        if (users.length > 0) {
          const user = users[0];
          if (user.status === 'locked') {
            return res.status(403).json({
              success: false,
              code: 'ACCOUNT_LOCKED',
              message: 'Tài khoản của bạn đã bị khóa bởi Quản trị viên!'
            });
          }
          user.role = normalizeRole(user.role);
          req.user = user;
          return next();
        }
      } catch (err) {
        // Token không hợp lệ hoặc hết hạn, tiếp tục thử fallback nếu có
      }
    }

    // Fallback: nếu frontend truyền x-user-role hoặc x-user-id
    const headerRole = req.headers['x-user-role'];
    const headerUserId = req.headers['x-user-id'];
    if (headerRole || headerUserId) {
      let query = 'SELECT id, name, email, username, role, avatar, phone, status FROM users WHERE ';
      let params = [];
      if (headerUserId) {
        query += 'id = ? LIMIT 1';
        params.push(headerUserId);
      } else {
        query += 'role = ? LIMIT 1';
        params.push(normalizeRole(headerRole));
      }
      const [users] = await db.query(query, params);
      if (users.length > 0) {
        const user = users[0];
        if (user.status === 'locked') {
          return res.status(403).json({
            success: false,
            code: 'ACCOUNT_LOCKED',
            message: 'Tài khoản của bạn đã bị khóa!'
          });
        }
        user.role = normalizeRole(user.role);
        req.user = user;
        return next();
      }
    }

    // Nếu không có bất kỳ thông tin xác thực nào
    return res.status(401).json({
      success: false,
      code: 'UNAUTHORIZED',
      message: 'Yêu cầu đăng nhập để truy cập tài nguyên này!'
    });
  } catch (error) {
    console.error('Lỗi Auth Middleware:', error);
    return res.status(500).json({ success: false, message: 'Lỗi xác thực hệ thống!' });
  }
};

// 2. Middleware kiểm tra phân quyền thực tế từ bảng role_permissions trong MySQL (User Story 40)
// moduleKey: 'acc_manage' | 'perm_system' | 'profile_manage' | 'search_intern' | 'view_docs' | 'review_docs' | 'view_own_profile' | 'upload_cv' | 'upload_letter' | 'view_status'
// actionIndex: 0 (Xem) | 1 (Thêm) | 2 (Sửa) | 3 (Xóa) | 4 (Duyệt)
const requirePermission = (moduleKey, actionIndex) => {
  return async (req, res, next) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ success: false, message: 'Chưa đăng nhập!' });
      }

      // Quản trị viên (Admin) luôn có toàn quyền điều hành hệ thống
      if (user.role === 'Admin') {
        return next();
      }

      // Đọc ma trận phân quyền thực tế từ MySQL
      const [rows] = await db.query(
        'SELECT permissions FROM role_permissions WHERE role = ? LIMIT 1',
        [user.role]
      );

      if (rows.length === 0) {
        return res.status(403).json({
          success: false,
          code: 'PERMISSION_DENIED',
          message: `Vai trò "${user.role}" chưa được cấu hình phân quyền trong CSDL MySQL!`
        });
      }

      let permissions = rows[0].permissions;
      if (typeof permissions === 'string') {
        try { permissions = JSON.parse(permissions); } catch (e) {}
      }

      const modulePerms = permissions ? permissions[moduleKey] : null;
      const isAllowed = Array.isArray(modulePerms) && modulePerms[actionIndex] === true;

      if (!isAllowed) {
        const actionNames = ['Xem', 'Thêm', 'Sửa', 'Xóa', 'Duyệt'];
        const actionName = actionNames[actionIndex] || `Thao tác [${actionIndex}]`;
        return res.status(403).json({
          success: false,
          code: 'PERMISSION_DENIED',
          message: `Bạn không có quyền "${actionName}" trong phân hệ "${moduleKey}"! Thao tác này đã bị Quản trị viên vô hiệu hóa trong CSDL.`
        });
      }

      next();
    } catch (error) {
      console.error('Lỗi kiểm tra quyền hạn:', error);
      return res.status(500).json({ success: false, message: 'Lỗi kiểm tra quyền máy chủ!' });
    }
  };
};

module.exports = {
  authenticate,
  requirePermission,
  normalizeRole,
  JWT_SECRET
};
