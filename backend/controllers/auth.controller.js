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

    // 1. Tìm user trong Database theo email
    const [users] = await db.query(
      'SELECT id, email, password, name, role, avatar, phone FROM users WHERE email = ? LIMIT 1',
      [loginIdentifier]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không chính xác!'
      });
    }

    const user = users[0];

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

    return res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: roleDisplay,
        avatar: user.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
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
