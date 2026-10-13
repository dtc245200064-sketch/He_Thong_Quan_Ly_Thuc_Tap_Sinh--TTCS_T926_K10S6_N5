const db = require('../config/db');

// GET /api/departments
exports.getDepartments = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM departments ORDER BY id ASC');
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Lỗi lấy danh sách phòng ban:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ' });
  }
};

// POST /api/departments
exports.createDepartment = async (req, res) => {
  try {
    const { code, name, description } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Tên phòng ban không được để trống' });
    }
    const deptName = name.trim();
    let deptCode = code ? code.trim().toUpperCase() : '';
    if (!deptCode) {
      const clean = deptName.replace(/^(phòng|ban)\s+/i, '').trim();
      const words = clean.split(/[\s,&-]+/).filter(Boolean);
      deptCode = words.length >= 2 ? words.map(w => w[0].toUpperCase()).join('').substring(0, 5) : clean.substring(0, 4).toUpperCase();
    }

    const [existing] = await db.query('SELECT * FROM departments WHERE code = ? OR name = ?', [deptCode, deptName]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Mã hoặc tên phòng ban đã tồn tại trong hệ thống' });
    }

    const [result] = await db.query(
      'INSERT INTO departments (code, name, description) VALUES (?, ?, ?)',
      [deptCode, deptName, description || `Phòng ban ${deptName}`]
    );

    const [newDept] = await db.query('SELECT * FROM departments WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, message: 'Thêm phòng ban thành công', data: newDept[0] });
  } catch (error) {
    console.error('Lỗi tạo phòng ban:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ' });
  }
};

// PUT /api/departments/:id
exports.updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name, description } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Tên phòng ban không được để trống' });
    }
    const deptName = name.trim();
    const deptCode = code ? code.trim().toUpperCase() : '';

    const [existing] = await db.query('SELECT * FROM departments WHERE (code = ? OR name = ?) AND id != ?', [deptCode, deptName, id]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Mã hoặc tên phòng ban đã trùng với phòng ban khác' });
    }

    await db.query(
      'UPDATE departments SET code = ?, name = ?, description = ? WHERE id = ?',
      [deptCode, deptName, description || '', id]
    );

    const [updated] = await db.query('SELECT * FROM departments WHERE id = ?', [id]);
    res.json({ success: true, message: 'Cập nhật phòng ban thành công', data: updated[0] });
  } catch (error) {
    console.error('Lỗi cập nhật phòng ban:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ' });
  }
};

// DELETE /api/departments/:id
exports.deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM departments WHERE id = ?', [id]);
    res.json({ success: true, message: 'Đã xóa phòng ban thành công' });
  } catch (error) {
    console.error('Lỗi xóa phòng ban:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ' });
  }
};
