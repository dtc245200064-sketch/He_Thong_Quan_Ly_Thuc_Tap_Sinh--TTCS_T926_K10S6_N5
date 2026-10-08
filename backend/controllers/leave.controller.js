const db = require('../config/db');

// GET /api/leaves
exports.getLeaves = async (req, res) => {
  try {
    const { intern_id, status } = req.query;
    let sql = `
      SELECT l.*, i.name as intern_name, i.dept as intern_dept, i.school as intern_school, i.email as intern_email
      FROM leave_requests l
      JOIN interns i ON l.intern_id = i.id
      WHERE 1=1
    `;
    const params = [];

    if (intern_id) {
      sql += ' AND l.intern_id = ?';
      params.push(intern_id);
    }
    if (status) {
      sql += ' AND l.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY l.id DESC';
    const [rows] = await db.query(sql, params);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Lỗi lấy danh sách nghỉ phép:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ' });
  }
};

// POST /api/leaves (TTS gửi đơn xin nghỉ phép)
exports.createLeave = async (req, res) => {
  try {
    const { intern_id, leave_type, start_date, end_date, reason } = req.body;
    if (!intern_id || !start_date || !end_date || !reason) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin xin nghỉ phép' });
    }

    const diffTime = Math.abs(new Date(end_date) - new Date(start_date));
    const days_count = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const [result] = await db.query(`
      INSERT INTO leave_requests (intern_id, leave_type, start_date, end_date, days_count, reason, status)
      VALUES (?, ?, ?, ?, ?, ?, 'pending')
    `, [intern_id, leave_type || 'Việc cá nhân', start_date, end_date, days_count, reason]);

    const [created] = await db.query('SELECT * FROM leave_requests WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, message: 'Gửi đơn nghỉ phép thành công', data: created[0] });
  } catch (error) {
    console.error('Lỗi tạo đơn nghỉ phép:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ' });
  }
};

// PATCH /api/leaves/:id/review (HR duyệt hoặc từ chối)
exports.reviewLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, review_note } = req.body; // status: 'approved' | 'rejected'

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Trạng thái không hợp lệ' });
    }

    const [existing] = await db.query('SELECT * FROM leave_requests WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn nghỉ phép' });
    }

    const leave = existing[0];
    await db.query(`
      UPDATE leave_requests
      SET status = ?, review_note = ?, reviewed_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [status, review_note || null, id]);

    // Nếu duyệt đơn -> Tự động đánh dấu ngày nghỉ (P) vào bảng attendance
    if (status === 'approved') {
      let curr = new Date(leave.start_date);
      const end = new Date(leave.end_date);
      while (curr <= end) {
        const y = curr.getFullYear();
        const m = String(curr.getMonth() + 1).padStart(2, '0');
        const d = String(curr.getDate()).padStart(2, '0');
        const dateKey = `${y}-${m}-${d}`;

        await db.query(`
          INSERT INTO attendance (intern_id, date, status, notes)
          VALUES (?, ?, 'leave', 'Nghỉ phép theo đơn duyệt')
          ON DUPLICATE KEY UPDATE status = 'leave', notes = 'Nghỉ phép theo đơn duyệt'
        `, [leave.intern_id, dateKey]);

        curr.setDate(curr.getDate() + 1);
      }
    }

    res.json({ success: true, message: `Đã ${status === 'approved' ? 'duyệt' : 'từ chối'} đơn nghỉ phép thành công` });
  } catch (error) {
    console.error('Lỗi xét duyệt đơn nghỉ phép:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ' });
  }
};
