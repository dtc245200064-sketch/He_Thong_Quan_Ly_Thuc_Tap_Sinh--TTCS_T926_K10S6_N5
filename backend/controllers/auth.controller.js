const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/jwt');

// POST /api/auth/login (hoặc POST /api/login)
exports.login = async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const loginIdentifier = (email || username || '').trim();

    if (!loginIdentifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đầy đủ email/tên đăng nhập và mật khẩu!'
      });
    }

    // 1. Tìm user trong Database theo email hoặc tên đăng nhập (chỉ trong bảng users, không JOIN bừa)
    const [users] = await db.query(
      `SELECT id, name, email, username, password, role, status, avatar, phone 
       FROM users 
       WHERE email = ? OR username = ? 
       LIMIT 1`,
      [loginIdentifier, loginIdentifier]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Email/Tên đăng nhập hoặc mật khẩu không chính xác!'
      });
    }

    const user = users[0];

    // Kiểm tra tài khoản có bị khóa không
    if (user.status === 'locked') {
      return res.status(403).json({
        success: false,
        code: 'ACCOUNT_LOCKED',
        message: 'Tài khoản của bạn đã bị khóa! Vui lòng liên hệ Quản trị viên.'
      });
    }

    // 2. So sánh mật khẩu bằng bcrypt duy nhất (bỏ hoàn toàn so sánh plaintext và backdoor)
    let isMatch = false;
    try {
      isMatch = await bcrypt.compare(password, user.password);
    } catch (e) {
      isMatch = false;
    }

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không chính xác!'
      });
    }

    // Chuẩn hóa tên vai trò
    let normalizedRole = user.role;
    if (user.role === 'HR' || user.role === 'HR Manager') normalizedRole = 'HR Manager';
    else if (user.role === 'INTERN' || user.role === 'Thực tập sinh') normalizedRole = 'Thực tập sinh';
    else if (user.role === 'MENTOR' || user.role === 'Mentor') normalizedRole = 'Mentor';
    else if (user.role === 'ADMIN' || user.role === 'Admin') normalizedRole = 'Admin';

    // Xác định intern_id nếu là thực tập sinh
    let internId = null;
    if (normalizedRole === 'Thực tập sinh') {
      const [interns] = await db.query(
        'SELECT id FROM interns WHERE user_id = ? OR email = ? LIMIT 1', 
        [user.id, user.email]
      );
      if (interns.length > 0) {
        internId = interns[0].id;
        await db.query('UPDATE interns SET user_id = ? WHERE id = ? AND user_id IS NULL', [user.id, internId]);
      }
    }

    // Xác định mentor_id nếu là mentor
    let mentorId = null;
    if (normalizedRole === 'Mentor') {
      const [mentors] = await db.query(
        'SELECT id FROM mentors WHERE user_id = ? OR email = ? LIMIT 1',
        [user.id, user.email]
      );
      if (mentors.length > 0) {
        mentorId = mentors[0].id;
        await db.query('UPDATE mentors SET user_id = ? WHERE id = ? AND user_id IS NULL', [user.id, mentorId]);
      }
    }

    // 3. Tạo JWT Token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: normalizedRole, 
        name: user.name,
        internId: internId,
        mentorId: mentorId
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 4. Lấy ma trận phân quyền thực tế từ MySQL cho vai trò người dùng
    const [permRows] = await db.query('SELECT permissions FROM role_permissions WHERE role = ? LIMIT 1', [normalizedRole]);
    let permissions = null;
    if (permRows.length > 0) {
      permissions = permRows[0].permissions;
      if (typeof permissions === 'string') {
        try { permissions = JSON.parse(permissions); } catch (e) {}
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công!',
      token,
      user: {
        id: user.id,
        internId: internId || null,
        mentorId: mentorId || null,
        name: user.name,
        email: user.email,
        username: user.username || '',
        role: normalizedRole,
        avatar: user.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
        phone: user.phone || ''
      },
      permissions
    });

  } catch (error) {
    console.error('Lỗi API Login:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ nội bộ',
      error: error.message
    });
  }
};

// GET /api/auth/me (Lấy thông tin tài khoản và ma trận quyền mới nhất từ MySQL)
exports.getMe = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Chưa đăng nhập!'
      });
    }

    // Lấy thông tin mới nhất từ Database
    const [users] = await db.query(
      'SELECT id, name, email, username, role, status, avatar, phone FROM users WHERE id = ? LIMIT 1',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tài khoản không tồn tại!'
      });
    }

    const user = users[0];
    if (user.status === 'locked') {
      return res.status(403).json({
        success: false,
        code: 'ACCOUNT_LOCKED',
        message: 'Tài khoản của bạn đã bị khóa bởi Quản trị viên!'
      });
    }

    let normalizedRole = user.role;
    if (user.role === 'HR' || user.role === 'HR Manager') normalizedRole = 'HR Manager';
    else if (user.role === 'INTERN' || user.role === 'Thực tập sinh') normalizedRole = 'Thực tập sinh';
    else if (user.role === 'MENTOR' || user.role === 'Mentor') normalizedRole = 'Mentor';
    else if (user.role === 'ADMIN' || user.role === 'Admin') normalizedRole = 'Admin';

    let internId = req.user.internId || null;
    if (!internId && normalizedRole === 'Thực tập sinh') {
      const [interns] = await db.query(
        'SELECT id FROM interns WHERE user_id = ? OR email = ? LIMIT 1',
        [user.id, user.email]
      );
      if (interns.length > 0) internId = interns[0].id;
    }

    let mentorId = req.user.mentorId || null;
    if (!mentorId && normalizedRole === 'Mentor') {
      const [mentors] = await db.query(
        'SELECT id FROM mentors WHERE user_id = ? OR email = ? LIMIT 1',
        [user.id, user.email]
      );
      if (mentors.length > 0) mentorId = mentors[0].id;
    }

    const [permRows] = await db.query('SELECT permissions FROM role_permissions WHERE role = ? LIMIT 1', [normalizedRole]);
    let permissions = null;
    if (permRows.length > 0) {
      permissions = permRows[0].permissions;
      if (typeof permissions === 'string') {
        try { permissions = JSON.parse(permissions); } catch (e) {}
      }
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        internId,
        mentorId,
        name: user.name,
        email: user.email,
        username: user.username || '',
        role: normalizedRole,
        avatar: user.avatar || '',
        phone: user.phone || ''
      },
      permissions
    });
  } catch (error) {
    console.error('Lỗi API getMe:', error);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ' });
  }
};
