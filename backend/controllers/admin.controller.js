const db = require('../config/db');
const bcrypt = require('bcryptjs');

// 1. GET /api/admin/users: Lấy danh sách tài khoản & thống kê
exports.getUsers = async (req, res) => {
  try {
    const { search = '', role = 'ALL', status = 'ALL' } = req.query;

    let query = `
      SELECT id, name, email, username, role, status, avatar, phone, 
             DATE_FORMAT(created_at, '%d/%m/%Y') AS createdAt
      FROM users
      WHERE 1=1
    `;
    const params = [];

    // Tìm kiếm theo tên, email hoặc username
    if (search.trim()) {
      query += ` AND (LOWER(name) LIKE ? OR LOWER(email) LIKE ? OR LOWER(username) LIKE ?)`;
      const kw = `%${search.trim().toLowerCase()}%`;
      params.push(kw, kw, kw);
    }

    // Lọc theo vai trò
    if (role !== 'ALL') {
      if (role === 'Thực tập sinh') {
        query += ` AND (role = 'Thực tập sinh' OR role = 'INTERN')`;
      } else if (role === 'HR Manager') {
        query += ` AND (role = 'HR Manager' OR role = 'HR')`;
      } else {
        query += ` AND role = ?`;
        params.push(role);
      }
    }

    // Lọc theo trạng thái
    if (status !== 'ALL') {
      query += ` AND status = ?`;
      params.push(status);
    }

    query += ` ORDER BY id DESC`;

    const [users] = await db.query(query, params);

    // Tính toán số liệu thống kê tổng quan (cho các thẻ stats)
    const [allUsers] = await db.query('SELECT role, status FROM users');
    const total = allUsers.length;
    const hrCount = allUsers.filter(u => u.role === 'HR Manager' || u.role === 'HR').length;
    const mentorCount = allUsers.filter(u => u.role === 'Mentor').length;
    const internCount = allUsers.filter(u => u.role === 'Thực tập sinh' || u.role === 'INTERN').length;
    const activeCount = allUsers.filter(u => u.status === 'active').length;
    const lockedCount = allUsers.filter(u => u.status === 'locked').length;

    res.json({
      success: true,
      users,
      stats: {
        total,
        hrCount,
        mentorCount,
        internCount,
        activeCount,
        lockedCount
      }
    });
  } catch (error) {
    console.error('❌ Lỗi lấy danh sách tài khoản Admin:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ khi lấy danh sách tài khoản!' });
  }
};

// 2. POST /api/admin/users: Tạo tài khoản mới (User Story 39)
exports.createUser = async (req, res) => {
  try {
    const { name, email, username, password, role, status = 'active' } = req.body;

    // Validate dữ liệu
    if (!name || !email || !username || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ các thông tin bắt buộc (*)'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu phải có độ dài tối thiểu 6 ký tự!'
      });
    }

    // Kiểm tra trùng Email
    const [existEmail] = await db.query('SELECT id FROM users WHERE email = ?', [email.trim()]);
    if (existEmail.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Email "${email}" đã tồn tại trong hệ thống!`
      });
    }

    // Kiểm tra trùng Username
    const [existUsername] = await db.query('SELECT id FROM users WHERE username = ?', [username.trim()]);
    if (existUsername.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Tên đăng nhập "${username}" đã tồn tại trong hệ thống!`
      });
    }

    // Mã hóa mật khẩu bằng bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Chuẩn hóa tên vai trò
    let standardRole = role;
    if (role === 'HR') standardRole = 'HR Manager';
    if (role === 'INTERN') standardRole = 'Thực tập sinh';

    // Thêm vào bảng users
    const [result] = await db.query(
      `INSERT INTO users (name, email, username, password, role, status) VALUES (?, ?, ?, ?, ?, ?)`,
      [name.trim(), email.trim(), username.trim(), hashedPassword, standardRole, status]
    );

    const newUserId = result.insertId;

    // Nếu tạo tài khoản là Thực tập sinh, tự động tạo sẵn hồ sơ trong bảng interns
    if (standardRole === 'Thực tập sinh' || standardRole === 'INTERN') {
      await db.query(
        `INSERT INTO interns (user_id, name, email, school, major, dept, status) 
         VALUES (?, ?, ?, 'Chưa cập nhật', 'Chưa cập nhật', 'Chưa phân bổ', 'Chưa hoàn thiện')`,
        [newUserId, name.trim(), email.trim()]
      );
    }

    res.status(201).json({
      success: true,
      message: `Tạo tài khoản cho "${name}" thành công!`,
      user: {
        id: newUserId,
        name: name.trim(),
        email: email.trim(),
        username: username.trim(),
        role: standardRole,
        status: status
      }
    });
  } catch (error) {
    console.error('❌ Lỗi tạo tài khoản mới:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ khi tạo tài khoản!' });
  }
};

// 3. PUT /api/admin/users/:id: Cập nhật thông tin tài khoản
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, username, role, status, password } = req.body;

    if (!name || !email || !username || !role) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin bắt buộc (*)'
      });
    }

    // Kiểm tra trùng lặp email với user khác
    const [existEmail] = await db.query('SELECT id FROM users WHERE email = ? AND id != ?', [email.trim(), id]);
    if (existEmail.length > 0) {
      return res.status(400).json({ success: false, message: 'Email đã được sử dụng bởi tài khoản khác!' });
    }

    // Kiểm tra trùng lặp username với user khác
    const [existUsername] = await db.query('SELECT id FROM users WHERE username = ? AND id != ?', [username.trim(), id]);
    if (existUsername.length > 0) {
      return res.status(400).json({ success: false, message: 'Tên đăng nhập đã được sử dụng bởi tài khoản khác!' });
    }

    // Chuẩn hóa tên vai trò
    let standardRole = role;
    if (role === 'HR') standardRole = 'HR Manager';
    if (role === 'INTERN') standardRole = 'Thực tập sinh';

    // Nếu có đổi mật khẩu
    if (password && password.trim().length >= 6) {
      const hashedPassword = await bcrypt.hash(password.trim(), 10);
      await db.query(
        `UPDATE users SET name = ?, email = ?, username = ?, role = ?, status = ?, password = ? WHERE id = ?`,
        [name.trim(), email.trim(), username.trim(), standardRole, status || 'active', hashedPassword, id]
      );
    } else {
      await db.query(
        `UPDATE users SET name = ?, email = ?, username = ?, role = ?, status = ? WHERE id = ?`,
        [name.trim(), email.trim(), username.trim(), standardRole, status || 'active', id]
      );
    }

    res.json({ success: true, message: 'Cập nhật tài khoản thành công!' });
  } catch (error) {
    console.error('❌ Lỗi cập nhật tài khoản:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ khi cập nhật tài khoản!' });
  }
};

// 4. PATCH /api/admin/users/:id/status: Khóa / Mở khóa tài khoản
exports.toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const [users] = await db.query('SELECT status, name FROM users WHERE id = ?', [id]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản!' });
    }

    const currentStatus = users[0].status;
    const newStatus = currentStatus === 'active' ? 'locked' : 'active';

    await db.query('UPDATE users SET status = ? WHERE id = ?', [newStatus, id]);

    res.json({
      success: true,
      status: newStatus,
      message: newStatus === 'locked' ? `Đã khóa tài khoản "${users[0].name}"!` : `Đã mở khóa tài khoản "${users[0].name}"!`
    });
  } catch (error) {
    console.error('❌ Lỗi thay đổi trạng thái tài khoản:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ khi thay đổi trạng thái!' });
  }
};

// 5. GET /api/admin/permissions: Lấy ma trận phân quyền (User Story 40)
exports.getPermissions = async (req, res) => {
  try {
    const { role } = req.query;

    if (role) {
      const [rows] = await db.query('SELECT permissions FROM role_permissions WHERE role = ?', [role]);
      if (rows.length > 0) {
        let perms = rows[0].permissions;
        if (typeof perms === 'string') {
          try { perms = JSON.parse(perms); } catch (e) {}
        }
        return res.json({ success: true, role, permissions: perms });
      }
    }

    // Nếu không truyền role, trả về toàn bộ
    const [allRows] = await db.query('SELECT role, permissions FROM role_permissions');
    const result = {};
    allRows.forEach(row => {
      let p = row.permissions;
      if (typeof p === 'string') {
        try { p = JSON.parse(p); } catch (e) {}
      }
      result[row.role] = p;
    });

    res.json({ success: true, permissions: result });
  } catch (error) {
    console.error('❌ Lỗi lấy ma trận quyền:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ khi lấy ma trận quyền!' });
  }
};

// 6. PUT /api/admin/permissions: Cập nhật ma trận quyền chi tiết (User Story 40)
exports.updatePermissions = async (req, res) => {
  try {
    const { role, permissions } = req.body;

    if (!role || !permissions) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin vai trò hoặc quyền cấu hình!' });
    }

    const jsonString = typeof permissions === 'string' ? permissions : JSON.stringify(permissions);

    await db.query(
      `INSERT INTO role_permissions (role, permissions) VALUES (?, ?)
       ON DUPLICATE KEY UPDATE permissions = VALUES(permissions)`,
      [role, jsonString]
    );

    res.json({
      success: true,
      message: `Đã lưu cấu hình phân quyền cho vai trò "${role}" thành công!`
    });
  } catch (error) {
    console.error('❌ Lỗi lưu ma trận quyền:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ khi lưu phân quyền!' });
  }
};
