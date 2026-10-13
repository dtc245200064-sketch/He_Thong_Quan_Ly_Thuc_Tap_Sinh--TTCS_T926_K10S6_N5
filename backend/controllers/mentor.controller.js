const db = require('../config/db');

// GET /api/mentors: Lấy danh sách mentor kèm số lượng TTS đang quản lý (STT 31)
exports.getMentors = async (req, res) => {
  try {
    const { status } = req.query;
    let whereClause = '';
    const params = [];
    if (status) {
      whereClause = 'WHERE m.status = ?';
      params.push(status);
    }
    const query = `
      SELECT m.*, 
             COUNT(i.id) as current_interns,
             COALESCE(GROUP_CONCAT(i.id SEPARATOR ','), '') as intern_ids,
             COALESCE(GROUP_CONCAT(i.name SEPARATOR ', '), '') as intern_names
      FROM mentors m
      LEFT JOIN interns i ON i.mentor = m.name OR i.mentor LIKE CONCAT('%', m.name, '%')
      ${whereClause}
      GROUP BY m.id
      ORDER BY m.id ASC
    `;
    const [rows] = await db.query(query, params);

    return res.status(200).json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Lỗi lấy danh sách mentor:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi lấy danh sách mentor', error: error.message });
  }
};

// POST /api/mentors: HR thêm mới mentor (STT 29)
exports.createMentor = async (req, res) => {
  try {
    const { name, email, phone, dept, position, max_interns } = req.body;

    if (!name || !email || !dept) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền họ tên, email và phòng ban của mentor!' });
    }

    // Kiểm tra trùng email
    const [existing] = await db.query('SELECT id FROM mentors WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Email mentor này đã tồn tại trong hệ thống!' });
    }

    // Tự động kiểm tra/tạo tài khoản user vai trò Mentor
    let userId = null;
    const [userRows] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (userRows.length > 0) {
      userId = userRows[0].id;
    }

    const [result] = await db.query(
      `INSERT INTO mentors (user_id, name, email, phone, dept, position, max_interns, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'active')`,
      [userId, name, email, phone || '', dept, position || 'Senior Mentor', Number(max_interns) || 5]
    );

    return res.status(201).json({
      success: true,
      message: 'Thêm mới mentor thành công!',
      mentorId: result.insertId
    });
  } catch (error) {
    console.error('Lỗi thêm mentor:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi thêm mentor', error: error.message });
  }
};

// PUT /api/mentors/:id: Cập nhật thông tin mentor
exports.updateMentor = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, dept, position, max_interns, status } = req.body;

    const mentorStatus = (status === 'Tạm ngưng' || status === 'inactive') ? 'inactive' : 'active';

    await db.query(
      `UPDATE mentors 
       SET name = ?, email = ?, phone = ?, dept = ?, position = ?, max_interns = ?, status = ? 
       WHERE id = ?`,
      [name, email, phone || '', dept, position || 'Senior Mentor', Number(max_interns) || 5, mentorStatus, id]
    );

    return res.status(200).json({ success: true, message: 'Cập nhật thông tin mentor thành công!' });
  } catch (error) {
    console.error('Lỗi cập nhật mentor:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật mentor', error: error.message });
  }
};

// DELETE /api/mentors/:id: Xóa mentor
exports.deleteMentor = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("UPDATE mentors SET status = 'inactive' WHERE id = ?", [id]);
    return res.status(200).json({ success: true, message: 'Đã ngừng kích hoạt mentor thành công!' });
  } catch (error) {
    console.error('Lỗi xóa mentor:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi xóa mentor', error: error.message });
  }
};

// POST /api/mentors/assign: HR gán mentor cho thực tập sinh (STT 30)
exports.assignMentor = async (req, res) => {
  try {
    const { intern_id, mentor_name, mentor_id } = req.body;

    if (!intern_id || (!mentor_name && !mentor_id)) {
      return res.status(400).json({ success: false, message: 'Vui lòng chọn thực tập sinh và mentor cần gán!' });
    }

    let resolvedMentorName = mentor_name;
    if (!resolvedMentorName && mentor_id) {
      const [mRows] = await db.query('SELECT name FROM mentors WHERE id = ?', [mentor_id]);
      if (mRows.length > 0) resolvedMentorName = mRows[0].name;
    }

    await db.query('UPDATE interns SET mentor = ? WHERE id = ?', [resolvedMentorName, intern_id]);

    return res.status(200).json({
      success: true,
      message: `Đã phân công mentor ${resolvedMentorName} cho thực tập sinh thành công!`
    });
  } catch (error) {
    console.error('Lỗi gán mentor:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi phân công mentor', error: error.message });
  }
};
