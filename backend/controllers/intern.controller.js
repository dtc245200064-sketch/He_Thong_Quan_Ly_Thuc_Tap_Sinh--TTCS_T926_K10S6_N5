const db = require('../config/db');

// ==============================================================================
// INTERN CONTROLLER (QUẢN LÝ THỰC TẬP SINH & HỒ SƠ TÀI LIỆU VỚI MYSQL)
// ==============================================================================

// 1. GET /api/interns (Lấy danh sách thực tập sinh & ứng viên, có tìm kiếm & lọc)
exports.getInterns = async (req, res) => {
  try {
    const { search, school, dept, status } = req.query;

    let query = `
      SELECT 
        id, user_id, name, email, phone, school, major, dept, mentor, position,
        start_date, end_date, gpa, status, reject_reason, reject_note,
        skills, bio, projects,
        (SELECT COUNT(*) FROM documents WHERE documents.intern_id = interns.id) AS document_count,
        DATE_FORMAT(start_date, '%d/%m/%Y') AS startFormatted,
        DATE_FORMAT(end_date, '%d/%m/%Y') AS endFormatted,
        CASE 
          WHEN start_date IS NOT NULL AND end_date IS NOT NULL 
          THEN CONCAT(DATE_FORMAT(start_date, '%d/%m/%Y'), ' - ', DATE_FORMAT(end_date, '%d/%m/%Y'))
          ELSE 'Chưa xếp lịch'
        END AS time,
        DATE_FORMAT(created_at, '%d/%m/%Y') AS appliedDate
      FROM interns
      WHERE 1=1
    `;
    const params = [];

    // Tìm kiếm theo từ khóa (tên, email, số điện thoại, trường)
    if (search && search.trim()) {
      const keyword = `%${search.trim()}%`;
      query += ` AND (name LIKE ? OR email LIKE ? OR phone LIKE ? OR school LIKE ? OR position LIKE ?)`;
      params.push(keyword, keyword, keyword, keyword, keyword);
    }

    // Lọc theo trường
    if (school && school.trim()) {
      query += ` AND school = ?`;
      params.push(school.trim());
    }

    // Lọc theo phòng ban
    if (dept && dept.trim()) {
      query += ` AND dept = ?`;
      params.push(dept.trim());
    }

    // Lọc theo trạng thái
    if (status && status.trim()) {
      query += ` AND status = ?`;
      params.push(status.trim());
    }

    query += ` ORDER BY id DESC`;

    const [rows] = await db.query(query, params);

    return res.status(200).json({
      success: true,
      total: rows.length,
      data: rows
    });

  } catch (error) {
    console.error('Lỗi API getInterns:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi truy vấn danh sách thực tập sinh',
      error: error.message
    });
  }
};

// 2. POST /api/interns (Thêm mới một thực tập sinh)
exports.createIntern = async (req, res) => {
  try {
    const {
      name, email, phone, school, major, dept, mentor,
      position, startDate, endDate, status, gpa, skills, bio, projects
    } = req.body;

    if (!name || !school || !major || !dept) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền các thông tin bắt buộc: Họ tên, Trường, Ngành học, Phòng ban!'
      });
    }

    const internStatus = status || 'Chờ xét duyệt';
    const sDate = startDate ? new Date(startDate) : null;
    const eDate = endDate ? new Date(endDate) : null;

    const [result] = await db.query(
      `INSERT INTO interns 
       (name, email, phone, school, major, dept, mentor, position, start_date, end_date, status, gpa, skills, bio, projects)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        email || '',
        phone || '',
        school,
        major,
        dept,
        mentor || 'Chưa phân công',
        position || 'Thực tập sinh',
        sDate,
        eDate,
        internStatus,
        gpa || '',
        skills || '',
        bio || '',
        projects || ''
      ]
    );

    const newId = result.insertId;

    return res.status(201).json({
      success: true,
      message: 'Thêm thực tập sinh mới thành công!',
      data: {
        id: newId,
        name,
        email,
        phone,
        school,
        major,
        dept,
        mentor: mentor || 'Chưa phân công',
        position: position || 'Thực tập sinh',
        status: internStatus
      }
    });

  } catch (error) {
    console.error('Lỗi API createIntern:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi thêm thực tập sinh',
      error: error.message
    });
  }
};

// 3. PUT /api/interns/:id (Chỉnh sửa thông tin thực tập sinh)
exports.updateIntern = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name, email, phone, school, major, dept, mentor,
      position, startDate, endDate, status, gpa, skills, bio, projects
    } = req.body;

    // Kiểm tra xem thực tập sinh có tồn tại không
    const [existing] = await db.query('SELECT id FROM interns WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy thực tập sinh với ID = ${id}`
      });
    }

    const sDate = startDate ? new Date(startDate) : null;
    const eDate = endDate ? new Date(endDate) : null;

    await db.query(
      `UPDATE interns SET 
        name = COALESCE(?, name),
        email = COALESCE(?, email),
        phone = COALESCE(?, phone),
        school = COALESCE(?, school),
        major = COALESCE(?, major),
        dept = COALESCE(?, dept),
        mentor = COALESCE(?, mentor),
        position = COALESCE(?, position),
        start_date = CASE WHEN ? IS NOT NULL THEN ? ELSE start_date END,
        end_date = CASE WHEN ? IS NOT NULL THEN ? ELSE end_date END,
        status = COALESCE(?, status),
        gpa = COALESCE(?, gpa),
        skills = COALESCE(?, skills),
        bio = COALESCE(?, bio),
        projects = COALESCE(?, projects)
       WHERE id = ?`,
      [
        name, email, phone, school, major, dept, mentor, position,
        sDate, sDate, eDate, eDate, status, gpa, skills, bio, projects,
        id
      ]
    );

    return res.status(200).json({
      success: true,
      message: 'Cập nhật hồ sơ thực tập sinh thành công!',
      data: { id: Number(id), ...req.body }
    });

  } catch (error) {
    console.error('Lỗi API updateIntern:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi cập nhật thực tập sinh',
      error: error.message
    });
  }
};

// 4. GET /api/interns/:id/documents (Xem chi tiết hồ sơ & tài liệu đính kèm)
exports.getInternDocuments = async (req, res) => {
  try {
    const { id } = req.params;

    // Lấy thông tin thực tập sinh (hỗ trợ cả id và user_id)
    const [interns] = await db.query('SELECT * FROM interns WHERE id = ? OR user_id = ? LIMIT 1', [id, id]);
    if (interns.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy thực tập sinh với ID = ${id}`
      });
    }

    const intern = interns[0];

    // Lấy danh sách tài liệu của thực tập sinh này
    const [docs] = await db.query(
      `SELECT id, doc_name AS name, doc_type AS type, file_url AS fileUrl, file_size AS size, 
              review_status AS reviewStatus, reject_reason AS rejectReason, reject_note AS rejectNote,
              DATE_FORMAT(uploaded_at, '%d/%m/%Y %H:%i') AS uploadedAt
       FROM documents 
       WHERE intern_id = ?
       ORDER BY id ASC`,
      [intern.id]
    );

    return res.status(200).json({
      success: true,
      data: {
        internId: intern.id,
        internName: intern.name,
        school: intern.school,
        major: intern.major,
        dept: intern.dept,
        mentor: intern.mentor,
        status: intern.status,
        documents: docs
      }
    });

  } catch (error) {
    console.error('Lỗi API getInternDocuments:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi lấy tài liệu thực tập sinh',
      error: error.message
    });
  }
};

// 5. PATCH /api/interns/:id/documents/status (Duyệt hoặc từ chối hồ sơ tài liệu)
exports.updateDocumentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note, rejectReason } = req.body; // status: "approved" | "rejected"

    // Cập nhật trạng thái tài liệu
    await db.query(
      `UPDATE documents SET 
        review_status = ?,
        reject_reason = ?,
        reject_note = ?
       WHERE intern_id = ?`,
      [status || 'pending', rejectReason || null, note || null, id]
    );

    // Cập nhật trạng thái tổng thể của thực tập sinh tương ứng
    const newInternStatus = status === 'approved' ? 'Đang thực tập' : (status === 'rejected' ? 'Đã từ chối' : 'Chờ xét duyệt');
    await db.query(
      `UPDATE interns SET 
        status = ?,
        reject_reason = ?,
        reject_note = ?
       WHERE id = ?`,
      [newInternStatus, rejectReason || null, note || null, id]
    );

    return res.status(200).json({
      success: true,
      message: status === 'approved' ? 'Duyệt hồ sơ thành công!' : 'Đã từ chối hồ sơ!',
      data: {
        internId: Number(id),
        reviewStatus: status,
        status: newInternStatus,
        updatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Lỗi API updateDocumentStatus:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi cập nhật trạng thái hồ sơ',
      error: error.message
    });
  }
};

// 6. POST /api/interns/:id/documents (Tải lên file tài liệu CV, đơn xin thực tập)
exports.uploadDocument = async (req, res) => {
  try {
    const internId = req.params.id || req.body.internId;
    const { docType } = req.body; // 'CV' | 'APPLICATION_LETTER' | 'OTHER'

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng chọn tệp tài liệu cần tải lên!'
      });
    }

    if (!internId) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin internId!'
      });
    }

    // Định dạng dung lượng hiển thị
    const bytes = req.file.size;
    let sizeStr = bytes + ' B';
    if (bytes >= 1024 * 1024) {
      sizeStr = (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    } else if (bytes >= 1024) {
      sizeStr = (bytes / 1024).toFixed(0) + ' KB';
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    const originalName = req.file.originalname;
    const type = docType || (originalName.toLowerCase().includes('cv') ? 'CV' : 'APPLICATION_LETTER');

    // Tìm ID chính xác trong bảng interns (hỗ trợ cả intern_id và user_id)
    let [internRows] = await db.query('SELECT id FROM interns WHERE id = ? OR user_id = ? LIMIT 1', [internId, internId]);
    let targetInternId = internRows.length > 0 ? internRows[0].id : null;

    if (!targetInternId) {
      // Nếu chưa có, tìm thông tin user để tự động tạo hồ sơ thực tập sinh tương ứng
      const [userRows] = await db.query('SELECT * FROM users WHERE id = ?', [internId]);
      const u = userRows.length > 0 ? userRows[0] : null;
      const uName = u ? u.name : 'Thực tập sinh';
      const uEmail = u ? u.email : 'intern@student.vn';
      const uPhone = u ? u.phone : '';

      const [newIntern] = await db.query(
        `INSERT INTO interns (user_id, name, email, phone, school, major, dept, status)
         VALUES (?, ?, ?, ?, 'Đại học Bách Khoa', 'CNTT', 'Kỹ thuật phần mềm', 'Chờ xét duyệt')`,
        [u ? u.id : null, uName, uEmail, uPhone]
      );
      targetInternId = newIntern.insertId;
    }

    // Lưu thông tin file vào bảng documents trong MySQL
    const [result] = await db.query(
      `INSERT INTO documents (intern_id, doc_name, doc_type, file_url, file_size, review_status)
       VALUES (?, ?, ?, ?, ?, 'pending')`,
      [targetInternId, originalName, type, fileUrl, sizeStr]
    );

    // Khi có file tải lên: Cập nhật trạng thái của intern thành 'Chờ xét duyệt' nếu đang là 'Chưa hoàn thiện'
    await db.query(
      "UPDATE interns SET status = 'Chờ xét duyệt' WHERE id = ? AND (status = 'Chưa hoàn thiện' OR status = '' OR status IS NULL)",
      [targetInternId]
    );

    return res.status(201).json({
      success: true,
      message: 'Tải lên tài liệu thành công!',
      data: {
        id: result.insertId,
        internId: Number(targetInternId),
        name: originalName,
        type: type,
        fileUrl: fileUrl,
        size: sizeStr,
        reviewStatus: 'pending'
      }
    });

  } catch (error) {
    console.error('Lỗi API uploadDocument:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi tải lên tài liệu',
      error: error.message
    });
  }
};

// 7. DELETE /api/interns/:id (Xóa thực tập sinh khỏi Database)
exports.deleteIntern = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query('DELETE FROM interns WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy thực tập sinh với ID = ${id}`
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Đã xóa thực tập sinh thành công khỏi cơ sở dữ liệu!'
    });
  } catch (error) {
    console.error('Lỗi API deleteIntern:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi xóa thực tập sinh',
      error: error.message
    });
  }
};

// 8. DELETE /api/interns/:id/documents/:docType (Xóa tài liệu CV hoặc đơn xin thực tập)
exports.deleteDocument = async (req, res) => {
  try {
    const { id, docType } = req.params;

    // Tìm intern_id thực tế (hỗ trợ cả id và user_id)
    const [internRows] = await db.query('SELECT id FROM interns WHERE id = ? OR user_id = ? LIMIT 1', [id, id]);
    if (internRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy thực tập sinh với ID = ${id}`
      });
    }
    const internId = internRows[0].id;

    // Chuẩn hóa loại tài liệu
    const upper = (docType || '').toUpperCase();
    const type = (upper === 'CV') ? 'CV' : ((upper === 'APPLICATION_LETTER' || upper === 'APPLICATION') ? 'APPLICATION_LETTER' : upper);

    // 1. Tìm thông tin file trong DB để xóa file vật lý trong thư mục uploads
    const [docs] = await db.query(
      'SELECT id, file_url FROM documents WHERE intern_id = ? AND doc_type = ?',
      [internId, type]
    );

    if (docs.length > 0) {
      const fs = require('fs');
      const path = require('path');
      docs.forEach(doc => {
        if (doc.file_url) {
          const filePath = path.join(__dirname, '..', doc.file_url);
          if (fs.existsSync(filePath)) {
            try {
              fs.unlinkSync(filePath);
              console.log('🗑️ Đã xóa file vật lý:', filePath);
            } catch (err) {
              console.warn('Không thể xóa file vật lý:', err.message);
            }
          }
        }
      });
    }

    // 2. Xóa bản ghi trong MySQL Database
    const [delResult] = await db.query(
      'DELETE FROM documents WHERE intern_id = ? AND doc_type = ?',
      [internId, type]
    );

    // 3. Kiểm tra xem còn tài liệu nào không. Nếu không còn file nào thì chuyển trạng thái về 'Chưa hoàn thiện' để HR không hiện xét duyệt
    const [remRows] = await db.query('SELECT COUNT(*) AS total FROM documents WHERE intern_id = ?', [internId]);
    if (remRows[0].total === 0) {
      await db.query(
        "UPDATE interns SET status = 'Chưa hoàn thiện' WHERE id = ? AND status = 'Chờ xét duyệt'",
        [internId]
      );
      console.log(`📌 Thực tập sinh ID = ${internId} không còn file nào, đã đổi trạng thái về 'Chưa hoàn thiện'.`);
    }

    return res.status(200).json({
      success: true,
      message: `Đã xóa tài liệu ${type} thành công khỏi cơ sở dữ liệu!`,
      deletedCount: delResult.affectedRows
    });

  } catch (error) {
    console.error('Lỗi API deleteDocument:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi xóa tài liệu',
      error: error.message
    });
  }
};


