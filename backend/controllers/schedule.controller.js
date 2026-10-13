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

    if (intern_id) {
      query += ` AND s.intern_id = ?`;
      params.push(intern_id);
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
      schedule_type = 'working'
    } = req.body;

    if (!intern_id || !schedule_date || !title) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đủ thông tin thực tập sinh, ngày và tiêu đề lịch!'
      });
    }

    const [result] = await db.query(
      `INSERT INTO intern_schedules (intern_id, schedule_date, start_time, end_time, title, content, location, mentor_id, schedule_type, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'scheduled')`,
      [intern_id, schedule_date, start_time, end_time, title.trim(), content ? content.trim() : null, location ? location.trim() : 'Văn phòng CodeGym', mentor_id ? Number(mentor_id) : null, schedule_type]
    );

    return res.status(201).json({
      success: true,
      message: 'Tạo lịch thực tập thành công!',
      scheduleId: result.insertId
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
    const {
      schedule_date,
      start_time,
      end_time,
      title,
      content,
      location,
      mentor_id,
      schedule_type,
      status
    } = req.body;

    const [existing] = await db.query('SELECT * FROM intern_schedules WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy lịch thực tập cần cập nhật!'
      });
    }

    const current = existing[0];
    await db.query(
      `UPDATE intern_schedules 
       SET schedule_date = ?, start_time = ?, end_time = ?, title = ?, content = ?, location = ?, mentor_id = ?, schedule_type = ?, status = ?
       WHERE id = ?`,
      [
        schedule_date || current.schedule_date,
        start_time || current.start_time,
        end_time || current.end_time,
        title ? title.trim() : current.title,
        content !== undefined ? (content ? content.trim() : null) : current.content,
        location !== undefined ? location : current.location,
        mentor_id !== undefined ? (mentor_id ? Number(mentor_id) : null) : current.mentor_id,
        schedule_type || current.schedule_type,
        status || current.status,
        id
      ]
    );

    return res.status(200).json({
      success: true,
      message: 'Cập nhật lịch thực tập thành công!'
    });
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
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy lịch thực tập để xóa!'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Đã xóa lịch thực tập thành công!'
    });
  } catch (error) {
    console.error('Lỗi xóa lịch thực tập:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi xóa lịch thực tập',
      error: error.message
    });
  }
};
