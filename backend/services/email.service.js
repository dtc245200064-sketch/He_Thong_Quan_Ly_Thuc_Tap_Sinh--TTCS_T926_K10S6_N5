const nodemailer = require('nodemailer');
const db = require('../config/db');

// Tự động khởi tạo bảng system_emails trong MySQL nếu chưa tồn tại
async function ensureEmailTable() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS system_emails (
        id INT AUTO_INCREMENT PRIMARY KEY,
        recipient_email VARCHAR(150) NOT NULL,
        recipient_name VARCHAR(100) DEFAULT NULL,
        subject VARCHAR(255) NOT NULL,
        email_type ENUM('approved', 'rejected', 'contract', 'general') DEFAULT 'general',
        content TEXT NOT NULL,
        preview_url VARCHAR(255) DEFAULT NULL,
        status ENUM('sent', 'failed') DEFAULT 'sent',
        sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  } catch (err) {
    console.warn('⚠️ Lỗi kiểm tra bảng system_emails:', err.message);
  }
}
ensureEmailTable();

let testTransporter = null;

// Lấy hoặc tạo transporter gửi email
async function getTransporter() {
  // Nếu có cấu hình SMTP thật từ biến môi trường (ví dụ Gmail SMTP)
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      service: process.env.SMTP_SERVICE || 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  // Mặc định: Dùng Ethereal Test Account của Nodemailer
  if (!testTransporter) {
    try {
      const testAccount = await nodemailer.createTestAccount();
      testTransporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      console.log('📬 Đã khởi tạo Ethereal Email Transporter cho hệ thống');
    } catch (err) {
      console.warn('⚠️ Không thể tạo tài khoản Ethereal, dùng fallback:', err.message);
      testTransporter = nodemailer.createTransport({
        jsonTransport: true
      });
    }
  }

  return testTransporter;
}

/**
 * Gửi email thông báo kết quả xét duyệt hồ sơ thực tập sinh (User Story 8)
 */
async function sendReviewResultEmail({ to, candidateName, status, reason, note }) {
  const isApproved = status === 'approved' || status === 'Đã duyệt';
  const subject = isApproved
    ? `[CodeGym] Chúc mừng! Hồ sơ thực tập của bạn đã được phê duyệt`
    : `[CodeGym] Thông báo kết quả xét duyệt hồ sơ thực tập`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
        .email-container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .email-header { background: ${isApproved ? 'linear-gradient(135deg, #1e3a8a, #2563eb)' : 'linear-gradient(135deg, #334155, #64748b)'}; padding: 30px 24px; text-align: center; color: white; }
        .email-header h1 { margin: 0; font-size: 22px; font-weight: 700; }
        .email-header p { margin: 8px 0 0; font-size: 14px; opacity: 0.9; }
        .email-body { padding: 32px 28px; line-height: 1.6; }
        .status-badge { display: inline-block; padding: 6px 16px; border-radius: 20px; font-weight: 600; font-size: 14px; margin-bottom: 20px; background: ${isApproved ? '#dcfce7' : '#fee2e2'}; color: ${isApproved ? '#166534' : '#991b1b'}; }
        .info-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0; }
        .info-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
        .info-label { color: #64748b; font-weight: 500; }
        .info-value { color: #0f172a; font-weight: 600; }
        .btn-action { display: inline-block; padding: 12px 28px; background: #2563eb; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; margin-top: 15px; text-align: center; }
        .email-footer { background: #f1f5f9; padding: 20px 24px; text-align: center; font-size: 12.5px; color: #64748b; border-top: 1px solid #e2e8f0; }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="email-header">
          <h1>HỆ THỐNG THỰC TẬP CODEGYM</h1>
          <p>Phòng Đào tạo & Quản lý Nhân sự Doanh nghiệp</p>
        </div>
        <div class="email-body">
          <p>Kính gửi bạn <b>${candidateName || 'Ứng viên'}</b>,</p>
          
          <div class="status-badge">
            ${isApproved ? '✓ HỒ SƠ ĐÃ ĐƯỢC DUYỆT' : '✕ HỒ SƠ CHƯA ĐẠT YÊU CẦU'}
          </div>

          <p>
            ${isApproved
              ? `Chúc mừng bạn! Sau quá trình đánh giá và xem xét hồ sơ, Phòng Nhân sự CodeGym trân trọng thông báo hồ sơ xin thực tập của bạn đã <b>được phê duyệt thành công</b>.`
              : `Cảm ơn bạn đã quan tâm và nộp hồ sơ tham gia chương trình thực tập tại CodeGym. Rất tiếc trong đợt tuyển dụng này, hồ sơ của bạn chưa phù hợp với yêu cầu hiện tại của phòng ban.`}
          </p>

          <div class="info-card">
            <div class="info-row"><span class="info-label">Ứng viên:</span> <span class="info-value">${candidateName || '—'}</span></div>
            <div class="info-row"><span class="info-label">Email:</span> <span class="info-value">${to || '—'}</span></div>
            <div class="info-row"><span class="info-label">Kết quả xét duyệt:</span> <span class="info-value" style="color: ${isApproved ? '#16a34a' : '#dc2626'}">${isApproved ? 'Đã duyệt (Trúng tuyển)' : 'Từ chối'}</span></div>
            ${!isApproved && reason ? `<div class="info-row"><span class="info-label">Lý do:</span> <span class="info-value">${reason}</span></div>` : ''}
            ${note ? `<div class="info-row"><span class="info-label">Ghi chú từ HR:</span> <span class="info-value">${note}</span></div>` : ''}
          </div>

          ${isApproved ? `
            <p><b>Bước tiếp theo:</b></p>
            <p>Vui lòng đăng nhập vào <b>Cổng Thực tập sinh</b> để kiểm tra thông tin, xem và xác nhận <b>Hợp đồng thực tập</b> theo quy định.</p>
            <center>
              <a href="http://localhost:5000/intern.html" class="btn-action">Truy cập Cổng Thực tập sinh</a>
            </center>
          ` : `
            <p>Chúng tôi đã lưu hồ sơ của bạn vào cơ sở dữ liệu nhân tài và sẽ chủ động liên hệ lại khi có vị trí thực tập phù hợp hơn trong tương lai.</p>
          `}

          <p style="margin-top: 30px;">Trân trọng,<br><b>Phòng Nhân sự & Đào tạo CodeGym Việt Nam</b></p>
        </div>
        <div class="email-footer">
          Email này được gửi tự động từ Hệ thống Quản lý Thực tập sinh CodeGym.<br>
          Địa chỉ: Tầng 2, Tòa nhà CodeGym, Hà Nội • Hotline: 1900 888 888
        </div>
      </div>
    </body>
    </html>
  `;

  let previewUrl = null;
  let sentStatus = 'sent';

  try {
    const transporter = await getTransporter();
    const info = await transporter.sendMail({
      from: '"CodeGym HR Portal" <hr-noreply@codegym.vn>',
      to: to,
      subject: subject,
      html: htmlContent
    });

    if (nodemailer.getTestMessageUrl) {
      previewUrl = nodemailer.getTestMessageUrl(info) || null;
    }
    console.log(`📧 [EMAIL SENT] Đến: ${to} | Subject: ${subject}`);
    if (previewUrl) {
      console.log(`🔗 [EMAIL PREVIEW URL]: ${previewUrl}`);
    }
  } catch (err) {
    console.error('⚠️ Lỗi gửi email qua transporter:', err.message);
    sentStatus = 'failed';
  }

  // Lưu lịch sử gửi email vào bảng system_emails trong MySQL
  try {
    await db.query(`
      INSERT INTO system_emails (recipient_email, recipient_name, subject, email_type, content, preview_url, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      to,
      candidateName || null,
      subject,
      isApproved ? 'approved' : 'rejected',
      htmlContent,
      previewUrl,
      sentStatus
    ]);
  } catch (dbErr) {
    console.warn('⚠️ Lỗi ghi system_emails vào DB:', dbErr.message);
  }

  return {
    success: sentStatus === 'sent',
    recipient: to,
    candidate: candidateName,
    subject: subject,
    previewUrl: previewUrl,
    type: isApproved ? 'approved' : 'rejected'
  };
}

// Lấy danh sách email đã gửi cho TTS hoặc HR
async function getEmailHistory(recipientEmail = '') {
  try {
    let sql = 'SELECT * FROM system_emails WHERE 1=1';
    const params = [];
    if (recipientEmail) {
      sql += ' AND recipient_email = ?';
      params.push(recipientEmail);
    }
    sql += ' ORDER BY id DESC LIMIT 50';
    const [rows] = await db.query(sql, params);
    return rows;
  } catch (err) {
    console.error('Lỗi lấy lịch sử email:', err);
    return [];
  }
}

module.exports = {
  sendReviewResultEmail,
  getEmailHistory
};
