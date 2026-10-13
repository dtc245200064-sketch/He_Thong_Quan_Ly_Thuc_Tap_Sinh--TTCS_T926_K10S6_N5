const db = require('../config/db');
exports.list = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT id, name, email FROM users WHERE role IN ('Mentor', 'MENTOR') AND status = 'active' ORDER BY name, id");
    res.json({ success: true, data: rows });
  } catch (e) { res.status(500).json({ success: false, message: 'Không tải được danh sách mentor' }); }
};
exports.assign = async (req, res) => {
  const internId = Number(req.params.id), mentorId = Number(req.body.mentor_id);
  if (!Number.isSafeInteger(internId) || internId <= 0 || !Number.isSafeInteger(mentorId) || mentorId <= 0) {
    return res.status(400).json({ success: false, message: 'Vui lòng chọn TTS và mentor hợp lệ' });
  }
  let conn;
  try {
    conn = await db.getConnection();
    await conn.beginTransaction();
    const [interns] = await conn.query('SELECT id, status FROM interns WHERE id = ? FOR UPDATE', [internId]);
    if (!interns.length) { await conn.rollback(); return res.status(404).json({ success: false, message: 'Không tìm thấy thực tập sinh' }); }
    if (interns[0].status !== 'Đang thực tập') { await conn.rollback(); return res.status(409).json({ success: false, message: 'Chỉ phân công cho TTS đang thực tập' }); }
    const [mentors] = await conn.query("SELECT id, name FROM users WHERE id = ? AND role IN ('Mentor', 'MENTOR') AND status = 'active' FOR UPDATE", [mentorId]);
    if (!mentors.length) { await conn.rollback(); return res.status(400).json({ success: false, message: 'Mentor không tồn tại hoặc đã bị khóa' }); }
    // Compatibility: existing schema and all current screens store interns.mentor as a name.
    await conn.query('UPDATE interns SET mentor = ? WHERE id = ?', [mentors[0].name, internId]);
    await conn.commit();
    res.json({ success: true, data: { intern_id: internId, mentor_id: mentorId, mentor: mentors[0].name } });
  } catch (e) {
    if (conn) await conn.rollback();
    res.status(500).json({ success: false, message: 'Không thể lưu phân công mentor' });
  } finally { if (conn) conn.release(); }
};
