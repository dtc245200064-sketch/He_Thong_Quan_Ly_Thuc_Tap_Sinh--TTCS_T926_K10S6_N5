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
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Lỗi lấy danh sách chương trình:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ' });
  }
};

// POST /api/programs
exports.createProgram = async (req, res) => {
  try {
    const { name, dept, mentor_default, start_date, end_date, max_interns, description } = req.body;
    if (!name || !dept || !start_date || !end_date) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin bắt buộc' });
    }

    const [result] = await db.query(
      'INSERT INTO programs (name, dept, mentor_default, start_date, end_date, max_interns, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, dept, mentor_default || null, start_date, end_date, max_interns || 10, description || null]
    );

    const [created] = await db.query('SELECT * FROM programs WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, message: 'Tạo chương trình thành công', data: created[0] });
  } catch (error) {
    console.error('Lỗi tạo chương trình:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ' });
  }
};
