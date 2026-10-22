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

    if (intern_id) {
      query += ` AND t.intern_id = ?`;
      params.push(intern_id);
    }
    if (mentor_id) {
      query += ` AND t.mentor_id = ?`;
      params.push(mentor_id);
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

// POST /api/tasks: Mentor giao nhiệm vụ cho thực tập sinh (STT 15)
exports.createTask = async (req, res) => {
  try {
    const { intern_id, mentor_id, title, description, deadline, priority } = req.body;

    if (!intern_id || !title) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp thực tập sinh và tiêu đề nhiệm vụ!' });
    }

    const [result] = await db.query(
      `INSERT INTO tasks (intern_id, mentor_id, title, description, deadline, priority, progress, status) 
       VALUES (?, ?, ?, ?, ?, ?, 0, 'todo')`,
      [intern_id, mentor_id || null, title, description || '', deadline || null, priority || 'medium']
    );

    // Tự động tạo thông báo in-app cho thực tập sinh
    try {
      const [internRows] = await db.query('SELECT user_id, name FROM interns WHERE id = ?', [intern_id]);
      if (internRows.length > 0 && internRows[0].user_id) {
        await db.query(
          `INSERT INTO inapp_notifications (user_id, role, title, content, type, link) 
           VALUES (?, 'Thực tập sinh', ?, ?, 'info', 'intern.html#progress')`,
          [internRows[0].user_id, 'Nhiệm vụ mới được giao: ' + title, `Mentor đã giao cho bạn nhiệm vụ "${title}". Hạn hoàn thành: ${deadline || 'Không có'}`]
        );
      }
    } catch (notifErr) {}

    return res.status(201).json({
      success: true,
      message: 'Giao nhiệm vụ thành công!',
      taskId: result.insertId
    });
  } catch (error) {
    console.error('Lỗi tạo nhiệm vụ:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi tạo nhiệm vụ', error: error.message });
  }
};

// PUT /api/tasks/:id/progress: Thực tập sinh cập nhật tiến độ công việc (STT 16)
exports.updateTaskProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const { progress, status, intern_note } = req.body;

    let autoStatus = status;
    if (progress !== undefined && !status) {
      if (Number(progress) >= 100) autoStatus = 'done';
      else if (Number(progress) > 0) autoStatus = 'in_progress';
      else autoStatus = 'todo';
    }

    const [result] = await db.query(
      `UPDATE tasks 
       SET progress = COALESCE(?, progress), 
           status = COALESCE(?, status), 
           intern_note = COALESCE(?, intern_note),
           updated_at = NOW() 
       WHERE id = ?`,
      [progress !== undefined ? progress : null, autoStatus || null, intern_note !== undefined ? intern_note : null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy nhiệm vụ!' });
    }

    return res.status(200).json({
      success: true,
      message: 'Cập nhật tiến độ nhiệm vụ thành công!'
    });
  } catch (error) {
    console.error('Lỗi cập nhật tiến độ task:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật tiến độ', error: error.message });
  }
};

// DELETE /api/tasks/:id: Xóa nhiệm vụ
exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM tasks WHERE id = ?', [id]);
    return res.status(200).json({ success: true, message: 'Đã xóa nhiệm vụ thành công!' });
  } catch (error) {
    console.error('Lỗi xóa task:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi xóa nhiệm vụ', error: error.message });
  }
};
