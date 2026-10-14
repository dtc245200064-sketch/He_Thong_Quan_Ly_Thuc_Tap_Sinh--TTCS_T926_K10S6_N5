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

    // 2. BẢNG TASKS (STT 15, 16 - Giao nhiệm vụ & Cập nhật tiến độ công việc - SCRUM-198)
    await db.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        intern_id INT NOT NULL,
        mentor_id INT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT DEFAULT NULL,
        deadline DATE DEFAULT NULL,
        progress INT DEFAULT 0,
        progress_date DATE DEFAULT NULL,
        status ENUM('todo', 'in_progress', 'review', 'done', 'canceled') DEFAULT 'todo',
        priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
        mentor_feedback TEXT DEFAULT NULL,
        mentor_note TEXT DEFAULT NULL,
        intern_note TEXT DEFAULT NULL,
        feedback_at TIMESTAMP NULL DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (intern_id) REFERENCES interns(id) ON DELETE CASCADE,
        FOREIGN KEY (mentor_id) REFERENCES mentors(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Tự động bổ sung các trường nếu bảng đã tồn tại từ trước (Idempotent Migration)
    const [taskCols] = await db.query(`SHOW COLUMNS FROM tasks`);
    const existingColNames = taskCols.map(c => c.Field);
    if (!existingColNames.includes('progress_date')) {
      await db.query(`ALTER TABLE tasks ADD COLUMN progress_date DATE DEFAULT NULL AFTER progress`);
    }
    if (!existingColNames.includes('mentor_feedback')) {
      await db.query(`ALTER TABLE tasks ADD COLUMN mentor_feedback TEXT DEFAULT NULL AFTER priority`);
    }
    if (!existingColNames.includes('feedback_at')) {
      await db.query(`ALTER TABLE tasks ADD COLUMN feedback_at TIMESTAMP NULL DEFAULT NULL AFTER intern_note`);
    }
    console.log('✅ 2. Bảng tasks đã sẵn sàng (đã chuẩn hóa các trường tiến độ, ngày cập nhật, nội dung phản hồi)');

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
    console.log('🎉 --- HOÀN THÀNH TẤT CẢ MIGRATION CHO SPRINT 3! (Không nạp dữ liệu mẫu) --- 🎉');
  } catch (error) {
    console.error('❌ Lỗi chạy migration Sprint 3:', error);
  }
}

if (require.main === module) {
  migrateSprint3().then(() => process.exit(0));
}

module.exports = migrateSprint3;
