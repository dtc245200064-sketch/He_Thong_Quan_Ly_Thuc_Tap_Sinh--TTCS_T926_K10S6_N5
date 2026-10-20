const db = require('../config/db');

// Hàm hỗ trợ lấy ngày và giờ hiện tại theo múi giờ Việt Nam (Asia/Ho_Chi_Minh - UTC+7)
function getVietnamDateTime() {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }); // YYYY-MM-DD
  const timeStr = now.toLocaleTimeString('en-GB', { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit' }); // HH:mm
  const [hh, mm] = timeStr.split(':').map(Number);
  return { dateStr, timeStr, hour: hh, minute: mm };
}

async function resolveInternId(internIdOrUserId) {
  if (!internIdOrUserId) return null;
  const [internCheck] = await db.query('SELECT id FROM interns WHERE id = ?', [internIdOrUserId]);
  if (internCheck.length > 0) return internCheck[0].id;

  const [userCheck] = await db.query('SELECT id FROM interns WHERE user_id = ?', [internIdOrUserId]);
  if (userCheck.length > 0) return userCheck[0].id;

  return internIdOrUserId;
}

// GET /api/attendance
exports.getAttendance = async (req, res) => {
  try {
    const { intern_id, month, year, date } = req.query;
    let sql = `
      SELECT a.id, a.intern_id, DATE_FORMAT(a.date, '%Y-%m-%d') as date, a.check_in, a.check_out, a.total_hours, a.status, a.notes,
             i.name as intern_name, i.dept as intern_dept, i.school as intern_school, i.user_id as intern_user_id
      FROM attendance a
      JOIN interns i ON a.intern_id = i.id
      WHERE 1=1
    `;
    const params = [];

    // Nếu người dùng là Thực tập sinh, chỉ xem bảng chấm công của chính mình (B04)
    if (req.user && req.user.role === 'Thực tập sinh') {
      const myInternId = req.user.internId || (await resolveInternId(req.user.id));
      sql += ' AND (a.intern_id = ? OR i.user_id = ?)';
      params.push(myInternId, req.user.id);
    } else if (intern_id) {
      const resolvedId = await resolveInternId(intern_id);
      sql += ' AND (a.intern_id = ? OR i.user_id = ?)';
      params.push(resolvedId, intern_id);
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
      return res.status(400).json({ success: false, message: 'Thiếu intern_id hoặc date' });
    }

    const validStatuses = ['present', 'late', 'leave', 'remote', 'absent'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Trạng thái chấm công không hợp lệ. Chỉ chấp nhận: ${validStatuses.join(', ')}`
      });
    }

    const resolvedId = await resolveInternId(intern_id);

    // Nếu trạng thái rỗng, xóa bản ghi chấm công của ngày đó
    if (!status) {
      await db.query('DELETE FROM attendance WHERE intern_id = ? AND date = ?', [resolvedId, date]);
      return res.json({ success: true, message: 'Đã xóa bản ghi chấm công' });
    }

    await db.query(`
      INSERT INTO attendance (intern_id, date, status, notes)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE status = VALUES(status), notes = VALUES(notes)
    `, [resolvedId, date, status, notes || null]);

    res.json({ success: true, message: 'Đã cập nhật trạng thái chấm công' });
  } catch (error) {
    console.error('Lỗi cập nhật chấm công:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ' });
  }
};

// POST /api/attendance/check-in-out (TTS tự check-in / check-out hàng ngày)
exports.toggleCheckInOut = async (req, res) => {
  try {
    const { intern_id, date: clientDate, action } = req.body;
    
    // Bảo vệ quyền sở hữu: TTS chỉ được check-in cho chính mình (B04)
    let resolvedId = null;
    if (req.user && req.user.role === 'Thực tập sinh') {
      resolvedId = req.user.internId || (await resolveInternId(req.user.id));
    } else {
      if (!intern_id) {
        return res.status(400).json({ success: false, message: 'Thiếu intern_id' });
      }
      resolvedId = await resolveInternId(intern_id);
    }

    if (!resolvedId) {
      return res.status(400).json({ success: false, message: 'Không tìm thấy hồ sơ thực tập sinh!' });
    }

    const vn = getVietnamDateTime();

    // Chặn gian lận ngày từ client (B15)
    if (clientDate && clientDate !== vn.dateStr) {
      return res.status(400).json({
        success: false,
        message: 'Không được phép gian lận chấm công bằng ngày khác với ngày hiện tại của hệ thống!'
      });
    }

    const today = vn.dateStr;
    const timeStr = vn.timeStr;

    const [existing] = await db.query('SELECT * FROM attendance WHERE intern_id = ? AND date = ?', [resolvedId, today]);

    const targetAction = action || (existing.length === 0 || !existing[0].check_in ? 'checkin' : 'checkout');

    if (targetAction === 'checkin') {
      if (existing.length > 0 && existing[0].check_in) {
        return res.status(400).json({
          success: false,
          message: `Bạn đã check-in hôm nay lúc ${existing[0].check_in} rồi!`
        });
      }

      // Giờ quy định: sau 08:30 là đi muộn
      const isLate = (vn.hour > 8 || (vn.hour === 8 && vn.minute > 30));
      const status = isLate ? 'late' : 'present';
      await db.query(`
        INSERT INTO attendance (intern_id, date, check_in, status, notes)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE check_in = VALUES(check_in), status = VALUES(status)
      `, [resolvedId, today, timeStr, status, isLate ? 'Đi muộn' : 'Đúng giờ']);

      return res.json({
        success: true,
        action: 'check-in',
        date: today,
        time: timeStr,
        status,
        message: `Check-in thành công vào lúc ${timeStr} (${isLate ? 'Đi muộn' : 'Đúng giờ'})`
      });
    } else {
      // Check-out
      if (existing.length === 0 || !existing[0].check_in) {
        return res.status(400).json({
          success: false,
          message: 'Bạn chưa thực hiện check-in hôm nay, không thể check-out!'
        });
      }

      const rec = existing[0];
      const [inH, inM] = rec.check_in.split(':').map(Number);
      const [outH, outM] = timeStr.split(':').map(Number);
      let diffMinutes = (outH * 60 + outM) - (inH * 60 + inM);
      if (diffMinutes < 0) diffMinutes = 0; // Chặn cộng 24h sai lệch (B15)

      const hours = Math.floor(diffMinutes / 60);
      const mins = diffMinutes % 60;
      const totalStr = `${hours} giờ ${String(mins).padStart(2, '0')} phút`;

      await db.query(`
        UPDATE attendance SET check_out = ?, total_hours = ?
        WHERE id = ?
      `, [timeStr, totalStr, rec.id]);

      return res.json({
        success: true,
        action: 'check-out',
        date: today,
        time: timeStr,
        total_hours: totalStr,
        message: `Check-out thành công vào lúc ${timeStr} (Tổng thời gian: ${totalStr})`
      });
    }
  } catch (error) {
    console.error('Lỗi check-in/out:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ' });
  }
};
