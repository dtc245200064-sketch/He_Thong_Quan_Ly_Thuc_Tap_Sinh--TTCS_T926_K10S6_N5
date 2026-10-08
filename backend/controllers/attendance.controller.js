const db = require('../config/db');

// GET /api/attendance
exports.getAttendance = async (req, res) => {
  try {
    const { intern_id, month, year, date } = req.query;
    let sql = `
      SELECT a.*, i.name as intern_name, i.dept as intern_dept, i.school as intern_school
      FROM attendance a
      JOIN interns i ON a.intern_id = i.id
      WHERE 1=1
    `;
    const params = [];

    if (intern_id) {
      sql += ' AND a.intern_id = ?';
      params.push(intern_id);
    }
    if (date) {
      sql += ' AND a.date = ?';
      params.push(date);
    }
    if (month && year) {
      sql += ' AND MONTH(a.date) = ? AND YEAR(a.date) = ?';
      params.push(month, year);
    }

    sql += ' ORDER BY a.date DESC, a.id DESC';
    const [rows] = await db.query(sql, params);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Lỗi lấy dữ liệu chấm công:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ' });
  }
};

// POST /api/attendance/mark (HR chấm công nhanh theo ngày)
exports.markAttendance = async (req, res) => {
  try {
    const { intern_id, date, status, notes } = req.body;
    if (!intern_id || !date) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin intern_id hoặc date' });
    }

    if (!status) {
      // Xóa bản ghi chấm công nếu status rỗng (trả về trạng thái chưa chấm)
      await db.query('DELETE FROM attendance WHERE intern_id = ? AND date = ?', [intern_id, date]);
      return res.json({ success: true, message: 'Đã xóa bản ghi chấm công' });
    }

    await db.query(`
      INSERT INTO attendance (intern_id, date, status, notes)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE status = VALUES(status), notes = VALUES(notes)
    `, [intern_id, date, status, notes || null]);

    res.json({ success: true, message: 'Đã cập nhật trạng thái chấm công' });
  } catch (error) {
    console.error('Lỗi cập nhật chấm công:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ' });
  }
};

// POST /api/attendance/check-in-out (TTS tự check-in / check-out hàng ngày)
exports.toggleCheckInOut = async (req, res) => {
  try {
    const { intern_id } = req.body;
    if (!intern_id) {
      return res.status(400).json({ success: false, message: 'Thiếu intern_id' });
    }

    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const timeStr = `${hh}:${mm}`;

    const [existing] = await db.query('SELECT * FROM attendance WHERE intern_id = ? AND date = ?', [intern_id, today]);

    if (existing.length === 0 || !existing[0].check_in) {
      // Check-in
      const status = (now.getHours() > 8 || (now.getHours() === 8 && now.getMinutes() > 30)) ? 'late' : 'present';
      await db.query(`
        INSERT INTO attendance (intern_id, date, check_in, status)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE check_in = VALUES(check_in), status = VALUES(status)
      `, [intern_id, today, timeStr, status]);

      return res.json({
        success: true,
        action: 'check-in',
        time: timeStr,
        status,
        message: `Check-in thành công vào lúc ${timeStr}`
      });
    } else {
      // Check-out
      const rec = existing[0];
      let totalStr = '—';
      if (rec.check_in) {
        const [inH, inM] = rec.check_in.split(':').map(Number);
        const [outH, outM] = timeStr.split(':').map(Number);
        let diffMinutes = (outH * 60 + outM) - (inH * 60 + inM);
        if (diffMinutes < 0) diffMinutes += 24 * 60;
        const hours = Math.floor(diffMinutes / 60);
        const mins = diffMinutes % 60;
        totalStr = `${hours} giờ ${String(mins).padStart(2, '0')} phút`;
      }

      await db.query(`
        UPDATE attendance SET check_out = ?, total_hours = ?
        WHERE id = ?
      `, [timeStr, totalStr, rec.id]);

      return res.json({
        success: true,
        action: 'check-out',
        time: timeStr,
        total_hours: totalStr,
        message: `Check-out thành công lúc ${timeStr}! Tổng thời gian: ${totalStr}`
      });
    }
  } catch (error) {
    console.error('Lỗi check-in/out:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ' });
  }
};
