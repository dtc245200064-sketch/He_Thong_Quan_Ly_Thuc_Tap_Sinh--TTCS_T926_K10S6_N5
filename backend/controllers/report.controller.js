const db = require('../config/db');

// GET /api/reports/weekly: Lấy danh sách báo cáo tuần
exports.getWeeklyReports = async (req, res) => {
  try {
    const { intern_id, status } = req.query;
    let query = `
      SELECT r.*, i.name as intern_name, i.email as intern_email, m.name as mentor_name 
      FROM weekly_reports r
      LEFT JOIN interns i ON r.intern_id = i.id
      LEFT JOIN mentors m ON r.mentor_id = m.id
      WHERE 1=1
    `;
    const params = [];

    // Bảo vệ quyền xem (B04)
    if (req.user && req.user.role === 'Thực tập sinh') {
      const myInternId = req.user.internId || -1;
      query += ` AND (r.intern_id = ? OR i.user_id = ?)`;
      params.push(myInternId, req.user.id);
    } else if (req.user && req.user.role === 'Mentor') {
      const myMentorId = req.user.mentorId || -1;
      query += ` AND (r.mentor_id = ? OR i.mentor_id = ? OR m.user_id = ? OR i.mentor = ?)`;
      params.push(myMentorId, myMentorId, req.user.id, req.user.name);
    } else {
      if (intern_id) {
        query += ` AND r.intern_id = ?`;
        params.push(intern_id);
      }
    }

    if (status) {
      query += ` AND r.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY r.week_number DESC, r.id DESC`;
    const [rows] = await db.query(query, params);

    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error('Lỗi lấy danh sách báo cáo tuần:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi lấy báo cáo tuần', error: error.message });
  }
};

// POST /api/reports/weekly: TTS nộp báo cáo tuần (STT 17)
exports.submitWeeklyReport = async (req, res) => {
  try {
    const { intern_id, week_number, start_date, end_date, tasks_completed, issues_faced, plans_next_week, is_draft } = req.body;

    if (!week_number || !tasks_completed || !tasks_completed.trim()) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền tuần báo cáo và công việc đã hoàn thành!' });
    }

    const weekNum = parseInt(week_number, 10);
    if (isNaN(weekNum) || weekNum <= 0 || weekNum > 52) {
      return res.status(400).json({ success: false, message: 'Số tuần không hợp lệ (phải từ 1 đến 52)!' });
    }

    if (start_date && end_date) {
      const s = new Date(start_date);
      const e = new Date(end_date);
      if (e < s) {
        return res.status(400).json({ success: false, message: 'Ngày kết thúc tuần không được nhỏ hơn ngày bắt đầu!' });
      }
    }

    let targetInternId = null;
    if (req.user && req.user.role === 'Thực tập sinh') {
      targetInternId = req.user.internId;
    } else {
      targetInternId = intern_id;
    }

    // Xác định ID thực tế trong bảng interns
    let [internRows] = await db.query('SELECT id, mentor_id, mentor, user_id FROM interns WHERE id = ?', [targetInternId]);
    if (internRows.length === 0) {
      [internRows] = await db.query('SELECT id, mentor_id, mentor, user_id FROM interns WHERE user_id = ?', [targetInternId]);
    }

    if (internRows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Chưa tìm thấy hồ sơ thực tập sinh tương ứng trong hệ thống.'
      });
    }

    const actualInternId = internRows[0].id;

    // Lấy mentor_id trực tiếp từ hồ sơ TTS (B18 & B19)
    let mentorId = internRows[0].mentor_id || null;
    if (!mentorId && internRows[0].mentor) {
      const [mRows] = await db.query('SELECT id FROM mentors WHERE name = ? LIMIT 1', [internRows[0].mentor]);
      if (mRows.length > 0) mentorId = mRows[0].id;
    }

    const status = is_draft ? 'draft' : 'submitted';

    const [result] = await db.query(
      `INSERT INTO weekly_reports (intern_id, mentor_id, week_number, start_date, end_date, tasks_completed, issues_faced, plans_next_week, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
         tasks_completed = VALUES(tasks_completed), 
         issues_faced = VALUES(issues_faced), 
         plans_next_week = VALUES(plans_next_week), 
         status = VALUES(status),
         submitted_at = CURRENT_TIMESTAMP`,
      [actualInternId, mentorId, weekNum, start_date || new Date().toISOString().slice(0, 10), end_date || new Date().toISOString().slice(0, 10), tasks_completed.trim(), issues_faced || '', plans_next_week || '', status]
    );

    const [created] = await db.query('SELECT * FROM weekly_reports WHERE intern_id = ? AND week_number = ?', [actualInternId, weekNum]);
    return res.status(201).json({
      success: true,
      message: is_draft ? 'Đã lưu nháp báo cáo tuần!' : 'Nộp báo cáo tuần thành công!',
      data: created[0]
    });
  } catch (error) {
    console.error('Lỗi nộp báo cáo tuần:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi nộp báo cáo tuần', error: error.message });
  }
};

// PUT /api/reports/weekly/:id: Sửa báo cáo tuần
exports.updateWeeklyReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { tasks_completed, issues_faced, plans_next_week, is_draft } = req.body;

    const [existing] = await db.query('SELECT * FROM weekly_reports WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy báo cáo tuần!' });
    }

    const report = existing[0];

    // Chặn sửa khi báo cáo đã được mentor phản hồi (B19)
    if (report.status === 'reviewed') {
      return res.status(400).json({
        success: false,
        message: 'Báo cáo tuần đã được Mentor đánh giá/phản hồi, không thể chỉnh sửa!'
      });
    }

    // Bảo vệ quyền sở hữu IDOR (B04)
    if (req.user && req.user.role === 'Thực tập sinh') {
      if (report.intern_id !== req.user.internId) {
        return res.status(403).json({ success: false, message: 'Bạn không có quyền chỉnh sửa báo cáo của thực tập sinh khác!' });
      }
    }

    const nextStatus = is_draft ? 'draft' : 'submitted';

    await db.query(
      `UPDATE weekly_reports 
       SET tasks_completed = COALESCE(?, tasks_completed), 
           issues_faced = COALESCE(?, issues_faced), 
           plans_next_week = COALESCE(?, plans_next_week), 
           status = ? 
       WHERE id = ?`,
      [tasks_completed, issues_faced, plans_next_week, nextStatus, id]
    );

    return res.status(200).json({ success: true, message: 'Cập nhật báo cáo tuần thành công!' });
  } catch (error) {
    console.error('Lỗi cập nhật báo cáo tuần:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật báo cáo tuần', error: error.message });
  }
};

// PUT /api/reports/weekly/:id/feedback: Mentor phản hồi báo cáo tuần (STT 18)
exports.feedbackWeeklyReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { mentor_feedback, mentor_rating } = req.body;

    if (!mentor_feedback || !mentor_feedback.trim()) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập nội dung nhận xét/phản hồi!' });
    }

    const rating = parseFloat(mentor_rating);
    if (isNaN(rating) || rating < 1 || rating > 10) {
      return res.status(400).json({ success: false, message: 'Đánh giá xếp loại của mentor phải từ 1 đến 10 điểm!' });
    }

    const [existing] = await db.query('SELECT * FROM weekly_reports WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy báo cáo tuần!' });
    }

    const report = existing[0];
    const mentorIdToAssign = (req.user && req.user.role === 'Mentor' && req.user.mentorId) ? req.user.mentorId : null;

    await db.query(
      `UPDATE weekly_reports 
       SET mentor_feedback = ?, 
           mentor_rating = ?, 
           status = 'reviewed', 
           reviewed_at = NOW(),
           mentor_id = COALESCE(mentor_id, ?)
       WHERE id = ?`,
      [mentor_feedback.trim(), rating, mentorIdToAssign, id]
    );

    // Gửi thông báo In-app tự động cho thực tập sinh khi có phản hồi mới từ Mentor (STT 36)
    try {
      const [internRows] = await db.query('SELECT user_id, name FROM interns WHERE id = ?', [report.intern_id]);
      if (internRows.length > 0 && internRows[0].user_id) {
        await db.query(
          `INSERT INTO inapp_notifications (user_id, role, title, content, type, link)
           VALUES (?, 'Thực tập sinh', ?, ?, 'success', 'intern.html#reports')`,
          [
            internRows[0].user_id,
            `Mentor đã phản hồi báo cáo Tuần ${report.week_number}`,
            `Mentor đã đánh giá ${rating}/10 điểm và gửi nhận xét cho báo cáo tuần của bạn.`
          ]
        );
      }
    } catch (notifErr) {
      console.warn('Không thể tạo thông báo in-app cho TTS:', notifErr.message);
    }

    return res.status(200).json({
      success: true,
      message: 'Gửi nhận xét và đánh giá báo cáo tuần thành công!'
    });
  } catch (error) {
    console.error('Lỗi phản hồi báo cáo tuần:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi gửi nhận xét', error: error.message });
  }
};

// DELETE /api/reports/weekly/:id: Xóa báo cáo tuần
exports.deleteWeeklyReport = async (req, res) => {
  try {
    const { id } = req.params;
    const [existing] = await db.query('SELECT * FROM weekly_reports WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy báo cáo tuần!' });
    }

    if (existing[0].status === 'reviewed') {
      return res.status(400).json({
        success: false,
        message: 'Báo cáo tuần đã được Mentor phản hồi, không thể xóa!'
      });
    }

    if (req.user && req.user.role === 'Thực tập sinh') {
      if (existing[0].intern_id !== req.user.internId) {
        return res.status(403).json({ success: false, message: 'Bạn không có quyền xóa báo cáo của người khác!' });
      }
    }

    await db.query('DELETE FROM weekly_reports WHERE id = ?', [id]);
    return res.status(200).json({ success: true, message: 'Đã xóa báo cáo tuần thành công!' });
  } catch (error) {
    console.error('Lỗi xóa báo cáo tuần:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi xóa báo cáo tuần', error: error.message });
  }
};

// GET /api/reports/statistics/demographics (STT 32)
exports.getStatisticsDemographics = async (req, res) => {
  try {
    const [bySchool] = await db.query(`
      SELECT school, COUNT(*) as count 
      FROM interns 
      GROUP BY school 
      ORDER BY count DESC
    `);

    const [byMajor] = await db.query(`
      SELECT major, COUNT(*) as count 
      FROM interns 
      GROUP BY major 
      ORDER BY count DESC
    `);

    const [byDept] = await db.query(`
      SELECT dept, COUNT(*) as count 
      FROM interns 
      GROUP BY dept 
      ORDER BY count DESC
    `);

    return res.status(200).json({
      success: true,
      data: {
        bySchool,
        byMajor,
        byDept
      }
    });
  } catch (error) {
    console.error('Lỗi thống kê trường/ngành:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi thống kê nguồn ứng viên', error: error.message });
  }
};

// GET /api/reports/statistics/completion: Thống kê tỷ lệ hoàn thành (STT 33)
exports.getStatisticsCompletion = async (req, res) => {
  try {
    const [totalRows] = await db.query('SELECT COUNT(*) as total FROM interns');
    const total = totalRows[0].total || 0;

    const [statusRows] = await db.query(`
      SELECT status, COUNT(*) as count 
      FROM interns 
      GROUP BY status
    `);

    let completed = 0;
    let active = 0;
    let pending = 0;
    let rejected = 0;

    statusRows.forEach(r => {
      if (r.status === 'Đã hoàn thành' || r.status === 'Hoàn thành') completed += r.count;
      else if (r.status === 'Đang thực tập') active += r.count;
      else if (r.status === 'Chờ xét duyệt') pending += r.count;
      else if (r.status === 'Từ chối' || r.status === 'Đã từ chối' || r.status === 'Hủy') rejected += r.count;
    });

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const activeRate = total > 0 ? Math.round((active / total) * 100) : 0;

    return res.status(200).json({
      success: true,
      data: {
        total,
        completed,
        active,
        pending,
        rejected,
        completionRate,
        activeRate,
        byStatus: statusRows
      }
    });
  } catch (error) {
    console.error('Lỗi thống kê hoàn thành:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi thống kê tỷ lệ hoàn thành', error: error.message });
  }
};


// GET /api/reports/statistics/departments
exports.getStatisticsDepartments = async (req, res) => {
  try {
    const [byDept] = await db.query(`
      SELECT 
        COALESCE(dept, 'Chưa phân bổ') as department,
        COUNT(*) as total_interns,
        SUM(CASE WHEN status = 'Đang thực tập' THEN 1 ELSE 0 END) as active_interns,
        SUM(CASE WHEN status IN ('Đã hoàn thành', 'Hoàn thành') THEN 1 ELSE 0 END) as completed_interns
      FROM interns 
      GROUP BY dept 
      ORDER BY total_interns DESC
    `);

    return res.status(200).json({
      success: true,
      data: byDept
    });
  } catch (error) {
    console.error('Lỗi thống kê phòng ban:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi thống kê phòng ban', error: error.message });
  }
};
