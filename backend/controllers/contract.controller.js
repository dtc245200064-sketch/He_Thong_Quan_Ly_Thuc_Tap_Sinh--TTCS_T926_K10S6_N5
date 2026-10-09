const db = require('../config/db');

// Hàm giải quyết intern_id linh hoạt (hỗ trợ intern_id, user_id, email, username)
async function resolveInternId(internIdOrUserId) {
  if (!internIdOrUserId) return null;
  
  // 1. Kiểm tra trực tiếp bảng interns theo id
  const [internCheck] = await db.query('SELECT id FROM interns WHERE id = ?', [internIdOrUserId]);
  if (internCheck.length > 0) return internCheck[0].id;

  // 2. Kiểm tra theo user_id
  const [userCheck] = await db.query('SELECT id FROM interns WHERE user_id = ?', [internIdOrUserId]);
  if (userCheck.length > 0) return userCheck[0].id;

  // 3. Kiểm tra nếu là email hoặc username từ bảng users
  const [userEmailCheck] = await db.query('SELECT id, email FROM users WHERE id = ? OR email = ? OR username = ?', [internIdOrUserId, internIdOrUserId, internIdOrUserId]);
  if (userEmailCheck.length > 0) {
    const u = userEmailCheck[0];
    const [internByUser] = await db.query('SELECT id FROM interns WHERE user_id = ? OR email = ?', [u.id, u.email]);
    if (internByUser.length > 0) return internByUser[0].id;
  }

  // 4. Kiểm tra theo email trong bảng interns
  const [internEmailCheck] = await db.query('SELECT id FROM interns WHERE email = ?', [internIdOrUserId]);
  if (internEmailCheck.length > 0) return internEmailCheck[0].id;

  return internIdOrUserId;
}

// GET /api/contracts (Lấy danh sách hợp đồng, hỗ trợ intern_id, user_id, email)
exports.getContracts = async (req, res) => {
  try {
    const { intern_id, user_id, email, status } = req.query;
    let sql = `
      SELECT c.*, 
             DATE_FORMAT(c.confirmed_at, '%d/%m/%Y %H:%i') as confirmed_at_formatted,
             DATE_FORMAT(c.created_at, '%d/%m/%Y') as created_at_formatted,
             i.name as intern_name, i.email as intern_email, i.major as intern_major, i.mentor as intern_mentor
      FROM contracts c
      JOIN interns i ON c.intern_id = i.id
      WHERE 1=1
    `;
    const params = [];

    if (intern_id || user_id || email) {
      const targetId = intern_id || user_id;
      const resolvedId = await resolveInternId(targetId);
      sql += ` AND (
        c.intern_id = ? 
        OR i.id = ? 
        OR i.user_id = ? 
        OR (? IS NOT NULL AND i.email = ?)
        OR (? IS NOT NULL AND i.user_id IN (SELECT id FROM users WHERE email = ? OR username = ?))
      )`;
      params.push(resolvedId, targetId || 0, targetId || 0, email || null, email || '', email || null, email || '', email || '');
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
    const { intern_id, code, title, company, dept, period } = req.body;
    let file_name = req.body.file_name;
    let file_url = req.body.file_url;

    if (req.file) {
      file_url = `/uploads/${req.file.filename}`;
      try {
        file_name = Buffer.from(req.file.originalname, 'latin1').toString('utf8');
      } catch (e) {
        file_name = req.file.originalname;
      }
    }

    if (!intern_id || !code || !title) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin hợp đồng bắt buộc' });
    }

    const resolvedId = await resolveInternId(intern_id);

    const [result] = await db.query(`
      INSERT INTO contracts (intern_id, code, title, company, dept, period, file_name, file_url, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')
      ON DUPLICATE KEY UPDATE 
        title = VALUES(title), 
        company = VALUES(company), 
        dept = VALUES(dept), 
        period = VALUES(period), 
        file_name = IFNULL(VALUES(file_name), file_name), 
        file_url = IFNULL(VALUES(file_url), file_url), 
        status = 'pending', 
        reject_reason = NULL, 
        confirmed_at = NULL
    `, [resolvedId, code, title, company || 'Hệ thống Đào tạo CodeGym Việt Nam', dept || 'Phòng Phát triển Phần mềm', period || null, file_name || null, file_url || null]);

    // Đồng bộ vào bảng documents để document_count và trình xem tài liệu được tính đầy đủ
    if (file_url) {
      await db.query(`
        INSERT INTO documents (intern_id, doc_name, doc_type, file_url, file_size, review_status)
        VALUES (?, ?, 'CONTRACT', ?, 'Hợp đồng thực tập', 'pending')
        ON DUPLICATE KEY UPDATE 
          doc_name = VALUES(doc_name),
          file_url = VALUES(file_url),
          review_status = 'pending'
      `, [resolvedId, file_name || 'Hop_Dong_Thuc_Tap.pdf', file_url]);
    }

    const [created] = await db.query('SELECT * FROM contracts WHERE code = ?', [code]);
    res.status(201).json({ success: true, message: 'Tạo hợp đồng thành công và đã gửi cho thực tập sinh', data: created[0] });
  } catch (error) {
    console.error('Lỗi tạo hợp đồng:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ' });
  }
};

// PATCH /api/contracts/:id/confirm (TTS xác nhận hoặc từ chối ký kết)
exports.confirmContract = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body; // 'approved' | 'rejected'

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Trạng thái không hợp lệ' });
    }

    const rejectReasonText = (status === 'rejected') ? (reason || 'Từ chối không nêu lý do') : null;

    await db.query(`
      UPDATE contracts
      SET status = ?, confirmed_at = CURRENT_TIMESTAMP, reject_reason = ?
      WHERE id = ? OR code = ?
    `, [status, rejectReasonText, id, id]);

    // Đồng bộ trạng thái sang documents table
    await db.query(`
      UPDATE documents
      SET review_status = ?, reject_reason = ?
      WHERE intern_id = (SELECT intern_id FROM contracts WHERE id = ? OR code = ? LIMIT 1) AND doc_type = 'CONTRACT'
    `, [status, rejectReasonText, id, id]);

    res.json({
      success: true,
      message: status === 'approved' ? 'Xác nhận ký hợp đồng thành công' : 'Đã ghi nhận phản hồi từ chối hợp đồng'
    });
  } catch (error) {
    console.error('Lỗi xác nhận hợp đồng:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ' });
  }
};

// DELETE /api/contracts/:id (Xóa hợp đồng)
exports.deleteContract = async (req, res) => {
  try {
    const { id } = req.params;
    const resolvedId = await resolveInternId(id);
    await db.query('DELETE FROM contracts WHERE id = ? OR intern_id = ? OR code = ?', [id, resolvedId, id]);
    res.json({ success: true, message: 'Đã xóa hợp đồng thành công' });
  } catch (error) {
    console.error('Lỗi xóa hợp đồng:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ' });
  }
};


