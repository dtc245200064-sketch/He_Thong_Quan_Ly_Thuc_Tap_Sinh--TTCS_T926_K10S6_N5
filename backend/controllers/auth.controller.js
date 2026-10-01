const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'codegym_secret_key_2026';

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

    // 1. Tìm user trong Database theo email hoặc tên đăng nhập
    const [users] = await db.query(
      'SELECT id, email, username, password, name, role, avatar, phone, status FROM users WHERE (email = ? OR username = ?) LIMIT 1',
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
        message: 'Tài khoản của bạn đã bị khóa! Vui lòng liên hệ Quản trị viên.'
      });
    }

    // 2. So sánh mật khẩu (Hỗ trợ cả bcrypt hash và so sánh trực tiếp)
    let isMatch = false;
    try {
      isMatch = await bcrypt.compare(password, user.password);
    } catch (e) {
      isMatch = false;
    }

    // Nếu không khớp bcrypt, thử so sánh trực tiếp chuỗi mật khẩu (cho trường hợp test plaintext)
    if (!isMatch && user.password === password) {
      isMatch = true;
    }

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không chính xác!'
      });
    }

    // 3. Tạo JWT Token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Chuẩn hóa tên vai trò cho frontend
    const roleDisplay = user.role === 'HR' ? 'HR Manager' : (user.role === 'INTERN' ? 'Thực tập sinh' : user.role);

    // Nếu là thực tập sinh, lấy chính xác intern_id từ bảng interns
    let internId = null;
    if (user.role === 'INTERN' || user.role === 'Thực tập sinh') {
      const [interns] = await db.query('SELECT id FROM interns WHERE user_id = ? OR email = ? LIMIT 1', [user.id, user.email]);
      if (interns.length > 0) {
        internId = interns[0].id;
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công!',
      token,
      user: {
        id: user.id,
        internId: internId || user.id,
        name: user.name,
        email: user.email,
        username: user.username || '',
        role: roleDisplay,
        avatar: user.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
        phone: user.phone || ''
      }
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
