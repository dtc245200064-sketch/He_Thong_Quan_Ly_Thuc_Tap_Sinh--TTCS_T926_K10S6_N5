const path = require('path');
const fs = require('fs');
const db = require('../config/db');
const emailService = require('../services/email.service');

// ==============================================================================
// INTERN CONTROLLER (QUẢN LÝ THỰC TẬP SINH & HỒ SƠ TÀI LIỆU VỚI MYSQL)
// ==============================================================================

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function parseDateString(dateVal) {
  if (!dateVal) return null;
  if (typeof dateVal === 'string' && dateVal.includes('/')) {
    const [d, m, y] = dateVal.split('/');
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  } else if (typeof dateVal === 'string' && dateVal.match(/^\d{4}-\d{2}-\d{2}/)) {
    return dateVal.substring(0, 10);
  } else {
    const dObj = new Date(dateVal);
    return !isNaN(dObj.getTime()) ? dObj.toISOString().split('T')[0] : null;
  }
}

// 1. GET /api/interns (Lấy danh sách thực tập sinh & ứng viên, có tìm kiếm & lọc)
exports.getInterns = async (req, res) => {
  try {
    const { search, school, dept, status } = req.query;

    let query = `
      SELECT 
        id, user_id, name, email, phone, school, major, dept, mentor, mentor_id, position,
        start_date, end_date, gpa, status, reject_reason, reject_note,
        skills, bio, projects, birth_date, course, faculty,
        (SELECT COUNT(*) FROM documents WHERE documents.intern_id = interns.id) AS document_count,
        (SELECT doc_name FROM documents WHERE documents.intern_id = interns.id AND doc_type = 'CV' ORDER BY id DESC LIMIT 1) AS cv_doc_name,
        (SELECT file_url FROM documents WHERE documents.intern_id = interns.id AND doc_type = 'CV' ORDER BY id DESC LIMIT 1) AS cv_file_url,
        (SELECT doc_name FROM documents WHERE documents.intern_id = interns.id AND (doc_type = 'APPLICATION_LETTER' OR doc_type = 'APPLICATION') ORDER BY id DESC LIMIT 1) AS letter_doc_name,
        (SELECT file_url FROM documents WHERE documents.intern_id = interns.id AND (doc_type = 'APPLICATION_LETTER' OR doc_type = 'APPLICATION') ORDER BY id DESC LIMIT 1) AS letter_file_url,
        (SELECT file_name FROM contracts WHERE contracts.intern_id = interns.id ORDER BY id DESC LIMIT 1) AS contract_file_name,
        (SELECT file_url FROM contracts WHERE contracts.intern_id = interns.id ORDER BY id DESC LIMIT 1) AS contract_file_url,
        (SELECT status FROM contracts WHERE contracts.intern_id = interns.id ORDER BY id DESC LIMIT 1) AS contract_status,
        (SELECT code FROM contracts WHERE contracts.intern_id = interns.id ORDER BY id DESC LIMIT 1) AS contract_code,
        (SELECT title FROM contracts WHERE contracts.intern_id = interns.id ORDER BY id DESC LIMIT 1) AS contract_title,
        (SELECT reject_reason FROM contracts WHERE contracts.intern_id = interns.id ORDER BY id DESC LIMIT 1) AS contract_reject_reason,
        (SELECT DATE_FORMAT(created_at, '%d/%m/%Y') FROM contracts WHERE contracts.intern_id = interns.id ORDER BY id DESC LIMIT 1) AS contract_created_at_formatted,
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

    // Nếu người dùng đăng nhập là Thực tập sinh, chỉ cho phép xem thông tin hồ sơ của chính mình
    if (req.user && (req.user.role === 'Thực tập sinh' || req.user.role === 'INTERN')) {
      query += ` AND (interns.user_id = ? OR interns.email = ?)`;
      params.push(req.user.id, req.user.email);
    }

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

// 2. POST /api/interns (Thêm mới một thực tập sinh - B20)
exports.createIntern = async (req, res) => {
  try {
    const {
      name, email, phone, school, major, dept, mentor,
      position, startDate, start_date, endDate, end_date, status, gpa, skills, bio, projects,
      birthDate, birth_date, course, faculty
    } = req.body;

    if (!name || !school || !major || !dept) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền các thông tin bắt buộc: Họ tên, Trường, Ngành học, Phòng ban!'
      });
    }

    // B20: Kiểm tra định dạng email hợp lệ
    if (email && email.trim() && !EMAIL_REGEX.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Định dạng email không hợp lệ!'
      });
    }

    // B20: Kiểm tra thang điểm GPA (0.0 - 4.0)
    if (gpa !== undefined && gpa !== null && String(gpa).trim() !== '') {
      const gpaNum = parseFloat(gpa);
      if (isNaN(gpaNum) || gpaNum < 0 || gpaNum > 4) {
        return res.status(400).json({
          success: false,
          message: 'Điểm GPA không hợp lệ! GPA phải là số trong khoảng từ 0.0 đến 4.0.'
        });
      }
    }

    const sDate = parseDateString(startDate || start_date);
    const eDate = parseDateString(endDate || end_date);

    // B20: Kiểm tra ngày kết thúc >= ngày bắt đầu
    if (sDate && eDate) {
      if (new Date(eDate).getTime() < new Date(sDate).getTime()) {
        return res.status(400).json({
          success: false,
          message: 'Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu!'
        });
      }
    }

    const internStatus = status || 'Chờ xét duyệt';
    const finalBirthDate = parseDateString(birthDate || birth_date);

    // Tự động liên kết tài khoản users nếu đã có tài khoản với email tương ứng
    let linkedUserId = null;
    if (email && email.trim()) {
      const [existingUsers] = await db.query('SELECT id FROM users WHERE email = ? LIMIT 1', [email.trim()]);
      if (existingUsers.length > 0) {
        linkedUserId = existingUsers[0].id;
      }
    }

    // Kiểm tra xem đã có hồ sơ cho email hoặc linkedUserId này chưa (tránh trùng lặp hồ sơ TTS)
    if ((email && email.trim()) || linkedUserId) {
      const [existingInterns] = await db.query(
        'SELECT id, school, dept, status FROM interns WHERE (email = ? AND email != "") OR (user_id IS NOT NULL AND user_id = ?) LIMIT 1',
        [email ? email.trim() : '', linkedUserId]
      );
      if (existingInterns.length > 0) {
        const existingRec = existingInterns[0];
        const existingId = existingRec.id;

        // Chỉ cho phép gộp/cập nhật khi hồ sơ cũ là bản tự sinh từ tài khoản và còn trống thông tin (M1)
        const isDefaultSchool = !existingRec.school || existingRec.school === 'Chưa cập nhật';
        const isDefaultDept = !existingRec.dept || existingRec.dept === 'Chưa phân bổ' || existingRec.dept === 'Chưa cập nhật';
        const isPlaceholder = isDefaultSchool && isDefaultDept;

        if (!isPlaceholder) {
          return res.status(409).json({
            success: false,
            message: 'Email đã tồn tại trong hệ thống!'
          });
        }

        await db.query(`
          UPDATE interns SET
            user_id = COALESCE(?, user_id),
            name = ?, email = ?, phone = ?, school = ?, major = ?, dept = ?, mentor = ?, position = ?,
            start_date = ?, end_date = ?, status = ?, gpa = ?, skills = ?, bio = ?, projects = ?,
            birth_date = ?, course = ?, faculty = ?
          WHERE id = ?
        `, [
          linkedUserId, name, email || '', phone || '', school, major, dept,
          mentor || 'Chưa phân công', position || 'Thực tập sinh',
          sDate, eDate, internStatus, gpa || '', skills || '', bio || '', projects || '',
          finalBirthDate, course || null, faculty || null, existingId
        ]);

        return res.status(201).json({
          success: true,
          message: 'Cập nhật hồ sơ thực tập sinh thành công!',
          data: {
            id: existingId,
            name, email, phone, school, major, dept,
            mentor: mentor || 'Chưa phân công',
            position: position || 'Thực tập sinh',
            status: internStatus
          }
        });
      }
    }

    const [result] = await db.query(
      `INSERT INTO interns 
       (user_id, name, email, phone, school, major, dept, mentor, position, start_date, end_date, status, gpa, skills, bio, projects, birth_date, course, faculty)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        linkedUserId,
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
        projects || '',
        finalBirthDate,
        course || null,
        faculty || null
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

// 3. PUT /api/interns/:id (Chỉnh sửa thông tin thực tập sinh - B20)
exports.updateIntern = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name, email, phone, school, major, dept, mentor,
      position, startDate, start_date, endDate, end_date, status, gpa, skills, bio, projects,
      birthDate, birth_date, course, faculty
    } = req.body;

    // Kiểm tra xem thực tập sinh có tồn tại không (hỗ trợ cả id và user_id)
    let [existing] = await db.query('SELECT * FROM interns WHERE id = ? LIMIT 1', [id]);
    if (existing.length === 0) {
      [existing] = await db.query('SELECT * FROM interns WHERE user_id = ? LIMIT 1', [id]);
    }
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy thực tập sinh với ID = ${id}`
      });
    }
    const current = existing[0];
    const targetId = current.id;
    const targetUserId = current.user_id;

    // B20: Kiểm tra email nếu có
    if (email !== undefined && email !== null && email.trim() !== '') {
      if (!EMAIL_REGEX.test(email.trim())) {
        return res.status(400).json({
          success: false,
          message: 'Định dạng email không hợp lệ!'
        });
      }
    }

    // B20: Kiểm tra GPA nếu có
    if (gpa !== undefined && gpa !== null && String(gpa).trim() !== '') {
      const gpaNum = parseFloat(gpa);
      if (isNaN(gpaNum) || gpaNum < 0 || gpaNum > 4) {
        return res.status(400).json({
          success: false,
          message: 'Điểm GPA không hợp lệ! GPA phải là số trong khoảng từ 0.0 đến 4.0.'
        });
      }
    }

    const sDate = (startDate !== undefined || start_date !== undefined) ? parseDateString(startDate || start_date) : undefined;
    const eDate = (endDate !== undefined || end_date !== undefined) ? parseDateString(endDate || end_date) : undefined;

    // B20: Kiểm tra ngày kết thúc >= ngày bắt đầu
    const effectiveSDate = sDate !== undefined ? sDate : (current.start_date ? current.start_date.toISOString().split('T')[0] : null);
    const effectiveEDate = eDate !== undefined ? eDate : (current.end_date ? current.end_date.toISOString().split('T')[0] : null);
    if (effectiveSDate && effectiveEDate) {
      if (new Date(effectiveEDate).getTime() < new Date(effectiveSDate).getTime()) {
        return res.status(400).json({
          success: false,
          message: 'Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu!'
        });
      }
    }

    const finalBirthDate = (birthDate !== undefined || birth_date !== undefined) ? parseDateString(birthDate || birth_date) : undefined;

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
        start_date = CASE WHEN ? = 1 THEN ? ELSE start_date END,
        end_date = CASE WHEN ? = 1 THEN ? ELSE end_date END,
        status = COALESCE(?, status),
        gpa = COALESCE(?, gpa),
        skills = COALESCE(?, skills),
        bio = COALESCE(?, bio),
        projects = COALESCE(?, projects),
        birth_date = CASE WHEN ? = 1 THEN ? ELSE birth_date END,
        course = COALESCE(?, course),
        faculty = COALESCE(?, faculty)
       WHERE id = ?`,
      [
        name !== undefined ? name : null,
        email !== undefined ? email : null,
        phone !== undefined ? phone : null,
        school !== undefined ? school : null,
        major !== undefined ? major : null,
        dept !== undefined ? dept : null,
        mentor !== undefined ? mentor : null,
        position !== undefined ? position : null,
        sDate !== undefined ? 1 : 0, sDate !== undefined ? sDate : null,
        eDate !== undefined ? 1 : 0, eDate !== undefined ? eDate : null,
        status !== undefined ? status : null,
        gpa !== undefined ? gpa : null,
        skills !== undefined ? skills : null,
        bio !== undefined ? bio : null,
        projects !== undefined ? projects : null,
        finalBirthDate !== undefined ? 1 : 0, finalBirthDate !== undefined ? finalBirthDate : null,
        course !== undefined ? course : null,
        faculty !== undefined ? faculty : null,
        targetId
      ]
    );

    // Đồng bộ tên và số điện thoại vào bảng users nếu có tài khoản user tương ứng
    if ((name || phone) && targetUserId) {
      await db.query(
        `UPDATE users SET
          name = COALESCE(?, name),
          phone = COALESCE(?, phone)
         WHERE id = ?`,
        [name !== undefined ? name : null, phone !== undefined ? phone : null, targetUserId]
      );
    }

    return res.status(200).json({
      success: true,
      message: 'Cập nhật hồ sơ thực tập sinh thành công!',
      data: { id: Number(targetId), ...req.body }
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
    let [interns] = await db.query('SELECT * FROM interns WHERE id = ? LIMIT 1', [id]);
    if (interns.length === 0) {
      [interns] = await db.query('SELECT * FROM interns WHERE user_id = ? LIMIT 1', [id]);
    }
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

    // Lấy thông tin hợp đồng thực tế từ bảng contracts
    const [contracts] = await db.query(
      `SELECT id, title, code, file_name AS name, file_url AS fileUrl,
              status AS reviewStatus, reject_reason AS rejectReason,
              DATE_FORMAT(created_at, '%d/%m/%Y %H:%i') AS uploadedAt,
              DATE_FORMAT(confirmed_at, '%d/%m/%Y %H:%i') AS confirmedAt
       FROM contracts 
       WHERE intern_id = ?
       ORDER BY id DESC LIMIT 1`,
      [intern.id]
    );

    if (contracts.length > 0) {
      const c = contracts[0];
      docs.push({
        id: c.id,
        name: c.name || 'Hop_Dong_Thuc_Tap.pdf',
        type: 'CONTRACT',
        fileUrl: c.fileUrl,
        size: 'Tài liệu hợp đồng',
        reviewStatus: c.reviewStatus,
        rejectReason: c.rejectReason,
        uploadedAt: c.uploadedAt,
        confirmedAt: c.confirmedAt,
        code: c.code,
        title: c.title
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        internId: intern.id,
        internName: intern.name,
        name: intern.name,
        email: intern.email,
        phone: intern.phone,
        birthDate: intern.birth_date,
        birth_date: intern.birth_date,
        school: intern.school,
        faculty: intern.faculty,
        major: intern.major,
        course: intern.course,
        dept: intern.dept,
        mentor: intern.mentor,
        position: intern.position,
        startDate: intern.start_date,
        endDate: intern.end_date,
        startFormatted: intern.start_date ? new Date(intern.start_date).toLocaleDateString('vi-VN') : '',
        endFormatted: intern.end_date ? new Date(intern.end_date).toLocaleDateString('vi-VN') : '',
        appliedDate: intern.created_at ? new Date(intern.created_at).toLocaleDateString('vi-VN') : new Date().toLocaleDateString('vi-VN'),
        status: intern.status,
        rejectReason: intern.reject_reason,
        rejectNote: intern.reject_note,
        contract: contracts.length > 0 ? contracts[0] : null,
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

// 5. PATCH /api/interns/:id/documents/status (Duyệt hoặc từ chối hồ sơ tài liệu - B12)
exports.updateDocumentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note, rejectReason } = req.body; // status: "approved" | "rejected"

    // B12: Kiểm tra tính hợp lệ của status
    if (!status || (status !== 'approved' && status !== 'rejected')) {
      return res.status(400).json({
        success: false,
        message: 'Trạng thái không hợp lệ! Chỉ chấp nhận "approved" hoặc "rejected".'
      });
    }

    const reason = (rejectReason || note || '').trim();
    // B12: Bắt buộc cung cấp lý do khi từ chối hồ sơ
    if (status === 'rejected' && !reason) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp lý do từ chối hồ sơ!'
      });
    }

    let [internRows] = await db.query('SELECT * FROM interns WHERE id = ? LIMIT 1', [id]);
    if (internRows.length === 0) {
      [internRows] = await db.query('SELECT * FROM interns WHERE user_id = ? LIMIT 1', [id]);
    }
    if (internRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy thực tập sinh với ID = ${id}`
      });
    }
    const intern = internRows[0];
    const actualInternId = intern.id;

    // Cập nhật trạng thái tài liệu
    await db.query(
      `UPDATE documents SET 
        review_status = ?,
        reject_reason = ?,
        reject_note = ?
       WHERE intern_id = ?`,
      [status, status === 'rejected' ? reason : null, note || null, actualInternId]
    );

    // Cập nhật trạng thái tổng thể của thực tập sinh tương ứng
    const newInternStatus = status === 'approved' ? 'Đang thực tập' : 'Đã từ chối';
    await db.query(
      `UPDATE interns SET 
        status = ?,
        reject_reason = ?,
        reject_note = ?
       WHERE id = ?`,
      [newInternStatus, status === 'rejected' ? reason : null, note || null, actualInternId]
    );

    // B12: Gửi email thông báo kết quả xét duyệt đến ứng viên
    let emailResult = null;
    let emailSent = false;
    const candidateEmail = intern.email;
    const candidateName = intern.name;

    if (candidateEmail && candidateEmail.trim()) {
      try {
        emailResult = await emailService.sendReviewResultEmail({
          to: candidateEmail,
          candidateName: candidateName,
          status: status,
          reason: reason,
          note: note || ''
        });
        emailSent = emailResult ? !!emailResult.success : false;
        console.log(`📧 [SYSTEM EMAIL] Đã gửi email kết quả (${newInternStatus}) đến: ${candidateName} <${candidateEmail}> - Kết quả: ${emailSent}`);
      } catch (e) {
        console.warn('⚠️ Lỗi gửi email thông báo kết quả xét duyệt:', e.message);
        emailSent = false;
      }
    }

    return res.status(200).json({
      success: true,
      message: status === 'approved' 
        ? `Duyệt hồ sơ thành công! ${emailSent ? `Đã gửi email thông báo kết quả đến ${candidateEmail}.` : ''}` 
        : `Đã từ chối hồ sơ! ${emailSent ? `Đã gửi email thông báo kết quả đến ${candidateEmail}.` : ''}`,
      emailSent: emailSent,
      emailRecipient: candidateEmail || '',
      previewUrl: emailResult ? emailResult.previewUrl : null,
      data: {
        internId: Number(actualInternId),
        reviewStatus: status,
        status: newInternStatus,
        emailNotification: {
          sent: emailSent,
          to: candidateEmail,
          candidate: candidateName,
          result: newInternStatus,
          previewUrl: emailResult ? emailResult.previewUrl : null,
          timestamp: new Date().toISOString()
        },
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

// 6. POST /api/interns/:id/documents (Tải lên file tài liệu CV, đơn xin thực tập - B13)
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
      if (req.file.path && fs.existsSync(req.file.path)) {
        try { fs.unlinkSync(req.file.path); } catch (e) {}
      }
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin internId!'
      });
    }

    // B13: Tìm ID chính xác trong bảng interns. Nếu không tìm thấy, XÓA file tải lên và trả về 404 (Không tạo intern giả)
    let [internRows] = await db.query('SELECT id, status, name, email FROM interns WHERE id = ? LIMIT 1', [internId]);
    if (internRows.length === 0) {
      [internRows] = await db.query('SELECT id, status, name, email FROM interns WHERE user_id = ? LIMIT 1', [internId]);
    }
    if (internRows.length === 0) {
      if (req.file.path && fs.existsSync(req.file.path)) {
        try { fs.unlinkSync(req.file.path); } catch (e) {}
      }
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy thực tập sinh với ID = ${internId}!`
      });
    }
    const targetInternId = internRows[0].id;

    // Định dạng dung lượng hiển thị
    const bytes = req.file.size;
    let sizeStr = bytes + ' B';
    if (bytes >= 1024 * 1024) {
      sizeStr = (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    } else if (bytes >= 1024) {
      sizeStr = (bytes / 1024).toFixed(0) + ' KB';
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    let originalName = req.file.originalname;
    try {
      originalName = Buffer.from(req.file.originalname, 'latin1').toString('utf8');
    } catch (e) {}

    const type = docType || (originalName.toLowerCase().includes('cv') ? 'CV' : 'APPLICATION_LETTER');

    // B13: Xóa file vật lý cũ của tài liệu cùng loại nếu có trước khi cập nhật file mới
    const [oldDocs] = await db.query(
      'SELECT file_url FROM documents WHERE intern_id = ? AND doc_type = ?',
      [targetInternId, type]
    );
    if (oldDocs.length > 0) {
      oldDocs.forEach(d => {
        if (d.file_url) {
          const oldPath = path.join(__dirname, '..', d.file_url);
          if (fs.existsSync(oldPath)) {
            try { fs.unlinkSync(oldPath); } catch (e) {}
          }
        }
      });
    }
    await db.query('DELETE FROM documents WHERE intern_id = ? AND doc_type = ?', [targetInternId, type]);

    // Lưu thông tin file vào bảng documents trong MySQL
    const [result] = await db.query(
      `INSERT INTO documents (intern_id, doc_name, doc_type, file_url, file_size, review_status)
       VALUES (?, ?, ?, ?, ?, 'pending')`,
      [targetInternId, originalName, type, fileUrl, sizeStr]
    );

    // B13: Khi tải lên lại hồ sơ (kể cả sau khi bị từ chối), chuyển trạng thái thực tập sinh về 'Chờ xét duyệt'
    await db.query(
      "UPDATE interns SET status = 'Chờ xét duyệt' WHERE id = ? AND (status = 'Chưa hoàn thiện' OR status = 'Đã từ chối' OR status = '' OR status IS NULL)",
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

// 7. DELETE /api/interns/:id (Xóa thực tập sinh khỏi Database và dọn dẹp file - B20)
exports.deleteIntern = async (req, res) => {
  try {
    const { id } = req.params;
    const [existing] = await db.query('SELECT id FROM interns WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy thực tập sinh với ID = ${id}`
      });
    }

    // B20: Xóa các file vật lý của tài liệu và hợp đồng gắn với thực tập sinh
    const [docs] = await db.query('SELECT file_url FROM documents WHERE intern_id = ?', [id]);
    const [contracts] = await db.query('SELECT file_url FROM contracts WHERE intern_id = ?', [id]);
    [...docs, ...contracts].forEach(item => {
      if (item && item.file_url) {
        const filePath = path.join(__dirname, '..', item.file_url);
        if (fs.existsSync(filePath)) {
          try { fs.unlinkSync(filePath); } catch (e) {}
        }
      }
    });

    // Xóa các bản ghi liên quan trong các bảng con
    await db.query('DELETE FROM documents WHERE intern_id = ?', [id]);
    await db.query('DELETE FROM contracts WHERE intern_id = ?', [id]);
    await db.query('DELETE FROM attendance WHERE intern_id = ?', [id]);
    await db.query('DELETE FROM leaves WHERE intern_id = ?', [id]);
    await db.query('DELETE FROM tasks WHERE intern_id = ?', [id]);
    await db.query('DELETE FROM reports WHERE intern_id = ?', [id]);
    await db.query('DELETE FROM evaluations WHERE intern_id = ?', [id]);

    const [result] = await db.query('DELETE FROM interns WHERE id = ?', [id]);

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

// 8. DELETE /api/interns/:id/documents/:docType (Xóa tài liệu CV hoặc đơn xin thực tập - B13)
exports.deleteDocument = async (req, res) => {
  try {
    const { id, docType } = req.params;

    // Tìm intern_id thực tế (hỗ trợ cả id và user_id)
    let [internRows] = await db.query('SELECT id FROM interns WHERE id = ? LIMIT 1', [id]);
    if (internRows.length === 0) {
      [internRows] = await db.query('SELECT id FROM interns WHERE user_id = ? LIMIT 1', [id]);
    }
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

// 9. GET /api/interns/emails/history (Lấy danh sách email hệ thống đã gửi - User Story 8)
exports.getEmailHistory = async (req, res) => {
  try {
    const { email } = req.query;
    const emails = await emailService.getEmailHistory(email || '');
    return res.status(200).json({
      success: true,
      total: emails.length,
      data: emails
    });
  } catch (error) {
    console.error('Lỗi API getEmailHistory:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi lấy lịch sử email',
      error: error.message
    });
  }
};
