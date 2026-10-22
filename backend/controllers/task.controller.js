const db = require('../config/db');

// GET /api/tasks: Lấy danh sách nhiệm vụ
exports.getTasks = async (req, res) => {
  try {
    const { intern_id, mentor_id, status } = req.query;
    let query = `
      SELECT t.*, i.name as intern_name, i.email as intern_email, m.name as mentor_name 
      FROM tasks t 
      LEFT JOIN interns i ON t.intern_id = i.id 
      LEFT JOIN mentors m ON t.mentor_id = m.id 
      WHERE 1=1
    `;
    const params = [];

    // Bảo vệ quyền xem (B04)
    if (req.user && req.user.role === 'Thực tập sinh') {
      const myInternId = req.user.internId || -1;
      query += ` AND (t.intern_id = ? OR i.user_id = ?)`;
      params.push(myInternId, req.user.id);
    } else if (req.user && req.user.role === 'Mentor') {
      const myMentorId = req.user.mentorId || -1;
      query += ` AND (t.mentor_id = ? OR i.mentor_id = ?)`;
      params.push(myMentorId, myMentorId);
    } else {
      if (intern_id) {
        query += ` AND t.intern_id = ?`;
        params.push(intern_id);
      }
      if (mentor_id) {
        query += ` AND t.mentor_id = ?`;
        params.push(mentor_id);
      }
    }

    if (status) {
      query += ` AND t.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY t.deadline ASC, t.id DESC`;
    const [rows] = await db.query(query, params);

    return res.status(200).json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Lỗi lấy danh sách task:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi lấy danh sách nhiệm vụ', error: error.message });
  }
};

// POST /api/tasks: Mentor hoặc HR/Admin giao nhiệm vụ (STT 15)
exports.createTask = async (req, res) => {
  try {
    const { intern_id, mentor_id, title, description, deadline, priority, progress, intern_note } = req.body;
    const effectiveInternId = intern_id || (req.user && req.user.internId);

    if (!effectiveInternId || !title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp thực tập sinh và tiêu đề nhiệm vụ!' });
    }

    // Nếu là Thực tập sinh: Cho phép tự ghi nhận tiến độ công việc của chính mình
    if (req.user && req.user.role === 'Thực tập sinh') {
      let targetInternId = intern_id;
      let [myRows] = await db.query('SELECT id, mentor_id FROM interns WHERE id = ? OR user_id = ?', [intern_id || -1, req.user.id]);
      if (myRows.length === 0) {
        [myRows] = await db.query('SELECT id, mentor_id FROM interns WHERE user_id = ? LIMIT 1', [req.user.id]);
      }
      if (myRows.length > 0) {
        targetInternId = myRows[0].id;
      }
      const taskProgress = progress !== undefined ? Math.min(100, Math.max(0, parseInt(progress, 10) || 0)) : 0;
      let autoStatus = 'todo';
      if (taskProgress >= 100) autoStatus = 'done';
      else if (taskProgress > 0) autoStatus = 'in_progress';

      const [result] = await db.query(
        `INSERT INTO tasks (intern_id, mentor_id, title, description, deadline, priority, status, progress, intern_note, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [targetInternId, myRows[0]?.mentor_id || null, title.trim(), description || '', deadline || null, 'medium', autoStatus, taskProgress, intern_note || '']
      );

      const [created] = await db.query('SELECT * FROM tasks WHERE id = ?', [result.insertId]);
      return res.status(201).json({
        success: true,
        message: 'Thêm cập nhật tiến độ thành công!',
        data: created[0]
      });
    }

    // Xác định ID thực tế trong bảng interns
    let [internRows] = await db.query('SELECT id, user_id, mentor_id FROM interns WHERE id = ?', [intern_id]);
    if (internRows.length === 0) {
      [internRows] = await db.query('SELECT id, user_id, mentor_id FROM interns WHERE user_id = ?', [intern_id]);
    }

    if (internRows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Chưa tìm thấy hồ sơ thực tập sinh tương ứng trong hệ thống. Vui lòng tạo/duyệt hồ sơ TTS trước khi thêm nhiệm vụ!'
      });
    }

    const actualInternId = internRows[0].id;

    // Kiểm tra quyền của Mentor: Mentor chỉ giao task cho TTS thuộc nhóm của mình (B04 & S3-01)
    if (req.user && req.user.role === 'Mentor') {
      const myMentorId = req.user.mentorId;
      if (!myMentorId || (internRows[0].mentor_id && internRows[0].mentor_id !== myMentorId)) {
        return res.status(403).json({
          success: false,
          message: 'Bạn chỉ có quyền giao nhiệm vụ cho thực tập sinh thuộc nhóm hướng dẫn của mình!'
        });
      }
    }

    const validPriorities = ['low', 'medium', 'high', 'urgent'];
    const taskPriority = priority && validPriorities.includes(priority) ? priority : 'medium';

    const taskProgress = progress !== undefined ? Math.min(100, Math.max(0, parseInt(progress, 10) || 0)) : 0;
    let autoStatus = 'todo';
    if (taskProgress >= 100) autoStatus = 'done';
    else if (taskProgress > 0) autoStatus = 'in_progress';

    const assignedMentorId = (req.user && req.user.role === 'Mentor' && req.user.mentorId) 
      ? req.user.mentorId 
      : (mentor_id || internRows[0].mentor_id || null);

    const [result] = await db.query(
      `INSERT INTO tasks (intern_id, mentor_id, title, description, deadline, progress, status, priority, intern_note) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [actualInternId, assignedMentorId, title.trim(), description || '', deadline || null, taskProgress, autoStatus, taskPriority, intern_note || '']
    );

    // Tự động tạo thông báo In-app cho TTS khi nhận được nhiệm vụ mới (STT 36)
    if (internRows[0].user_id) {
      await db.query(
        `INSERT INTO inapp_notifications (user_id, role, title, content, type, link) 
         VALUES (?, 'Thực tập sinh', ?, ?, 'info', 'intern.html#progress')`,
        [internRows[0].user_id, `Nhiệm vụ mới: ${title}`, `Bạn được giao nhiệm vụ "${title}". Hạn hoàn thành: ${deadline || 'Không giới hạn'}.`]
      );
    }

    const [created] = await db.query('SELECT * FROM tasks WHERE id = ?', [result.insertId]);
    return res.status(201).json({
      success: true,
      message: 'Giao nhiệm vụ thành công!',
      data: created[0]
    });
  } catch (error) {
    console.error('Lỗi tạo nhiệm vụ:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi tạo nhiệm vụ', error: error.message });
  }
};

// PUT /api/tasks/:id: Cập nhật nhiệm vụ
exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, deadline, priority, status, progress, mentor_note, intern_note } = req.body;

    const [existing] = await db.query('SELECT * FROM tasks WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy nhiệm vụ!' });
    }

    const task = existing[0];
    // Nếu là Thực tập sinh: Cho phép cập nhật tiến độ công việc của chính mình
    if (req.user && req.user.role === 'Thực tập sinh') {
      const myInternId = req.user.internId;
      const [internRows] = await db.query('SELECT id FROM interns WHERE id = ? OR user_id = ?', [task.intern_id, req.user.id]);
      if (task.intern_id !== myInternId && internRows.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'Bạn chỉ có quyền cập nhật tiến độ cho nhiệm vụ của chính mình!'
        });
      }

      let nextProgress = progress !== undefined ? Math.min(100, Math.max(0, parseInt(progress, 10) || 0)) : task.progress;
      let nextStatus = status || task.status;
      if (progress !== undefined && !status) {
        if (nextProgress >= 100) nextStatus = 'done';
        else if (nextProgress > 0) nextStatus = 'in_progress';
        else nextStatus = 'todo';
      }

      // Nếu task do Mentor giao: TTS chỉ cập nhật progress, status, intern_note (tiêu đề và deadline do Mentor quản lý)
      if (task.mentor_id) {
        await db.query(
          `UPDATE tasks 
           SET progress = ?, status = ?, intern_note = COALESCE(?, intern_note), updated_at = NOW() 
           WHERE id = ?`,
          [nextProgress, nextStatus, intern_note !== undefined ? intern_note : null, id]
        );

        return res.status(200).json({
          success: true,
          message: 'Đã cập nhật tiến độ và ghi chú báo cáo nhiệm vụ thành công!'
        });
      } else {
        // Nếu là đầu việc tự ghi nhận của TTS: Cho phép cập nhật cả tiêu đề, hạn chót và nội dung
        await db.query(
          `UPDATE tasks 
           SET title = COALESCE(?, title),
               description = COALESCE(?, description),
               deadline = COALESCE(?, deadline),
               progress = ?,
               status = ?,
               intern_note = COALESCE(?, intern_note),
               updated_at = NOW() 
           WHERE id = ?`,
          [title || task.title, description !== undefined ? description : task.description, deadline || task.deadline, nextProgress, nextStatus, intern_note !== undefined ? intern_note : null, id]
        );

        return res.status(200).json({
          success: true,
          message: 'Đã cập nhật đầu việc cá nhân thành công!'
        });
      }
    }

    let nextProgress = progress !== undefined ? Math.min(100, Math.max(0, parseInt(progress, 10) || 0)) : task.progress;
    let nextStatus = status || task.status;
    if (progress !== undefined && !status) {
      if (nextProgress >= 100) nextStatus = 'done';
      else if (nextProgress > 0) nextStatus = 'in_progress';
      else nextStatus = 'todo';
    }

    await db.query(
      `UPDATE tasks 
       SET title = COALESCE(?, title), 
           description = COALESCE(?, description), 
           deadline = COALESCE(?, deadline), 
           priority = COALESCE(?, priority), 
           status = ?, 
           progress = ?, 
           mentor_note = COALESCE(?, mentor_note), 
           intern_note = COALESCE(?, intern_note),
           updated_at = NOW() 
       WHERE id = ?`,
      [title, description, deadline, priority, nextStatus, nextProgress, mentor_note, intern_note, id]
    );

    return res.status(200).json({ success: true, message: 'Cập nhật nhiệm vụ thành công!' });
  } catch (error) {
    console.error('Lỗi cập nhật nhiệm vụ:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật nhiệm vụ', error: error.message });
  }
};

// PUT /api/tasks/:id/progress: TTS cập nhật tiến độ công việc (STT 16)
exports.updateTaskProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const { progress, intern_note } = req.body;

    if (progress === undefined) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp giá trị tiến độ (0 - 100)!' });
    }

    const [existing] = await db.query('SELECT * FROM tasks WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy nhiệm vụ!' });
    }

    const task = existing[0];

    // Kiểm tra quyền sở hữu IDOR: TTS chỉ cập nhật task của chính mình (B04 & S3-04)
    if (req.user && req.user.role === 'Thực tập sinh') {
      const myInternId = req.user.internId;
      if (task.intern_id !== myInternId) {
        return res.status(403).json({
          success: false,
          message: 'Bạn chỉ có quyền cập nhật tiến độ cho nhiệm vụ của chính mình!'
        });
      }
    }

    const val = Math.min(100, Math.max(0, parseInt(progress, 10) || 0));
    let autoStatus = 'todo';
    if (val >= 100) autoStatus = 'done';
    else if (val > 0) autoStatus = 'in_progress';

    await db.query(
      `UPDATE tasks 
       SET progress = ?, status = ?, intern_note = COALESCE(?, intern_note), updated_at = NOW() 
       WHERE id = ?`,
      [val, autoStatus, intern_note !== undefined ? intern_note : null, id]
    );

    return res.status(200).json({
      success: true,
      message: 'Cập nhật tiến độ thành công!',
      progress: val,
      status: autoStatus
    });
  } catch (error) {
    console.error('Lỗi cập nhật tiến độ:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật tiến độ', error: error.message });
  }
};

// DELETE /api/tasks/:id: Xóa nhiệm vụ
exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const [existing] = await db.query('SELECT * FROM tasks WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy nhiệm vụ để xóa!' });
    }
    const task = existing[0];

    // Phân quyền bảo vệ: Nếu là Thực tập sinh
    if (req.user && req.user.role === 'Thực tập sinh') {
      if (task.mentor_id) {
        return res.status(403).json({
          success: false,
          message: 'Thực tập sinh không có quyền xóa nhiệm vụ do Mentor phân công!'
        });
      }
      const myInternId = req.user.internId;
      const [internRows] = await db.query('SELECT id FROM interns WHERE id = ? OR user_id = ?', [task.intern_id, req.user.id]);
      if (task.intern_id !== myInternId && internRows.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'Bạn chỉ có quyền xóa đầu việc do chính mình tự ghi nhận!'
        });
      }
    }

    // Phân quyền bảo vệ: Nếu là Mentor
    if (req.user && req.user.role === 'Mentor') {
      let mentorId = req.user.mentorId;
      if (!mentorId) {
        const [mRows] = await db.query('SELECT id FROM mentors WHERE user_id = ? OR email = ? LIMIT 1', [req.user.id, req.user.email]);
        if (mRows.length > 0) mentorId = mRows[0].id;
      }
      if (mentorId) {
        const [internRows] = await db.query('SELECT id FROM interns WHERE id = ? AND mentor_id = ?', [task.intern_id, mentorId]);
        if (task.mentor_id !== mentorId && internRows.length === 0) {
          return res.status(403).json({
            success: false,
            message: 'Bạn chỉ có quyền xóa nhiệm vụ do chính bạn phân công hoặc thuộc về thực tập sinh bạn phụ trách!'
          });
        }
      }
    }

    const [result] = await db.query('DELETE FROM tasks WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy nhiệm vụ để xóa!' });
    }
    return res.status(200).json({ success: true, message: 'Đã xóa nhiệm vụ thành công!' });
  } catch (error) {
    console.error('Lỗi xóa nhiệm vụ:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi xóa nhiệm vụ', error: error.message });
  }
};
