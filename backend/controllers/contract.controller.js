const db = require('../config/db');

// GET /api/contracts
exports.getContracts = async (req, res) => {
  try {
    const { intern_id, status } = req.query;
    let sql = `
      SELECT c.*, i.name as intern_name, i.email as intern_email, i.major as intern_major, i.mentor as intern_mentor
      FROM contracts c
      JOIN interns i ON c.intern_id = i.id
      WHERE 1=1
    `;
    const params = [];

    if (intern_id) {
      sql += ' AND c.intern_id = ?';
      params.push(intern_id);
    }
    if (status) {
      sql += ' AND c.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY c.id DESC';
    const [rows] = await db.query(sql, params);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Lỗi lấy danh sách hợp đồng:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ' });
  }
};

// POST /api/contracts (HR tạo / chỉ định hợp đồng mới)
exports.createContract = async (req, res) => {
  try {
    const { intern_id, code, title, company, dept, period, file_name, file_url } = req.body;
    if (!intern_id || !code || !title) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin hợp đồng bắt buộc' });
    }

    const [result] = await db.query(`
      INSERT INTO contracts (intern_id, code, title, company, dept, period, file_name, file_url, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')
      ON DUPLICATE KEY UPDATE title = VALUES(title), file_name = VALUES(file_name), file_url = VALUES(file_url)
    `, [intern_id, code, title, company || 'Hệ thống Đào tạo CodeGym Việt Nam', dept || 'Phòng Phát triển Phần mềm', period || null, file_name || null, file_url || null]);

    const [created] = await db.query('SELECT * FROM contracts WHERE id = ?', [result.insertId || 1]);
    res.status(201).json({ success: true, message: 'Tạo hợp đồng thành công', data: created[0] });
  } catch (error) {
    console.error('Lỗi tạo hợp đồng:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ' });
  }
};

// PATCH /api/contracts/:id/confirm (TTS xác nhận hoặc từ chối ký kết)
exports.confirmContract = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'approved' | 'rejected'

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Trạng thái không hợp lệ' });
    }

    await db.query(`
      UPDATE contracts
      SET status = ?, confirmed_at = CURRENT_TIMESTAMP
      WHERE id = ? OR code = ?
    `, [status, id, id]);

    res.json({
      success: true,
      message: status === 'approved' ? 'Xác nhận ký hợp đồng thành công' : 'Đã ghi nhận phản hồi từ chối hợp đồng'
    });
  } catch (error) {
    console.error('Lỗi xác nhận hợp đồng:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ' });
  }
};
