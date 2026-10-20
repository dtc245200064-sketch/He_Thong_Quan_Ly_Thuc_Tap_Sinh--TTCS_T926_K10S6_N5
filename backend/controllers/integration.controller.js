const db = require('../config/db');

// Hàm lấy ngày giờ Việt Nam (UTC+7)
function getVietnamDateTime() {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' });
  const timeStr = now.toLocaleTimeString('en-GB', { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit' });
  return { dateStr, timeStr };
}

// GET /api/integrations: Lấy danh sách cấu hình tích hợp (B06: Che giá trị api_key và secret_token)
exports.getIntegrations = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM system_integrations ORDER BY id ASC');
    
    // B06: Che giá trị khóa nhạy cảm dạng ****1234
    const maskedRows = rows.map(r => {
      const copy = { ...r };
      if (copy.api_key) {
        copy.api_key = copy.api_key.length > 4 ? `****${copy.api_key.slice(-4)}` : '****';
      }
      if (copy.secret_token) {
        copy.secret_token = copy.secret_token.length > 4 ? `****${copy.secret_token.slice(-4)}` : '****';
      }
      return copy;
    });

    return res.status(200).json({ success: true, data: maskedRows });
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

    // Không ghi đè nếu gửi dạng masked '****'
    const cleanApiKey = (api_key && !api_key.includes('****')) ? api_key : null;
    const cleanSecret = (secret_token && !secret_token.includes('****')) ? secret_token : null;

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
      [name || null, endpoint_url || null, cleanApiKey, cleanSecret, status || null, sync_frequency || null, config_data ? JSON.stringify(config_data) : null, type]
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

// POST /api/integrations/hrm/sync: Kích hoạt đồng bộ dữ liệu nhân sự với HRM (STT 37 - Gắn nhãn MÔ PHỎNG)
exports.syncHRM = async (req, res) => {
  try {
    await db.query("UPDATE system_integrations SET status = 'syncing' WHERE integration_type = 'hrm'");

    // Giả lập đồng bộ và gắn nhãn [MÔ PHỎNG] rõ ràng (B16)
    setTimeout(async () => {
      try {
        await db.query("UPDATE system_integrations SET status = 'connected', last_sync_at = NOW() WHERE integration_type = 'hrm'");
      } catch (e) {}
    }, 1000);

    return res.status(200).json({
      success: true,
      is_simulated: true,
      message: '[MÔ PHỎNG] Đã kích hoạt đồng bộ dữ liệu HRM thành công (Chế độ mô phỏng thử nghiệm).'
    });
  } catch (error) {
    console.error('Lỗi kích hoạt đồng bộ HRM:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi đồng bộ HRM', error: error.message });
  }
};

// POST /api/integrations/qr-card/simulate: Giả lập quẹt thẻ / quét mã QR điểm danh (B16)
exports.simulateQRCheckIn = async (req, res) => {
  try {
    const { intern_id, qr_code, card_id } = req.body;

    if (!intern_id && !qr_code && !card_id) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp mã thực tập sinh, mã QR hoặc ID thẻ từ!' });
    }

    let targetInternId = null;
    if (intern_id) {
      const [iRows] = await db.query('SELECT id FROM interns WHERE id = ?', [intern_id]);
      if (iRows.length > 0) targetInternId = iRows[0].id;
    }

    // B16: Không tự ý lấy bừa TTS đầu tiên trong bảng nếu không tìm thấy!
    if (!targetInternId) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thực tập sinh tương ứng với thiết bị quét!' });
    }

    // B16: Dùng múi giờ Việt Nam, tránh lệch ngày do toISOString (UTC)
    const { dateStr: today, timeStr: nowTime } = getVietnamDateTime();

    const [attRows] = await db.query('SELECT * FROM attendance WHERE intern_id = ? AND date = ?', [targetInternId, today]);

    if (attRows.length === 0) {
      // Check-in
      await db.query(
        `INSERT INTO attendance (intern_id, date, check_in, check_out, total_hours, status, notes)
         VALUES (?, ?, ?, NULL, '—', 'present', ?)`,
        [targetInternId, today, nowTime, `Quét mã QR/Thẻ (${card_id || qr_code || 'DEVICE-01'})`]
      );
    } else {
      // Check-out: Tính toán tổng giờ thực tế
      const rec = attRows[0];
      let totalStr = '—';
      if (rec.check_in) {
        const [inH, inM] = rec.check_in.split(':').map(Number);
        const [outH, outM] = nowTime.split(':').map(Number);
        let diffMinutes = (outH * 60 + outM) - (inH * 60 + inM);
        if (diffMinutes < 0) diffMinutes = 0;
        const hours = Math.floor(diffMinutes / 60);
        const mins = diffMinutes % 60;
        totalStr = `${hours} giờ ${String(mins).padStart(2, '0')} phút`;
      }

      await db.query(
        `UPDATE attendance 
         SET check_out = ?, 
             total_hours = ?, 
             notes = CONCAT(COALESCE(notes, ''), ' | Check-out QR: ', ?) 
         WHERE id = ?`,
        [nowTime, totalStr, nowTime, rec.id]
      );
    }

    await db.query("UPDATE system_integrations SET last_sync_at = NOW(), status = 'connected' WHERE integration_type = 'qr_card_attendance'");

    return res.status(200).json({
      success: true,
      message: `Quét mã QR/Thẻ thành công! Đã ghi nhận điểm danh lúc ${nowTime}.`,
      date: today,
      time: nowTime,
      internId: targetInternId
    });
  } catch (error) {
    console.error('Lỗi tích hợp chấm công QR/thẻ:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi ghi nhận chấm công QR/thẻ', error: error.message });
  }
};
