const db = require('../config/db');

// GET /api/evaluations: HR tổng hợp đánh giá thành báo cáo cuối kỳ (STT 20)
exports.getAllEvaluations = async (req, res) => {
  try {
    const query = `
      SELECT e.*, i.name as intern_name, i.email as intern_email, i.school, i.major, i.dept, i.start_date, i.end_date,
             m.name as mentor_name 
      FROM evaluations e
      JOIN interns i ON e.intern_id = i.id
      LEFT JOIN mentors m ON e.mentor_id = m.id
      ORDER BY e.total_score DESC, e.id DESC
    `;
    const [rows] = await db.query(query);

    // Tính thống kê xếp loại
    const summary = {
      total: rows.length,
      xuatSac: rows.filter(r => r.grade === 'Xuất sắc').length,
      gioi: rows.filter(r => r.grade === 'Giỏi').length,
      kha: rows.filter(r => r.grade === 'Khá').length,
      trungBinh: rows.filter(r => r.grade === 'Trung bình').length,
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

    const tScore = Number(technical_score) || 0;
    const dScore = Number(discipline_score) || 0;
    const aScore = Number(attitude_score) || 0;
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
         technical_score=VALUES(technical_score),
         discipline_score=VALUES(discipline_score),
         attitude_score=VALUES(attitude_score),
         total_score=VALUES(total_score),
         grade=VALUES(grade),
         mentor_comments=VALUES(mentor_comments),
         hr_notes=VALUES(hr_notes),
         evaluated_at=NOW()`,
      [intern_id, mentor_id || null, tScore, dScore, aScore, totalScore, grade, mentor_comments || '', hr_notes || '']
    );

    return res.status(200).json({
      success: true,
      message: 'Lưu kết quả đánh giá thực tập sinh thành công!',
      evaluation: {
        intern_id,
        totalScore,
        grade
      }
    });
  } catch (error) {
    console.error('Lỗi lưu đánh giá:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi lưu đánh giá', error: error.message });
  }
};
