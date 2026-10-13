const db = require('../config/db');

// GET /api/programs
exports.getPrograms = async (req, res) => {
  try {
    const { dept, status } = req.query;
    let sql = 'SELECT * FROM programs WHERE 1=1';
    const params = [];

    if (dept && dept !== 'all') {
      sql += ' AND dept = ?';
      params.push(dept);
    }
    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }

    sql += ' ORDER BY id DESC';
    const [rows] = await db.query(sql, params);
    
    // Format schedule if stored as JSON string
    const formatted = rows.map(r => {
      let schedule = null;
      if (r.schedule) {
        try {
          schedule = typeof r.schedule === 'string' ? JSON.parse(r.schedule) : r.schedule;
        } catch (e) {
          schedule = r.schedule;
        }
      }
      return { ...r, schedule };
    });

    res.json({ success: true, data: formatted });
  } catch (error) {
    console.error('Lỗi lấy danh sách chương trình:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ' });
  }
};

// POST /api/programs
exports.createProgram = async (req, res) => {
  try {
    const { name, dept, mentor_default, start_date, end_date, max_interns, description, schedule } = req.body;
    if (!name || !dept || !start_date || !end_date) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin bắt buộc' });
    }

    let scheduleStr = null;
    if (schedule) {
      scheduleStr = typeof schedule === 'string' ? schedule : JSON.stringify(schedule);
    }

    const [result] = await db.query(
      'INSERT INTO programs (name, dept, mentor_default, start_date, end_date, max_interns, description, schedule) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, dept, mentor_default || null, start_date, end_date, max_interns || 10, description || null, scheduleStr]
    );

    const [created] = await db.query('SELECT * FROM programs WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, message: 'Tạo chương trình thành công', data: created[0] });
  } catch (error) {
    console.error('Lỗi tạo chương trình:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ' });
  }
};

// PUT /api/programs/:id
exports.updateProgram = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, dept, mentor_default, start_date, end_date, max_interns, status, description, schedule } = req.body;

    const [existing] = await db.query('SELECT * FROM programs WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy chương trình' });
    }

    const current = existing[0];
    let scheduleStr = current.schedule;
    if (schedule !== undefined) {
      scheduleStr = typeof schedule === 'string' ? schedule : JSON.stringify(schedule);
    }

    await db.query(
      `UPDATE programs SET 
        name = ?, 
        dept = ?, 
        mentor_default = ?, 
        start_date = ?, 
        end_date = ?, 
        max_interns = ?, 
        status = ?, 
        description = ?, 
        schedule = ? 
      WHERE id = ?`,
      [
        name !== undefined ? name : current.name,
        dept !== undefined ? dept : current.dept,
        mentor_default !== undefined ? mentor_default : current.mentor_default,
        start_date !== undefined ? start_date : current.start_date,
        end_date !== undefined ? end_date : current.end_date,
        max_interns !== undefined ? max_interns : current.max_interns,
        status !== undefined ? status : current.status,
        description !== undefined ? description : current.description,
        scheduleStr,
        id
      ]
    );

    const [updated] = await db.query('SELECT * FROM programs WHERE id = ?', [id]);
    let retSchedule = null;
    if (updated[0].schedule) {
      try {
        retSchedule = JSON.parse(updated[0].schedule);
      } catch (e) {
        retSchedule = updated[0].schedule;
      }
    }
    res.json({ success: true, message: 'Cập nhật chương trình thành công', data: { ...updated[0], schedule: retSchedule } });
  } catch (error) {
    console.error('Lỗi cập nhật chương trình:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ' });
  }
};

// DELETE /api/programs/:id
exports.deleteProgram = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM programs WHERE id = ?', [id]);
    res.json({ success: true, message: 'Đã xóa chương trình thành công' });
  } catch (error) {
    console.error('Lỗi xóa chương trình:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ' });
  }
};
