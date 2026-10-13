const db = require('../config/db');

// Hàm giải quyết intern_id (nếu truyền user_id thì tự động tìm id của thực tập sinh trong bảng interns)
async function resolveInternId(internIdOrUserId) {
  if (!internIdOrUserId) return null;
  const [internCheck] = await db.query('SELECT id FROM interns WHERE id = ?', [internIdOrUserId]);
  if (internCheck.length > 0) return internCheck[0].id;

  const [userCheck] = await db.query('SELECT id FROM interns WHERE user_id = ?', [internIdOrUserId]);
  if (userCheck.length > 0) return userCheck[0].id;

  return internIdOrUserId;
}

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
      const resolvedId = await resolveInternId(intern_id);
      sql += ' AND (l.intern_id = ? OR i.user_id = ?)';
      params.push(resolvedId, intern_id);
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

    const resolvedId = await resolveInternId(intern_id);
    const diffTime = Math.abs(new Date(end_date) - new Date(start_date));
    const days_count = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const [result] = await db.query(`
      INSERT INTO leave_requests (intern_id, leave_type, start_date, end_date, days_count, reason, status)
      VALUES (?, ?, ?, ?, ?, ?, 'pending')
    `, [resolvedId, leave_type || 'Việc cá nhân', start_date, end_date, days_count, reason]);

    const [created] = await db.query('SELECT * FROM leave_requests WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, message: 'Gửi đơn nghỉ phép thành công', data: created[0] });
  } catch (error) {
    console.error('Lỗi tạo đơn nghỉ phép:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ' });
  }
};

// PATCH /api/leaves/:id/review (HR duyệt hoặc từ chối)
exports.reviewLeave = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const note = typeof req.body.review_note === 'string' ? req.body.review_note.trim() : '';
  if (!['approved', 'rejected'].includes(status) || (status === 'rejected' && !note) || note.length > 1000) {
    return res.status(400).json({ success: false, message: 'Chọn trạng thái hợp lệ; từ chối phải có lý do (tối đa 1000 ký tự)' });
  }
  let conn;
  try {
    conn = await db.getConnection(); await conn.beginTransaction();
    const [rows] = await conn.query('SELECT * FROM leave_requests WHERE id = ? FOR UPDATE', [id]);
    if (!rows.length) { await conn.rollback(); return res.status(404).json({ success: false, message: 'Không tìm thấy đơn nghỉ phép' }); }
    const leave = rows[0];
    if (leave.status !== 'pending') { await conn.rollback(); return res.status(409).json({ success: false, message: 'Đơn đã được xử lý. Hãy tải lại danh sách.' }); }
    await conn.query('UPDATE leave_requests SET status = ?, review_note = ?, reviewed_at = CURRENT_TIMESTAMP WHERE id = ?', [status, note || null, id]);
    if (status === 'approved') {
      const curr = new Date(leave.start_date), end = new Date(leave.end_date);
      if (!Number.isFinite(curr.getTime()) || !Number.isFinite(end.getTime()) || curr > end) throw new Error('Invalid leave dates');
      while (curr <= end) {
        const date = `${curr.getFullYear()}-${String(curr.getMonth()+1).padStart(2,'0')}-${String(curr.getDate()).padStart(2,'0')}`;
        await conn.query("INSERT INTO attendance (intern_id, date, status, notes) VALUES (?, ?, 'leave', 'Nghỉ phép theo đơn duyệt') ON DUPLICATE KEY UPDATE status = 'leave', notes = 'Nghỉ phép theo đơn duyệt'", [leave.intern_id, date]);
        curr.setDate(curr.getDate()+1);
      }
    }
    await conn.commit(); res.json({ success: true, message: 'Đã xử lý đơn nghỉ phép' });
  } catch (e) {
    if (conn) await conn.rollback();
    res.status(500).json({ success: false, message: 'Không thể xử lý đơn nghỉ phép' });
  } finally { if (conn) conn.release(); }
};
