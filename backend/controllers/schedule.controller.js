const db = require('../config/db');

// GET /api/schedules: Lấy danh sách lịch thực tập (theo intern_id hoặc khoảng ngày)
exports.getSchedules = async (req, res) => {
  try {
    const { intern_id, from, to, mentor_id } = req.query;
    let query = `
      SELECT s.*, 
             COALESCE(m.name, 'Chưa phân công') AS mentor_name,
             COALESCE(i.name, '') AS intern_name
      FROM intern_schedules s
      LEFT JOIN mentors m ON s.mentor_id = m.id
      LEFT JOIN interns i ON s.intern_id = i.id
      WHERE 1=1
    `;
    const params = [];

    // Bảo vệ quyền xem IDOR: TTS chỉ xem lịch của chính mình (B04 & S2-18)
    if (req.user && req.user.role === 'Thực tập sinh') {
      const myInternId = req.user.internId || -1;
      query += ` AND (s.intern_id = ? OR i.user_id = ?)`;
      params.push(myInternId, req.user.id);
    } else if (intern_id) {
      query += ` AND (s.intern_id = ? OR i.user_id = ?)`;
      params.push(intern_id, intern_id);
    }

    if (from) {
      query += ` AND s.schedule_date >= ?`;
      params.push(from);
    }
    if (to) {
      query += ` AND s.schedule_date <= ?`;
      params.push(to);
    }
    if (mentor_id) {
      query += ` AND s.mentor_id = ?`;
      params.push(mentor_id);
    }

    query += ` ORDER BY s.schedule_date ASC, s.start_time ASC`;

    const [rows] = await db.query(query, params);
    return res.status(200).json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Lỗi lấy danh sách lịch thực tập:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách lịch thực tập',
      error: error.message
    });
  }
};

// POST /api/schedules: Thêm mới lịch làm việc / đào tạo cho thực tập sinh
exports.createSchedule = async (req, res) => {
  try {
    const {
      intern_id,
      schedule_date,
      start_time = '08:30',
      end_time = '17:30',
      title,
      content,
      location = 'Văn phòng CodeGym',
      mentor_id,
      schedule_type = 'working',
      status = 'scheduled'
    } = req.body;

    if (!intern_id || !schedule_date || !title) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp thực tập sinh, ngày làm việc và tiêu đề lịch!'
      });
    }

    if (end_time && start_time && end_time <= start_time) {
      return res.status(400).json({
        success: false,
        message: 'Giờ kết thúc ca làm việc phải sau giờ bắt đầu!'
      });
    }

    // Tra cứu intern_id thực tế
    let [internRows] = await db.query('SELECT id, mentor_id, user_id FROM interns WHERE id = ?', [intern_id]);
    if (internRows.length === 0) {
      [internRows] = await db.query('SELECT id, mentor_id, user_id FROM interns WHERE user_id = ?', [intern_id]);
    }
    if (internRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thực tập sinh!'
      });
    }

    const actualInternId = internRows[0].id;
    const assignedMentorId = mentor_id || internRows[0].mentor_id || null;

    const [result] = await db.query(
      `INSERT INTO intern_schedules (intern_id, schedule_date, start_time, end_time, title, content, location, mentor_id, schedule_type, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [actualInternId, schedule_date, start_time, end_time, title.trim(), content || '', location, assignedMentorId, schedule_type, status]
    );

    const [created] = await db.query('SELECT * FROM intern_schedules WHERE id = ?', [result.insertId]);
    return res.status(201).json({
      success: true,
      message: 'Thiết lập lịch thực tập thành công!',
      data: created[0]
    });
  } catch (error) {
    console.error('Lỗi tạo lịch thực tập:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi tạo lịch thực tập',
      error: error.message
    });
  }
};

// PUT /api/schedules/:id: Cập nhật lịch làm việc
exports.updateSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { schedule_date, start_time, end_time, title, content, location, mentor_id, schedule_type, status } = req.body;

    const [existing] = await db.query('SELECT * FROM intern_schedules WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy lịch thực tập!' });
    }

    if (start_time && end_time && end_time <= start_time) {
      return res.status(400).json({ success: false, message: 'Giờ kết thúc phải sau giờ bắt đầu!' });
    }

    await db.query(
      `UPDATE intern_schedules 
       SET schedule_date = COALESCE(?, schedule_date),
           start_time = COALESCE(?, start_time),
           end_time = COALESCE(?, end_time),
           title = COALESCE(?, title),
           content = COALESCE(?, content),
           location = COALESCE(?, location),
           mentor_id = COALESCE(?, mentor_id),
           schedule_type = COALESCE(?, schedule_type),
           status = COALESCE(?, status),
           updated_at = NOW()
       WHERE id = ?`,
      [schedule_date, start_time, end_time, title, content, location, mentor_id, schedule_type, status, id]
    );

    return res.status(200).json({ success: true, message: 'Cập nhật lịch thực tập thành công!' });
  } catch (error) {
    console.error('Lỗi cập nhật lịch thực tập:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật lịch thực tập',
      error: error.message
    });
  }
};

// DELETE /api/schedules/:id: Xóa lịch làm việc
exports.deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query('DELETE FROM intern_schedules WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy lịch thực tập để xóa!' });
    }
    return res.status(200).json({ success: true, message: 'Xóa lịch thực tập thành công!' });
  } catch (error) {
    console.error('Lỗi xóa lịch thực tập:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi xóa lịch thực tập',
      error: error.message
    });
  }
};
