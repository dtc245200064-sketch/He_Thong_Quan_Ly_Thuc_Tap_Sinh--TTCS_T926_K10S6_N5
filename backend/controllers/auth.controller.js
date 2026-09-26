// ==============================================================================
// AUTH CONTROLLER (XÁC THỰC NGƯỜI DÙNG)
// ==============================================================================

// TODO: [Backend] Import Database Model hoặc kết nối DB tại đây
// Ví dụ: const User = require('../models/User');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const loginEmail = email || username;

    // TODO: [Backend] 1. Kiểm tra validation dữ liệu đầu vào (bắt buộc nhập email, password)
    // TODO: [Backend] 2. Viết câu lệnh truy vấn tìm User theo email trong Cơ sở dữ liệu
    // TODO: [Backend] 3. Sử dụng bcrypt kiểm tra mật khẩu đã hash:
    // const isMatch = await bcrypt.compare(password, user.password);
    // TODO: [Backend] 4. Khởi tạo JWT Token và trả về thông tin người dùng:
    // const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

    // Trả về phản hồi mẫu (Chờ Backend kết nối Database thực tế)
    return res.status(501).json({
      success: false,
      message: "Chức năng đăng nhập đang chờ Backend kết nối Cơ sở dữ liệu!",
      receivedData: {
        email: loginEmail || null
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi máy chủ",
      error: error.message
    });
  }
};
