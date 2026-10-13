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

    if (intern_id) {
      query += ` AND r.intern_id = ?`;
      params.push(intern_id);
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

    if (!intern_id || !week_number || !tasks_completed) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin báo cáo tuần!' });
    }

    // Xác định ID thực tế trong bảng interns
    let [internRows] = await db.query('SELECT id, mentor, user_id FROM interns WHERE id = ?', [intern_id]);
    if (internRows.length === 0) {
      [internRows] = await db.query('SELECT id, mentor, user_id FROM interns WHERE user_id = ?', [intern_id]);
    }

    if (internRows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Chưa tìm thấy hồ sơ thực tập sinh tương ứng trong hệ thống. Vui lòng tạo/duyệt hồ sơ TTS trước khi nộp báo cáo!'
      });
    }

    const actualInternId = internRows[0].id;
    let mentorId = null;
    if (internRows[0].mentor) {
      const [mentorRows] = await db.query('SELECT id FROM mentors WHERE name LIKE ? LIMIT 1', [`%${internRows[0].mentor}%`]);
      if (mentorRows.length > 0) mentorId = mentorRows[0].id;
    }

    const status = is_draft ? 'draft' : 'submitted';

    const [result] = await db.query(
      `INSERT INTO weekly_reports (intern_id, mentor_id, week_number, start_date, end_date, tasks_completed, issues_faced, plans_next_week, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
         tasks_completed=VALUES(tasks_completed), 
         issues_faced=VALUES(issues_faced), 
         plans_next_week=VALUES(plans_next_week), 
         status=VALUES(status)`,
      [actualInternId, mentorId, week_number, start_date || new Date().toISOString().slice(0, 10), end_date || new Date().toISOString().slice(0, 10), tasks_completed, issues_faced || '', plans_next_week || '', status]
    );

    return res.status(201).json({
      success: true,
      message: is_draft ? 'Đã lưu bản nháp báo cáo tuần!' : 'Nộp báo cáo tuần thành công!',
      reportId: result.insertId
    });
  } catch (error) {
    console.error('Lỗi nộp báo cáo tuần:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi nộp báo cáo tuần', error: error.message });
  }
};

// PUT /api/reports/weekly/:id: Cập nhật nội dung báo cáo tuần
exports.updateWeeklyReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { week_number, start_date, end_date, tasks_completed, issues_faced, plans_next_week, is_draft } = req.body;

    const [existing] = await db.query('SELECT * FROM weekly_reports WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy báo cáo tuần!' });
    }

    const current = existing[0];
    const status = is_draft !== undefined ? (is_draft ? 'draft' : 'submitted') : current.status;

    await db.query(
      `UPDATE weekly_reports 
       SET week_number = ?, start_date = ?, end_date = ?, tasks_completed = ?, issues_faced = ?, plans_next_week = ?, status = ?
       WHERE id = ?`,
      [
        week_number !== undefined ? week_number : current.week_number,
        start_date || current.start_date,
        end_date || current.end_date,
        tasks_completed !== undefined ? tasks_completed : current.tasks_completed,
        issues_faced !== undefined ? issues_faced : current.issues_faced,
        plans_next_week !== undefined ? plans_next_week : current.plans_next_week,
        status,
        id
      ]
    );

    return res.status(200).json({
      success: true,
      message: is_draft ? 'Đã lưu bản nháp báo cáo tuần!' : 'Cập nhật báo cáo tuần thành công!'
    });
  } catch (error) {
    console.error('Lỗi cập nhật báo cáo tuần:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật báo cáo tuần', error: error.message });
  }
};

// DELETE /api/reports/weekly/:id: Xóa báo cáo tuần
exports.deleteWeeklyReport = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query('DELETE FROM weekly_reports WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy báo cáo tuần để xóa!' });
    }
    return res.status(200).json({ success: true, message: 'Đã xóa báo cáo tuần thành công!' });
  } catch (error) {
    console.error('Lỗi xóa báo cáo tuần:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi xóa báo cáo tuần', error: error.message });
  }
};

// PUT /api/reports/weekly/:id/feedback: Mentor xem báo cáo & gửi phản hồi (STT 18)
exports.feedbackWeeklyReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { mentor_feedback, mentor_rating } = req.body;

    if (!mentor_feedback) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập nội dung nhận xét, phản hồi!' });
    }

    const [result] = await db.query(
      `UPDATE weekly_reports 
       SET mentor_feedback = ?, 
           mentor_rating = ?, 
           status = 'reviewed', 
           reviewed_at = NOW() 
       WHERE id = ?`,
      [mentor_feedback, mentor_rating || null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy báo cáo tuần!' });
    }

    return res.status(200).json({
      success: true,
      message: 'Gửi nhận xét và phản hồi thành công!'
    });
  } catch (error) {
    console.error('Lỗi gửi feedback báo cáo:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi gửi nhận xét', error: error.message });
  }
};

// GET /api/reports/statistics/demographics: Thống kê số lượng TTS theo trường/ngành (STT 32)
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

// GET /api/reports/statistics/completion: Thống kê tỷ lệ hoàn thành chương trình (STT 33)
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
      else if (r.status === 'Từ chối' || r.status === 'Hủy') rejected += r.count;
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
