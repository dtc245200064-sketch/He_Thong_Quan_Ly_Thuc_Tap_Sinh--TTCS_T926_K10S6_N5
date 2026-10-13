const db = require('./config/db');

async function migrateSprint3() {
  try {
    console.log('🚀 --- BẮT ĐẦU NÂNG CẤP CƠ SỞ DỮ LIỆU MYSQL CHO SPRINT 3 --- 🚀');

    // 1. BẢNG MENTORS (STT 29, 30, 31 - Quản lý mentor & phòng ban)
    await db.query(`
      CREATE TABLE IF NOT EXISTS mentors (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NULL,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        phone VARCHAR(20) DEFAULT NULL,
        dept VARCHAR(100) NOT NULL,
        position VARCHAR(100) DEFAULT 'Senior Mentor',
        max_interns INT DEFAULT 5,
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ 1. Bảng mentors đã sẵn sàng');

    // 2. BẢNG TASKS (STT 15, 16 - Giao nhiệm vụ & Cập nhật tiến độ công việc)
    await db.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        intern_id INT NOT NULL,
        mentor_id INT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT DEFAULT NULL,
        deadline DATE DEFAULT NULL,
        progress INT DEFAULT 0,
        status ENUM('todo', 'in_progress', 'review', 'done', 'canceled') DEFAULT 'todo',
        priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
        mentor_note TEXT DEFAULT NULL,
        intern_note TEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (intern_id) REFERENCES interns(id) ON DELETE CASCADE,
        FOREIGN KEY (mentor_id) REFERENCES mentors(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ 2. Bảng tasks đã sẵn sàng');

    // 3. BẢNG WEEKLY_REPORTS (STT 17, 18 - Báo cáo tuần & Mentor phản hồi)
    await db.query(`
      CREATE TABLE IF NOT EXISTS weekly_reports (
        id INT AUTO_INCREMENT PRIMARY KEY,
        intern_id INT NOT NULL,
        mentor_id INT NULL,
        week_number INT NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        tasks_completed TEXT NOT NULL,
        issues_faced TEXT DEFAULT NULL,
        plans_next_week TEXT NOT NULL,
        status ENUM('draft', 'submitted', 'reviewed') DEFAULT 'submitted',
        mentor_feedback TEXT DEFAULT NULL,
        mentor_rating INT DEFAULT NULL,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        reviewed_at TIMESTAMP NULL DEFAULT NULL,
        FOREIGN KEY (intern_id) REFERENCES interns(id) ON DELETE CASCADE,
        FOREIGN KEY (mentor_id) REFERENCES mentors(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ 3. Bảng weekly_reports đã sẵn sàng');

    // 4. BẢNG EVALUATIONS (STT 19, 20 - Đánh giá kỹ năng, thái độ & Báo cáo cuối kỳ)
    await db.query(`
      CREATE TABLE IF NOT EXISTS evaluations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        intern_id INT NOT NULL UNIQUE,
        mentor_id INT NULL,
        technical_score DECIMAL(3,1) NOT NULL DEFAULT 8.0,
        discipline_score DECIMAL(3,1) NOT NULL DEFAULT 8.5,
        attitude_score DECIMAL(3,1) NOT NULL DEFAULT 9.0,
        total_score DECIMAL(3,1) NOT NULL DEFAULT 8.5,
        grade ENUM('Xuất sắc', 'Giỏi', 'Khá', 'Trung bình', 'Yếu') NOT NULL DEFAULT 'Giỏi',
        mentor_comments TEXT DEFAULT NULL,
        hr_notes TEXT DEFAULT NULL,
        status ENUM('draft', 'finalized', 'approved') DEFAULT 'finalized',
        evaluated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (intern_id) REFERENCES interns(id) ON DELETE CASCADE,
        FOREIGN KEY (mentor_id) REFERENCES mentors(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ 4. Bảng evaluations đã sẵn sàng');

    // 5. BẢNG MEETINGS (STT 35 - Tự động gửi email lịch họp cho TTS)
    await db.query(`
      CREATE TABLE IF NOT EXISTS meetings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        meeting_date DATE NOT NULL,
        start_time VARCHAR(10) NOT NULL,
        end_time VARCHAR(10) NOT NULL,
        location VARCHAR(255) DEFAULT 'Phòng họp Tầng 3 / Google Meet',
        link VARCHAR(255) DEFAULT NULL,
        host_name VARCHAR(100) NOT NULL,
        intern_ids JSON DEFAULT NULL,
        notes TEXT DEFAULT NULL,
        email_sent BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ 5. Bảng meetings đã sẵn sàng');

    // 6. BẢNG INAPP_NOTIFICATIONS (STT 36 - Nhận thông báo trên ứng dụng cho TTS)
    await db.query(`
      CREATE TABLE IF NOT EXISTS inapp_notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NULL,
        role VARCHAR(50) DEFAULT NULL,
        title VARCHAR(200) NOT NULL,
        content TEXT NOT NULL,
        type ENUM('info', 'warning', 'success', 'urgent') DEFAULT 'info',
        is_read BOOLEAN DEFAULT FALSE,
        link VARCHAR(255) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ 6. Bảng inapp_notifications đã sẵn sàng');

    // 7. BẢNG SYSTEM_INTEGRATIONS (STT 37, 38 - Tích hợp HRM & Chấm công QR/thẻ)
    await db.query(`
      CREATE TABLE IF NOT EXISTS system_integrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        integration_type ENUM('hrm', 'qr_card_attendance') NOT NULL UNIQUE,
        name VARCHAR(150) NOT NULL,
        endpoint_url VARCHAR(255) DEFAULT NULL,
        api_key VARCHAR(255) DEFAULT NULL,
        secret_token VARCHAR(255) DEFAULT NULL,
        status ENUM('connected', 'disconnected', 'syncing', 'error') DEFAULT 'connected',
        last_sync_at TIMESTAMP NULL DEFAULT NULL,
        sync_frequency VARCHAR(50) DEFAULT 'Daily',
        config_data JSON DEFAULT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ 7. Bảng system_integrations đã sẵn sàng');

    // --- SEED DỮ LIỆU MẪU BAN ĐẦU CHO SPRINT 3 ---
    // Nạp mentors mẫu
    await db.query(`
      INSERT INTO mentors (id, user_id, name, email, phone, dept, position, max_interns, status) VALUES
      (1, 4, 'Nguyễn Anh Tuấn', 'mentor@company.vn', '0945 667 889', 'Phòng Phát triển Phần mềm', 'Tech Lead', 5, 'active'),
      (2, NULL, 'Trần Minh Hoàng', 'hoang.tm@company.vn', '0912 345 670', 'Phòng Phát triển Phần mềm', 'Senior Fullstack Dev', 4, 'active'),
      (3, NULL, 'Lê Thị Thu Lan', 'lan.lt@company.vn', '0933 222 110', 'Phòng Tuyển dụng & Đào tạo', 'HR Lead / Mentor', 6, 'active'),
      (4, NULL, 'Phạm Quốc Cường', 'cuong.pq@company.vn', '0988 777 660', 'Phòng Marketing & Truyền thông', 'Marketing Manager', 4, 'active')
      ON DUPLICATE KEY UPDATE name=VALUES(name), email=VALUES(email), dept=VALUES(dept)
    `);
    console.log('✅ Seed dữ liệu mentors thành công');

    // Nạp tasks mẫu
    await db.query(`
      INSERT INTO tasks (id, intern_id, mentor_id, title, description, deadline, progress, status, priority) VALUES
      (1, 1, 1, 'Xây dựng giao diện Dashboard bằng HTML/CSS', 'Cắt giao diện chuẩn responsive theo thiết kế Figma cho phân hệ HR.', DATE_ADD(CURRENT_DATE, INTERVAL 3 DAY), 100, 'done', 'high'),
      (2, 1, 1, 'Tích hợp API đăng nhập JWT và phân quyền', 'Viết hàm gọi API /api/auth/login và lưu token vào LocalStorage.', DATE_ADD(CURRENT_DATE, INTERVAL 7 DAY), 75, 'in_progress', 'high'),
      (3, 1, 1, 'Viết Unit Test cho module quản lý thực tập sinh', 'Kiểm thử các hàm tìm kiếm, lọc và phân trang hồ sơ.', DATE_ADD(CURRENT_DATE, INTERVAL 12 DAY), 20, 'todo', 'medium')
      ON DUPLICATE KEY UPDATE title=VALUES(title), progress=VALUES(progress)
    `);
    console.log('✅ Seed dữ liệu tasks thành công');

    // Nạp weekly_reports mẫu
    await db.query(`
      INSERT INTO weekly_reports (id, intern_id, mentor_id, week_number, start_date, end_date, tasks_completed, issues_faced, plans_next_week, status, mentor_feedback, mentor_rating) VALUES
      (1, 1, 1, 1, DATE_SUB(CURRENT_DATE, INTERVAL 14 DAY), DATE_SUB(CURRENT_DATE, INTERVAL 7 DAY), 'Tìm hiểu cấu trúc thư mục, clone repo và hoàn thành giao diện đăng nhập.', 'Chưa quen với chuẩn CSS Flexbox & Grid.', 'Bắt tay vào ghép API login và bảng danh sách thực tập sinh.', 'reviewed', 'Tiến độ rất tốt, chủ động hỏi han khi gặp lỗi.', 9),
      (2, 1, 1, 2, DATE_SUB(CURRENT_DATE, INTERVAL 7 DAY), CURRENT_DATE, 'Hoàn thiện chức năng chấm công, upload CV và sửa lỗi giao diện.', 'Gặp khó khăn khi cấu hình Multer upload file.', 'Làm tiếp module báo cáo tuần và tích hợp API nhiệm vụ.', 'submitted', NULL, NULL)
      ON DUPLICATE KEY UPDATE week_number=VALUES(week_number)
    `);
    console.log('✅ Seed dữ liệu weekly_reports thành công');

    // Nạp evaluations mẫu
    await db.query(`
      INSERT INTO evaluations (id, intern_id, mentor_id, technical_score, discipline_score, attitude_score, total_score, grade, mentor_comments, hr_notes, status) VALUES
      (1, 1, 1, 8.5, 9.0, 9.5, 9.0, 'Xuất sắc', 'Nắm bắt công nghệ nhanh, hoàn thành tốt các task được giao đúng hạn.', 'Đề xuất xem xét ký hợp đồng chính thức sau khi tốt nghiệp.', 'finalized')
      ON DUPLICATE KEY UPDATE total_score=VALUES(total_score)
    `);
    console.log('✅ Seed dữ liệu evaluations thành công');

    // Nạp meetings mẫu (STT 35)
    await db.query(`
      INSERT INTO meetings (id, title, meeting_date, start_time, end_time, location, link, host_name, intern_ids, notes, email_sent) VALUES
      (1, 'Họp Review tiến độ công việc tuần với Mentor', CURRENT_DATE, '09:00', '10:30', 'Phòng họp P204 / Online Meet', 'https://meet.google.com/codegym-mentor-sync', 'Nguyễn Anh Tuấn', '[1]', 'Báo cáo kết quả công việc tuần và trao đổi các khó khăn kỹ thuật.', TRUE),
      (2, 'Phỏng vấn & Đánh giá định kỳ thực tập sinh', DATE_ADD(CURRENT_DATE, INTERVAL 3 DAY), '14:00', '15:00', 'Google Meet Online', 'https://meet.google.com/codegym-mid-eval', 'Nguyễn Anh Tuấn & HR', '[1]', 'Đánh giá kỹ năng và định hướng mục tiêu giai đoạn tiếp theo.', TRUE)
      ON DUPLICATE KEY UPDATE title=VALUES(title), meeting_date=VALUES(meeting_date)
    `);
    console.log('✅ Seed dữ liệu meetings thành công');

    // Nạp system_integrations mẫu (HRM & QR Chấm công)
    await db.query(`
      INSERT INTO system_integrations (id, integration_type, name, endpoint_url, api_key, status, last_sync_at, sync_frequency, config_data) VALUES
      (1, 'hrm', 'Hệ thống Quản lý Nhân sự HRM Core', 'https://hrm.codegym.vn/api/v1/sync', 'hrm_live_key_99882233', 'connected', NOW(), 'Hàng ngày 00:00', '{"autoSync": true, "syncFields": ["employees", "interns", "contracts"]}'),
      (2, 'qr_card_attendance', 'Máy chấm công Quét mã QR & Thẻ từ Hikvision', 'https://access.codegym.vn/device/gate-01', 'att_device_sec_771144', 'connected', NOW(), 'Thời gian thực (Webhook)', '{"autoCheckIn": true, "toleranceMinutes": 15, "cameraActive": true}')
      ON DUPLICATE KEY UPDATE name=VALUES(name)
    `);
    console.log('✅ Seed dữ liệu system_integrations thành công');

    // Nạp inapp_notifications mẫu
    await db.query(`
      INSERT INTO inapp_notifications (id, user_id, role, title, content, type, is_read, link) VALUES
      (1, NULL, 'Thực tập sinh', 'Chào mừng bạn đến với kỳ thực tập Sprint 3!', 'Hệ thống đã cập nhật tính năng quản lý công việc và báo cáo tuần.', 'success', false, 'intern.html#reports'),
      (2, NULL, 'Thực tập sinh', 'Lịch họp định kỳ tuần vào 09:00 Thứ Hai', 'Vui lòng chuẩn bị nội dung báo cáo tuần trước khi tham gia.', 'info', false, 'intern.html#schedule')
      ON DUPLICATE KEY UPDATE title=VALUES(title)
    `);
    console.log('✅ Seed dữ liệu inapp_notifications thành công');

    console.log('🎉 --- HOÀN THÀNH TẤT CẢ MIGRATION CHO SPRINT 3! --- 🎉');
  } catch (error) {
    console.error('❌ Lỗi chạy migration Sprint 3:', error);
  }
}

if (require.main === module) {
  migrateSprint3().then(() => process.exit(0));
}

module.exports = migrateSprint3;
