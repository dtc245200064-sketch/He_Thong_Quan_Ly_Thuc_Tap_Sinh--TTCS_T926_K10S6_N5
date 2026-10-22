const db = require('../config/db');
const { sendMeetingEmail } = require('../services/email.service');

// GET /api/notifications: Lấy danh sách thông báo in-app cho TTS / người dùng (STT 36)
exports.getInAppNotifications = async (req, res) => {
  try {
    const { user_id, role } = req.query;
    let query = 'SELECT * FROM inapp_notifications WHERE 1=1';
    const params = [];

    if (user_id) {
      query += ' AND (user_id = ? OR user_id IS NULL)';
      params.push(user_id);
    }
    if (role) {
      query += ' AND (role = ? OR role IS NULL)';
      params.push(role);
    }

    query += ' ORDER BY id DESC LIMIT 50';
    const [rows] = await db.query(query, params);

    return res.status(200).json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Lỗi lấy thông báo in-app:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi lấy thông báo', error: error.message });
  }
};

// PUT /api/notifications/:id/read: Đánh dấu thông báo đã đọc
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('UPDATE inapp_notifications SET is_read = TRUE WHERE id = ?', [id]);
    return res.status(200).json({ success: true, message: 'Đã đánh dấu thông báo là đã đọc' });
  } catch (error) {
    console.error('Lỗi cập nhật trạng thái thông báo:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật thông báo', error: error.message });
  }
};

// PUT /api/notifications/read-all: Đánh dấu tất cả thông báo đã đọc
exports.markAllAsRead = async (req, res) => {
  try {
    const { user_id, role } = req.body;
    let query = 'UPDATE inapp_notifications SET is_read = TRUE WHERE 1=1';
    const params = [];
    if (user_id) {
      query += ' AND (user_id = ? OR user_id IS NULL)';
      params.push(user_id);
    }
    if (role) {
      query += ' AND (role = ? OR role IS NULL)';
      params.push(role);
    }
    await db.query(query, params);
    return res.status(200).json({ success: true, message: 'Đã đánh dấu tất cả thông báo là đã đọc' });
  } catch (error) {
    console.error('Lỗi đánh dấu tất cả thông báo đã đọc:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

// DELETE /api/notifications/:id: Xóa thông báo
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM inapp_notifications WHERE id = ?', [id]);
    return res.status(200).json({ success: true, message: 'Đã xóa thông báo thành công' });
  } catch (error) {
    console.error('Lỗi xóa thông báo:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi xóa thông báo', error: error.message });
  }
};

// POST /api/notifications: Tạo thông báo in-app mới
exports.createNotification = async (req, res) => {
  try {
    const { user_id, role, title, content, type, link } = req.body;
    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Tiêu đề và nội dung là bắt buộc!' });
    }
    const [result] = await db.query(
      'INSERT INTO inapp_notifications (user_id, role, title, content, type, link) VALUES (?, ?, ?, ?, ?, ?)',
      [user_id || null, role || 'Thực tập sinh', title, content, type || 'info', link || '']
    );
    return res.status(201).json({ success: true, message: 'Đã tạo thông báo thành công', id: result.insertId });
  } catch (error) {
    console.error('Lỗi tạo thông báo:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi tạo thông báo', error: error.message });
  }
};

// POST /api/notifications/meetings: Tạo lịch họp & tự động gửi email cho TTS (STT 35)
exports.createMeeting = async (req, res) => {
  try {
    const { title, meeting_date, start_time, end_time, location, link, host_name, intern_ids, notes } = req.body;

    if (!title || !meeting_date || !start_time || !end_time) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền tiêu đề, ngày họp và khung giờ họp!' });
    }

    const internIdsArray = Array.isArray(intern_ids) ? intern_ids : (intern_ids ? [intern_ids] : []);

    const [result] = await db.query(
      `INSERT INTO meetings (title, meeting_date, start_time, end_time, location, link, host_name, intern_ids, notes, email_sent)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
      [title, meeting_date, start_time, end_time, location || 'Online Meet', link || '', host_name || 'Mentor / HR', JSON.stringify(internIdsArray), notes || '']
    );

    // Tìm danh sách email và tên của các thực tập sinh để tự động gửi email (STT 35)
    let emailResults = [];
    if (internIdsArray.length > 0) {
      const [interns] = await db.query('SELECT id, name, email, user_id FROM interns WHERE id IN (?)', [internIdsArray]);
      for (const intern of interns) {
        if (intern.email) {
          const mailRes = await sendMeetingEmail({
            to: intern.email,
            internName: intern.name,
            meetingTitle: title,
            meetingDate: meeting_date,
            startTime: start_time,
            endTime: end_time,
            location: location,
            link: link,
            hostName: host_name,
            notes: notes
          });
          emailResults.push(mailRes);

          // Tạo thêm thông báo in-app cho thực tập sinh (STT 36)
          if (intern.user_id) {
            await db.query(
              `INSERT INTO inapp_notifications (user_id, role, title, content, type, link)
               VALUES (?, 'Thực tập sinh', ?, ?, 'info', 'intern.html#schedule')`,
              [
                intern.user_id,
                `Lịch họp: ${title}`,
                `Cuộc họp diễn ra lúc ${start_time} - ${end_time} ngày ${meeting_date}. Địa điểm: ${location || 'Online Meet'}`
              ]
            );
          }
        }
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Tạo lịch họp thành công và đã gửi email thông báo tự động cho thực tập sinh!',
      meetingId: result.insertId,
      emailsSentCount: emailResults.length,
      emailResults
    });
  } catch (error) {
    console.error('Lỗi tạo lịch họp & gửi email:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi tạo lịch họp', error: error.message });
  }
};

// GET /api/notifications/meetings: Lấy danh sách các lịch họp
exports.getMeetings = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM meetings ORDER BY meeting_date DESC, id DESC');
    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error('Lỗi lấy danh sách lịch họp:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi lấy lịch họp', error: error.message });
  }
};
