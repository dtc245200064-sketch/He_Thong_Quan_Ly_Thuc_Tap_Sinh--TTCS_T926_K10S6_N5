const db = require('../config/db');

// GET /api/mentors/available-users: Lấy danh sách tài khoản User vai trò Mentor đang hoạt động & chưa liên kết hồ sơ
exports.getAvailableMentorUsers = async (req, res) => {
  try {
    const { current_mentor_id } = req.query;
    let query = `
      SELECT u.id, u.name, u.email, u.phone, u.username, u.role, u.status, u.avatar
      FROM users u 
      WHERE (u.role = 'Mentor' OR u.role = 'MENTOR')
        AND u.status = 'active'
    `;
    const params = [];
    if (current_mentor_id) {
      query += ` AND (u.id NOT IN (SELECT user_id FROM mentors WHERE user_id IS NOT NULL AND id != ?) OR u.id = (SELECT user_id FROM mentors WHERE id = ?))`;
      params.push(current_mentor_id, current_mentor_id);
    } else {
      query += ` AND u.id NOT IN (SELECT user_id FROM mentors WHERE user_id IS NOT NULL)`;
    }
    query += ` ORDER BY u.name ASC`;

    const [rows] = await db.query(query, params);
    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error('Lỗi lấy tài khoản mentor khả dụng:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi lấy tài khoản mentor khả dụng', error: error.message });
  }
};

// GET /api/mentors: Lấy danh sách mentor kèm số lượng TTS đang quản lý (STT 31) - Đếm chuẩn theo mentor_id (B18)
exports.getMentors = async (req, res) => {
  try {
    const { status } = req.query;
    let whereClause = '';
    const params = [];
    if (status) {
      whereClause = 'WHERE m.status = ?';
      params.push(status);
    }
    // B18: Ghép chuẩn bằng mentor_id, loại bỏ LIKE %name% gây đếm sai
    const query = `
      SELECT m.*, 
             COUNT(i.id) as current_interns,
             COALESCE(GROUP_CONCAT(i.id SEPARATOR ','), '') as intern_ids,
             COALESCE(GROUP_CONCAT(i.name SEPARATOR ', '), '') as intern_names
      FROM mentors m
      LEFT JOIN interns i ON i.mentor_id = m.id
      ${whereClause}
      GROUP BY m.id
      ORDER BY m.id ASC
    `;
    const [rows] = await db.query(query, params);

    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error('Lỗi lấy danh sách mentor:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi lấy danh sách mentor', error: error.message });
  }
};

// POST /api/mentors: HR thêm mới mentor (STT 29)
exports.createMentor = async (req, res) => {
  try {
    const { user_id, name, email, phone, dept, position, max_interns } = req.body;

    let selectedUserId = user_id ? Number(user_id) : null;
    let mentorName = (name || '').trim();
    let mentorEmail = (email || '').trim();
    let mentorPhone = (phone || '').trim();

    if (selectedUserId) {
      const [uRows] = await db.query('SELECT name, email, phone FROM users WHERE id = ?', [selectedUserId]);
      if (uRows.length > 0) {
        if (!mentorName) mentorName = uRows[0].name;
        if (!mentorEmail) mentorEmail = uRows[0].email;
        if (!mentorPhone) mentorPhone = uRows[0].phone || '';
      }
    }

    if (!mentorName || !mentorEmail || !dept) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ họ tên, email và phòng ban!' });
    }

    // Kiểm tra trùng Email mentor (B18)
    const [existing] = await db.query('SELECT id FROM mentors WHERE email = ?', [mentorEmail]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Email mentor đã tồn tại trong hệ thống!' });
    }

    const [result] = await db.query(
      `INSERT INTO mentors (user_id, name, email, phone, dept, position, max_interns, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 'active')`,
      [selectedUserId, mentorName, mentorEmail, mentorPhone, dept, position || 'Senior Mentor', Number(max_interns) || 5]
    );

    const [created] = await db.query('SELECT * FROM mentors WHERE id = ?', [result.insertId]);
    return res.status(201).json({
      success: true,
      message: 'Thêm mới mentor thành công!',
      data: created[0]
    });
  } catch (error) {
    console.error('Lỗi tạo mentor:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi tạo mentor', error: error.message });
  }
};

// PUT /api/mentors/:id: Cập nhật mentor (Hỗ trợ partial update - B18)
exports.updateMentor = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id, name, email, phone, dept, position, max_interns, status } = req.body;

    const [existing] = await db.query('SELECT * FROM mentors WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thông tin mentor!' });
    }

    const current = existing[0];
    const newName = name !== undefined ? name.trim() : current.name;
    const newEmail = email !== undefined ? email.trim() : current.email;
    const newPhone = phone !== undefined ? phone.trim() : current.phone;
    const newDept = dept !== undefined ? dept.trim() : current.dept;
    const newPos = position !== undefined ? position.trim() : current.position;
    const newMax = max_interns !== undefined ? Number(max_interns) : current.max_interns;
    const newStatus = status !== undefined ? status : current.status;
    const newUserId = user_id !== undefined ? (user_id ? Number(user_id) : null) : current.user_id;

    // Kiểm tra trùng email với mentor khác nếu đổi email
    if (newEmail !== current.email) {
      const [dup] = await db.query('SELECT id FROM mentors WHERE email = ? AND id != ?', [newEmail, id]);
      if (dup.length > 0) {
        return res.status(400).json({ success: false, message: 'Email đã được sử dụng bởi mentor khác!' });
      }
    }

    await db.query(
      `UPDATE mentors 
       SET user_id = ?, name = ?, email = ?, phone = ?, dept = ?, position = ?, max_interns = ?, status = ? 
       WHERE id = ?`,
      [newUserId, newName, newEmail, newPhone, newDept, newPos, newMax, newStatus, id]
    );

    return res.status(200).json({ success: true, message: 'Cập nhật thông tin mentor thành công!' });
  } catch (error) {
    console.error('Lỗi cập nhật mentor:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật mentor', error: error.message });
  }
};

// DELETE /api/mentors/:id: Vô hiệu hóa mentor
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

// POST /api/mentors/assign: HR gán mentor cho thực tập sinh (STT 30) - Kiểm tra max_interns và status (B18 & S3-24)
exports.assignMentor = async (req, res) => {
  try {
    const { intern_id, mentor_name, mentor_id } = req.body;

    if (!intern_id) {
      return res.status(400).json({ success: false, message: 'Vui lòng chọn thực tập sinh cần gán!' });
    }

    let resolvedMentorName = (mentor_name || '').trim();
    let resolvedMentorId = mentor_id ? Number(mentor_id) : null;

    if (resolvedMentorName === 'Chưa gán' || resolvedMentorName === 'Chưa phân công' || (!resolvedMentorId && !resolvedMentorName)) {
      await db.query('UPDATE interns SET mentor = ?, mentor_id = NULL WHERE id = ?', ['Chưa gán', intern_id]);
      return res.status(200).json({
        success: true,
        message: 'Đã hủy phân công mentor cho thực tập sinh!'
      });
    }

    // Tra cứu thông tin mentor
    let mentorRecord = null;
    if (resolvedMentorId) {
      const [mRows] = await db.query('SELECT * FROM mentors WHERE id = ?', [resolvedMentorId]);
      if (mRows.length > 0) mentorRecord = mRows[0];
    } else if (resolvedMentorName) {
      const [mRows] = await db.query('SELECT * FROM mentors WHERE name = ? LIMIT 1', [resolvedMentorName]);
      if (mRows.length > 0) mentorRecord = mRows[0];
    }

    if (!mentorRecord) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy hồ sơ mentor!' });
    }

    // Chặn gán mentor đã tạm ngừng hoạt động (B18)
    if (mentorRecord.status === 'inactive') {
      return res.status(400).json({
        success: false,
        message: `Mentor "${mentorRecord.name}" hiện đang tạm ngừng hoạt động, không thể phân công!`
      });
    }

    // Kiểm tra sức chứa max_interns (B18 & S3-24)
    const [countRows] = await db.query('SELECT COUNT(*) as currentCount FROM interns WHERE mentor_id = ? AND id != ?', [mentorRecord.id, intern_id]);
    const currentCount = countRows[0].currentCount;
    if (currentCount >= (mentorRecord.max_interns || 5)) {
      return res.status(400).json({
        success: false,
        message: `Mentor "${mentorRecord.name}" đã đạt số lượng thực tập sinh tối đa (${currentCount}/${mentorRecord.max_interns || 5})!`
      });
    }

    await db.query('UPDATE interns SET mentor = ?, mentor_id = ? WHERE id = ?', [mentorRecord.name, mentorRecord.id, intern_id]);

    return res.status(200).json({
      success: true,
      message: `Đã phân công mentor ${mentorRecord.name} (ID: ${mentorRecord.id}) cho thực tập sinh thành công!`,
      mentor_id: mentorRecord.id,
      mentor_name: mentorRecord.name
    });
  } catch (error) {
    console.error('Lỗi gán mentor:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi phân công mentor', error: error.message });
  }
};
