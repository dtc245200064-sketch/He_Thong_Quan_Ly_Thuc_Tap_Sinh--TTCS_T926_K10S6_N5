const db = require('../config/db');

async function resolveInternId(internIdOrUserId) {
  if (!internIdOrUserId) return null;
  const [internCheck] = await db.query('SELECT id FROM interns WHERE id = ?', [internIdOrUserId]);
  if (internCheck.length > 0) return internCheck[0].id;

  const [userCheck] = await db.query('SELECT id FROM interns WHERE user_id = ?', [internIdOrUserId]);
  if (userCheck.length > 0) return userCheck[0].id;

  return internIdOrUserId;
}

// GET /api/contracts
exports.getContracts = async (req, res) => {
  try {
    const { intern_id, status } = req.query;
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

    // Bảo vệ quyền xem: TTS chỉ thấy hợp đồng của chính mình (B04)
    if (req.user && req.user.role === 'Thực tập sinh') {
      const myInternId = req.user.internId || (await resolveInternId(req.user.id));
      sql += ' AND (c.intern_id = ? OR i.user_id = ?)';
      params.push(myInternId, req.user.id);
    } else if (intern_id) {
      const resolvedId = await resolveInternId(intern_id);
      sql += ' AND (c.intern_id = ? OR i.user_id = ?)';
      params.push(resolvedId, intern_id);
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
      return res.status(400).json({ success: false, message: 'Thiếu thông tin hợp đồng bắt buộc (intern_id, code, title)' });
    }

    // Chặn ghi đè âm thầm mã hợp đồng (B09)
    const [existingCode] = await db.query('SELECT id, status FROM contracts WHERE code = ?', [code.trim()]);
    if (existingCode.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Mã hợp đồng "${code}" đã tồn tại trong hệ thống! Vui lòng sử dụng mã hợp đồng duy nhất.`
      });
    }

    const resolvedId = await resolveInternId(intern_id);

    const [result] = await db.query(`
      INSERT INTO contracts (intern_id, code, title, company, dept, period, file_name, file_url, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `, [resolvedId, code.trim(), title.trim(), company || 'Hệ thống Đào tạo CodeGym Việt Nam', dept || 'Phòng Phát triển Phần mềm', period || null, file_name || null, file_url || null]);

    // Đồng bộ vào bảng documents
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

    const [created] = await db.query('SELECT * FROM contracts WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, message: 'Tạo hợp đồng thành công và đã gửi cho thực tập sinh', data: created[0] });
  } catch (error) {
    console.error('Lỗi tạo hợp đồng:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ' });
  }
};

// PATCH /api/contracts/:id/confirm (TTS xác nhận ký hoặc từ chối hợp đồng)
exports.confirmContract = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body; // 'approved' | 'rejected'

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Trạng thái không hợp lệ' });
    }

    const [contractRows] = await db.query('SELECT * FROM contracts WHERE id = ? OR code = ? LIMIT 1', [id, id]);
    if (contractRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy hợp đồng' });
    }

    const contract = contractRows[0];

    // Kiểm tra quyền sở hữu IDOR: TTS chỉ được ký hợp đồng của chính mình (B04)
    if (req.user && req.user.role === 'Thực tập sinh') {
      const myInternId = req.user.internId || (await resolveInternId(req.user.id));
      if (contract.intern_id !== myInternId) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền xác nhận hợp đồng của thực tập sinh khác!'
        });
      }
    }

    const rejectReasonText = (status === 'rejected') ? (reason || 'Từ chối không nêu lý do') : null;

    await db.query(`
      UPDATE contracts
      SET status = ?, confirmed_at = CURRENT_TIMESTAMP, reject_reason = ?
      WHERE id = ?
    `, [status, rejectReasonText, contract.id]);

    // Đồng bộ trạng thái sang documents table
    await db.query(`
      UPDATE documents
      SET review_status = ?, reject_reason = ?
      WHERE intern_id = ? AND doc_type = 'CONTRACT'
    `, [status, rejectReasonText, contract.intern_id]);

    res.json({
      success: true,
      message: status === 'approved' ? 'Xác nhận ký hợp đồng thành công' : 'Đã ghi nhận phản hồi từ chối hợp đồng'
    });
  } catch (error) {
    console.error('Lỗi xác nhận hợp đồng:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ' });
  }
};

// DELETE /api/contracts/:id (Xóa hợp đồng - B09 chỉ xóa theo ID hợp đồng)
exports.deleteContract = async (req, res) => {
  try {
    const { id } = req.params;
    // B09: Chỉ xóa đúng hợp đồng theo ID, KHÔNG dùng OR intern_id
    const [result] = await db.query('DELETE FROM contracts WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy hợp đồng để xóa' });
    }
    res.json({ success: true, message: 'Đã xóa hợp đồng thành công' });
  } catch (error) {
    console.error('Lỗi xóa hợp đồng:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ' });
  }
};
