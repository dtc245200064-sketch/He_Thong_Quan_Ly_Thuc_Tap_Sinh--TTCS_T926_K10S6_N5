const db = require('../config/db');

// GET /api/evaluations: HR tổng hợp đánh giá thành báo cáo cuối kỳ (STT 20)
exports.getAllEvaluations = async (req, res) => {
  try {
    let query = `
      SELECT e.*, i.name as intern_name, i.email as intern_email, i.school, i.major, i.dept, i.start_date, i.end_date,
             m.name as mentor_name 
      FROM evaluations e
      JOIN interns i ON e.intern_id = i.id
      LEFT JOIN mentors m ON e.mentor_id = m.id
      WHERE 1=1
    `;
    const params = [];

    // Bảo vệ quyền xem (B04)
    if (req.user && req.user.role === 'Thực tập sinh') {
      const myInternId = req.user.internId || -1;
      query += ` AND e.intern_id = ?`;
      params.push(myInternId);
    } else if (req.user && req.user.role === 'Mentor') {
      const myMentorId = req.user.mentorId || -1;
      query += ` AND (e.mentor_id = ? OR i.mentor_id = ?)`;
      params.push(myMentorId, myMentorId);
    }

    query += ` ORDER BY e.total_score DESC, e.id DESC`;
    const [rows] = await db.query(query, params);

    // Tính thống kê xếp loại đầy đủ (bao gồm cả loại Yếu - B19)
    const summary = {
      total: rows.length,
      xuatSac: rows.filter(r => r.grade === 'Xuất sắc').length,
      gioi: rows.filter(r => r.grade === 'Giỏi').length,
      kha: rows.filter(r => r.grade === 'Khá').length,
      trungBinh: rows.filter(r => r.grade === 'Trung bình').length,
      yeu: rows.filter(r => r.grade === 'Yếu').length,
      avgScore: rows.length > 0 ? (rows.reduce((sum, r) => sum + Number(r.total_score), 0) / rows.length).toFixed(1) : 0
    };

    return res.status(200).json({
      success: true,
      data: rows,
      summary
    });
  } catch (error) {
    console.error('Lỗi lấy danh sách đánh giá tổng hợp:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi tổng hợp đánh giá', error: error.message });
  }
};

// GET /api/evaluations/intern/:internId: Lấy đánh giá của 1 TTS
exports.getEvaluationByIntern = async (req, res) => {
  try {
    const { internId } = req.params;

    // Bảo vệ quyền xem IDOR: TTS chỉ xem đánh giá của chính mình (B04 & S3-16)
    if (req.user && req.user.role === 'Thực tập sinh') {
      if (Number(internId) !== req.user.internId) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền xem đánh giá của thực tập sinh khác!'
        });
      }
    }

    const [rows] = await db.query('SELECT * FROM evaluations WHERE intern_id = ? LIMIT 1', [internId]);
    return res.status(200).json({
      success: true,
      data: rows.length > 0 ? rows[0] : null
    });
  } catch (error) {
    console.error('Lỗi lấy đánh giá TTS:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi lấy đánh giá', error: error.message });
  }
};

// POST /api/evaluations: Mentor đánh giá kỹ năng và thái độ tổng kết (STT 19)
exports.saveEvaluation = async (req, res) => {
  try {
    const { intern_id, mentor_id, technical_score, discipline_score, attitude_score, mentor_comments, hr_notes } = req.body;

    if (!intern_id) {
      return res.status(400).json({ success: false, message: 'Vui lòng chọn thực tập sinh cần đánh giá!' });
    }

    if (req.user && req.user.role === 'Thực tập sinh') {
      return res.status(403).json({ success: false, message: 'Thực tập sinh không được phép tự đánh giá!' });
    }

    const tScore = Number(technical_score);
    const dScore = Number(discipline_score);
    const aScore = Number(attitude_score);

    // Validate điểm số trong khoảng 0.0 đến 10.0 (B19 & S3-13)
    if (isNaN(tScore) || isNaN(dScore) || isNaN(aScore) ||
        tScore < 0 || tScore > 10 || dScore < 0 || dScore > 10 || aScore < 0 || aScore > 10) {
      return res.status(400).json({
        success: false,
        message: 'Điểm kỹ thuật, kỷ luật và thái độ phải là số hợp lệ từ 0 đến 10!'
      });
    }

    // Kiểm tra hồ sơ TTS
    const [internRows] = await db.query('SELECT id, mentor_id FROM interns WHERE id = ?', [intern_id]);
    if (internRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thực tập sinh!' });
    }

    // Mentor chỉ được đánh giá TTS thuộc nhóm mình (B19)
    if (req.user && req.user.role === 'Mentor') {
      if (internRows[0].mentor_id && req.user.mentorId && internRows[0].mentor_id !== req.user.mentorId) {
        return res.status(403).json({
          success: false,
          message: 'Bạn chỉ có quyền đánh giá thực tập sinh thuộc nhóm hướng dẫn của mình!'
        });
      }
    }

    const assignedMentorId = (req.user && req.user.role === 'Mentor' && req.user.mentorId) 
      ? req.user.mentorId 
      : (mentor_id || internRows[0].mentor_id || null);

    const totalScore = Number(((tScore * 0.4) + (dScore * 0.3) + (aScore * 0.3)).toFixed(1));

    let grade = 'Trung bình';
    if (totalScore >= 9.0) grade = 'Xuất sắc';
    else if (totalScore >= 8.0) grade = 'Giỏi';
    else if (totalScore >= 6.5) grade = 'Khá';
    else if (totalScore >= 5.0) grade = 'Trung bình';
    else grade = 'Yếu';

    await db.query(
      `INSERT INTO evaluations (intern_id, mentor_id, technical_score, discipline_score, attitude_score, total_score, grade, mentor_comments, hr_notes, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'finalized')
       ON DUPLICATE KEY UPDATE 
         mentor_id = VALUES(mentor_id),
         technical_score = VALUES(technical_score),
         discipline_score = VALUES(discipline_score),
         attitude_score = VALUES(attitude_score),
         total_score = VALUES(total_score),
         grade = VALUES(grade),
         mentor_comments = VALUES(mentor_comments),
         hr_notes = VALUES(hr_notes),
         status = 'finalized'`,
      [intern_id, assignedMentorId, tScore, dScore, aScore, totalScore, grade, mentor_comments || '', hr_notes || '']
    );

    return res.status(200).json({
      success: true,
      message: 'Lưu kết quả đánh giá thực tập sinh thành công!',
      data: {
        intern_id,
        total_score: totalScore,
        grade
      }
    });
  } catch (error) {
    console.error('Lỗi lưu đánh giá:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi lưu đánh giá', error: error.message });
  }
};
