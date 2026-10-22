/**
 * Notification Controller - Module Thông báo ứng dụng cho TTS
 * Phụ trách Backend & CSDL: Ma Công Đức (dtc245200136@ictu.edu.vn)
 * Nhiệm vụ Jira: SCRUM-56 / SCRUM-176 (Thiết kế CSDL & API Thông báo)
 */

const db = require('../config/db');
const { sendMeetingEmail } = require('../services/email.service');

/**
 * GET /api/notifications: Lấy danh sách thông báo in-app cho TTS / người dùng (STT 36)
 * @description Trả về tối đa 50 thông báo mới nhất thuộc quyền xem của người dùng
 * @param {import('express').Request} req - Request object từ Express chứa thông tin người dùng đã xác thực
 * @param {import('express').Response} res - Response object gửi kết quả về client
 * @returns {Promise<void>} Trả về JSON { success: true, data: Array<Notification> }
 */
exports.getInAppNotifications = async (req, res) => {
  try {
    let query = 'SELECT * FROM inapp_notifications WHERE 1=1';
    const params = [];

    // Bảo vệ quyền xem: Người dùng chỉ thấy thông báo của chính mình (B04)
    if (req.user) {
      query += ' AND (user_id = ? OR (user_id IS NULL AND (role = ? OR role IS NULL)))';
      params.push(req.user.id, req.user.role);
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

/**
 * PUT /api/notifications/:id/read: Đánh dấu 1 thông báo cụ thể là đã đọc
 * @param {import('express').Request} req - Request object chứa param id của thông báo
 * @param {import('express').Response} res - Response object
 * @returns {Promise<void>} JSON thông báo kết quả cập nhật trạng thái
 */
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    let query = 'UPDATE inapp_notifications SET is_read = TRUE WHERE id = ?';
    const params = [id];

    if (req.user) {
      query += ' AND (user_id = ? OR user_id IS NULL)';
      params.push(req.user.id);
    }

    await db.query(query, params);
    return res.status(200).json({ success: true, message: 'Đã đánh dấu thông báo là đã đọc' });
  } catch (error) {
    console.error('Lỗi cập nhật trạng thái thông báo:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật thông báo', error: error.message });
  }
};

/**
 * PUT /api/notifications/read-all: Đánh dấu tất cả thông báo của người dùng là đã đọc (B04)
 * @description Đảm bảo nguyên tắc bảo mật: Chỉ cập nhật các thông báo thuộc user_id của người dùng hiện tại
 * @param {import('express').Request} req - Request object chứa req.user đã xác thực
 * @param {import('express').Response} res - Response object
 * @returns {Promise<void>} JSON kết quả cập nhật thành công
 */
exports.markAllAsRead = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Yêu cầu đăng nhập!' });
    }

    // B04: Chỉ cập nhật thông báo của người dùng hiện tại, không cập nhật toàn bộ hệ thống
    await db.query(
      'UPDATE inapp_notifications SET is_read = TRUE WHERE user_id = ?',
      [req.user.id]
    );

    return res.status(200).json({ success: true, message: 'Đã đánh dấu tất cả thông báo của bạn là đã đọc' });
  } catch (error) {
    console.error('Lỗi đánh dấu tất cả thông báo đã đọc:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

// DELETE /api/notifications/:id: Xóa thông báo
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    let query = 'DELETE FROM inapp_notifications WHERE id = ?';
    const params = [id];

    if (req.user && req.user.role !== 'Admin') {
      query += ' AND (user_id = ? OR user_id IS NULL)';
      params.push(req.user.id);
    }

    await db.query(query, params);
    return res.status(200).json({ success: true, message: 'Đã xóa thông báo thành công' });
  } catch (error) {
    console.error('Lỗi xóa thông báo:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi xóa thông báo', error: error.message });
  }
};

// POST /api/notifications: Tạo thông báo in-app
exports.createNotification = async (req, res) => {
  try {
    const { user_id, role, title, content, type, link } = req.body;
    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Tiêu đề và nội dung là bắt buộc!' });
    }

    // Kiểm tra link chống XSS (B08)
    const safeLink = (link && typeof link === 'string' && !link.toLowerCase().startsWith('javascript:')) ? link : '';

    const [result] = await db.query(
      'INSERT INTO inapp_notifications (user_id, role, title, content, type, link) VALUES (?, ?, ?, ?, ?, ?)',
      [user_id || null, role || 'Thực tập sinh', title, content, type || 'info', safeLink]
    );
    return res.status(201).json({ success: true, message: 'Đã tạo thông báo thành công', id: result.insertId });
  } catch (error) {
    console.error('Lỗi tạo thông báo:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi tạo thông báo', error: error.message });
  }
};

// POST /api/notifications/meetings: Tạo lịch họp & gửi email cho TTS (STT 35)
exports.createMeeting = async (req, res) => {
  try {
    const { title, meeting_date, start_time, end_time, location, link, host_name, intern_ids, notes } = req.body;

    if (!title || !meeting_date || !start_time || !end_time) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền tiêu đề, ngày họp và khung giờ họp!' });
    }

    // Chặn giờ kết thúc <= giờ bắt đầu (B17 & S3-29)
    if (end_time <= start_time) {
      return res.status(400).json({
        success: false,
        message: 'Giờ kết thúc cuộc họp phải sau giờ bắt đầu!'
      });
    }

    // Kiểm tra link chống XSS (B08)
    if (link && link.toLowerCase().startsWith('javascript:')) {
      return res.status(400).json({ success: false, message: 'Liên kết cuộc họp không an toàn!' });
    }

    const internIdsArray = Array.isArray(intern_ids) ? intern_ids : (intern_ids ? [intern_ids] : []);

    // Tìm danh sách email và tên của các thực tập sinh để tự động gửi email (STT 35)
    let emailResults = [];
    let allSentSuccess = false;

    if (internIdsArray.length > 0) {
      const [interns] = await db.query('SELECT id, name, email, user_id FROM interns WHERE id IN (?)', [internIdsArray]);
      let successCount = 0;
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
          if (mailRes.success) successCount++;

          // Tạo thông báo in-app cho thực tập sinh (STT 36)
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
      allSentSuccess = successCount > 0;
    }

    // Ghi nhận email_sent theo kết quả gửi thực tế (B17)
    const [result] = await db.query(
      `INSERT INTO meetings (title, meeting_date, start_time, end_time, location, link, host_name, intern_ids, notes, email_sent)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, meeting_date, start_time, end_time, location || 'Online Meet', link || '', host_name || 'Mentor / HR', JSON.stringify(internIdsArray), notes || '', allSentSuccess]
    );

    return res.status(201).json({
      success: true,
      message: allSentSuccess 
        ? 'Tạo lịch họp thành công và đã gửi email thông báo tự động cho thực tập sinh!'
        : 'Tạo lịch họp thành công (Chưa gửi được email thông báo do cấu hình SMTP chưa sẵn sàng)',
      meetingId: result.insertId,
      email_sent: allSentSuccess,
      emailsSentCount: emailResults.length,
      emailResults
    });
  } catch (error) {
    console.error('Lỗi tạo lịch họp & gửi email:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi tạo lịch họp', error: error.message });
  }
};

// GET /api/notifications/meetings: Lấy danh sách các lịch họp (B17: TTS chỉ thấy cuộc họp của mình)
exports.getMeetings = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM meetings ORDER BY meeting_date DESC, id DESC');
    
    // Nếu là TTS, chỉ xem các cuộc họp được mời tham dự (B17)
    if (req.user && req.user.role === 'Thực tập sinh') {
      const myInternId = req.user.internId;
      const filtered = rows.filter(m => {
        try {
          const ids = typeof m.intern_ids === 'string' ? JSON.parse(m.intern_ids) : (m.intern_ids || []);
          return Array.isArray(ids) && (ids.includes(myInternId) || ids.includes(String(myInternId)) || ids.includes(Number(myInternId)));
        } catch (e) {
          return false;
        }
      });
      return res.status(200).json({ success: true, data: filtered });
    }

    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error('Lỗi lấy danh sách lịch họp:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi lấy lịch họp', error: error.message });
  }
};
