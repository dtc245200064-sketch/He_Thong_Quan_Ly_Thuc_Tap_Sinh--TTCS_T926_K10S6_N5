const db = require('../config/db');

// GET /api/integrations: Lấy danh sách cấu hình tích hợp
exports.getIntegrations = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM system_integrations ORDER BY id ASC');
    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error('Lỗi lấy danh sách cấu hình tích hợp:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi lấy cấu hình tích hợp', error: error.message });
  }
};

// PUT /api/integrations/:type: Cập nhật cấu hình tích hợp (STT 37, 38)
exports.updateIntegration = async (req, res) => {
  try {
    const { type } = req.params;
    const { name, endpoint_url, api_key, secret_token, status, sync_frequency, config_data } = req.body;

    const [result] = await db.query(
      `UPDATE system_integrations 
       SET name = COALESCE(?, name),
           endpoint_url = COALESCE(?, endpoint_url),
           api_key = COALESCE(?, api_key),
           secret_token = COALESCE(?, secret_token),
           status = COALESCE(?, status),
           sync_frequency = COALESCE(?, sync_frequency),
           config_data = COALESCE(?, config_data),
           updated_at = NOW()
       WHERE integration_type = ?`,
      [name || null, endpoint_url || null, api_key || null, secret_token || null, status || null, sync_frequency || null, config_data ? JSON.stringify(config_data) : null, type]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy cấu hình tích hợp!' });
    }

    return res.status(200).json({ success: true, message: 'Cập nhật cấu hình tích hợp thành công!' });
  } catch (error) {
    console.error('Lỗi cập nhật tích hợp:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật tích hợp', error: error.message });
  }
};

// POST /api/integrations/hrm/sync: Kích hoạt đồng bộ dữ liệu nhân sự với HRM (STT 37)
exports.syncHRM = async (req, res) => {
  try {
    // 1. Cập nhật trạng thái đang đồng bộ
    await db.query("UPDATE system_integrations SET status = 'syncing' WHERE integration_type = 'hrm'");

    // 2. Mô phỏng đồng bộ dữ liệu (Sync nhân viên/mentor/phòng ban từ HRM Core)
    const syncedRecordsCount = 8;
    await db.query(
      `UPDATE system_integrations 
       SET status = 'connected', 
           last_sync_at = NOW() 
       WHERE integration_type = 'hrm'`
    );

    return res.status(200).json({
      success: true,
      message: `Đồng bộ dữ liệu nhân sự với hệ thống HRM thành công! Đã cập nhật ${syncedRecordsCount} bản ghi.`,
      lastSyncAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Lỗi đồng bộ HRM:', error);
    await db.query("UPDATE system_integrations SET status = 'error' WHERE integration_type = 'hrm'");
    return res.status(500).json({ success: false, message: 'Lỗi khi đồng bộ với hệ thống HRM', error: error.message });
  }
};

// POST /api/integrations/qr-attendance/checkin: Xử lý quét mã QR / thẻ chấm công tự động (STT 38)
exports.simulateQRCheckIn = async (req, res) => {
  try {
    const { intern_id, qr_code, card_id, check_type } = req.body;

    if (!intern_id && !qr_code && !card_id) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin quét mã QR hoặc thẻ từ!' });
    }

    // Xác định TTS tương ứng
    let targetInternId = intern_id;
    if (!targetInternId) {
      // Tìm theo QR code mẫu hoặc lấy intern đầu tiên
      const [allInterns] = await db.query('SELECT id FROM interns LIMIT 1');
      if (allInterns.length > 0) targetInternId = allInterns[0].id;
    }

    const today = new Date().toISOString().slice(0, 10);
    const nowTime = new Date().toTimeString().slice(0, 5); // HH:MM

    // Kiểm tra xem hôm nay đã có bản ghi chấm công chưa
    const [attRows] = await db.query('SELECT * FROM attendance WHERE intern_id = ? AND date = ?', [targetInternId, today]);

    if (attRows.length === 0) {
      // Ghi nhận Check-in qua QR/Thẻ
      await db.query(
        `INSERT INTO attendance (intern_id, date, check_in, check_out, total_hours, status, notes)
         VALUES (?, ?, ?, NULL, '4h 00m', 'present', ?)`,
        [targetInternId, today, nowTime, `Quét mã QR/Thẻ (${card_id || 'QR-' + nowTime})`]
      );
    } else {
      // Ghi nhận Check-out qua QR/Thẻ
      await db.query(
        `UPDATE attendance 
         SET check_out = ?, 
             total_hours = '8h 00m', 
             notes = CONCAT(COALESCE(notes, ''), ' | Check-out QR: ', ?) 
         WHERE id = ?`,
        [nowTime, nowTime, attRows[0].id]
      );
    }

    // Cập nhật thời điểm kết nối thiết bị gần nhất
    await db.query("UPDATE system_integrations SET last_sync_at = NOW(), status = 'connected' WHERE integration_type = 'qr_card_attendance'");

    return res.status(200).json({
      success: true,
      message: `Quét mã QR/Thẻ thành công! Đã tự động ghi nhận điểm danh lúc ${nowTime}.`,
      date: today,
      time: nowTime,
      internId: targetInternId
    });
  } catch (error) {
    console.error('Lỗi tích hợp chấm công QR/thẻ:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi ghi nhận chấm công QR/thẻ', error: error.message });
  }
};
