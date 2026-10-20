const db = require('../config/db');

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

    // Bảo vệ quyền xem: TTS chỉ thấy đơn của mình (B04)
    if (req.user && req.user.role === 'Thực tập sinh') {
      const myInternId = req.user.internId || (await resolveInternId(req.user.id));
      sql += ' AND (l.intern_id = ? OR i.user_id = ?)';
      params.push(myInternId, req.user.id);
    } else if (intern_id) {
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

    let targetInternId = null;
    if (req.user && req.user.role === 'Thực tập sinh') {
      targetInternId = req.user.internId || (await resolveInternId(req.user.id));
    } else {
      if (!intern_id) {
        return res.status(400).json({ success: false, message: 'Vui lòng cung cấp intern_id' });
      }
      targetInternId = await resolveInternId(intern_id);
    }

    if (!targetInternId || !start_date || !end_date || !reason || !reason.trim()) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin xin nghỉ phép (ngày bắt đầu, kết thúc và lý do)' });
    }

    const start = new Date(start_date);
    const end = new Date(end_date);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ success: false, message: 'Định dạng ngày tháng không hợp lệ (YYYY-MM-DD)' });
    }

    // Chặn end_date < start_date (B14)
    if (end < start) {
      return res.status(400).json({ success: false, message: 'Ngày kết thúc nghỉ phép không được nhỏ hơn ngày bắt đầu!' });
    }

    const diffDays = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;

    // Kiểm tra trùng hoặc chồng lấn khoảng thời gian nghỉ phép (B14)
    const [overlap] = await db.query(`
      SELECT id FROM leave_requests 
      WHERE intern_id = ? 
        AND status != 'rejected'
        AND NOT (end_date < ? OR start_date > ?)
    `, [targetInternId, start_date, end_date]);

    if (overlap.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Bạn đã có đơn nghỉ phép trùng hoặc chồng lấn với khoảng thời gian đã chọn!'
      });
    }

    const [result] = await db.query(`
      INSERT INTO leave_requests (intern_id, leave_type, start_date, end_date, days_count, reason, status)
      VALUES (?, ?, ?, ?, ?, ?, 'pending')
    `, [targetInternId, leave_type || 'Việc cá nhân', start_date, end_date, diffDays, reason.trim()]);

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
      return res.status(400).json({ success: false, message: 'Trạng thái xét duyệt không hợp lệ (chỉ chấp nhận approved hoặc rejected)' });
    }

    const [existing] = await db.query('SELECT * FROM leave_requests WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn nghỉ phép' });
    }

    const leave = existing[0];
    const previousStatus = leave.status;

    await db.query(`
      UPDATE leave_requests
      SET status = ?, review_note = ?, reviewed_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [status, review_note || null, id]);

    // Tạo danh sách các ngày trong khoảng nghỉ
    const startObj = new Date(leave.start_date);
    const endObj = new Date(leave.end_date);
    const dateList = [];
    let cur = new Date(startObj);
    while (cur <= endObj) {
      dateList.push(cur.toISOString().slice(0, 10));
      cur.setDate(cur.getDate() + 1);
    }

    // Nếu duyệt đơn -> Đánh dấu ngày nghỉ (P) vào attendance, nhưng KHÔNG đè lên ngày đã đi làm 'present' (B14)
    if (status === 'approved') {
      for (const dStr of dateList) {
        const [attRow] = await db.query('SELECT status FROM attendance WHERE intern_id = ? AND date = ?', [leave.intern_id, dStr]);
        if (attRow.length === 0) {
          await db.query(`
            INSERT INTO attendance (intern_id, date, status, notes)
            VALUES (?, ?, 'leave', 'Nghỉ phép có phép')
          `, [leave.intern_id, dStr]);
        } else if (attRow[0].status !== 'present' && attRow[0].status !== 'late') {
          await db.query(`
            UPDATE attendance SET status = 'leave', notes = 'Nghỉ phép có phép'
            WHERE intern_id = ? AND date = ?
          `, [leave.intern_id, dStr]);
        }
      }
    } else if (status === 'rejected' && previousStatus === 'approved') {
      // Nếu đổi từ duyệt sang từ chối -> Gỡ bỏ các dòng attendance 'leave' đã tự động sinh (B14)
      for (const dStr of dateList) {
        await db.query(`
          DELETE FROM attendance 
          WHERE intern_id = ? AND date = ? AND status = 'leave'
        `, [leave.intern_id, dStr]);
      }
    }

    res.json({
      success: true,
      message: status === 'approved' ? 'Đã duyệt đơn nghỉ phép' : 'Đã từ chối đơn nghỉ phép'
    });
  } catch (error) {
    console.error('Lỗi xét duyệt nghỉ phép:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ' });
  }
};
