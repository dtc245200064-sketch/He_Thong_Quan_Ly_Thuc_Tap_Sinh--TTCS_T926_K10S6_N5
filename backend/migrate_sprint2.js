const db = require('./config/db');

async function migrate() {
  try {
    console.log('--- Đang tạo các bảng mới cho Sprint 2 trong MySQL Database ---');

    // 1. programs
    await db.query(`
      CREATE TABLE IF NOT EXISTS programs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        dept VARCHAR(100) NOT NULL,
        mentor_default VARCHAR(100) DEFAULT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        max_interns INT DEFAULT 10,
        status ENUM('active', 'upcoming', 'completed') DEFAULT 'active',
        description TEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Bảng programs đã được tạo thành công');

    // 2. contracts
    await db.query(`
      CREATE TABLE IF NOT EXISTS contracts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        intern_id INT NOT NULL,
        code VARCHAR(50) NOT NULL UNIQUE,
        title VARCHAR(200) NOT NULL,
        company VARCHAR(150) NOT NULL DEFAULT 'Hệ thống Đào tạo CodeGym Việt Nam',
        dept VARCHAR(100) NOT NULL DEFAULT 'Phòng Phát triển Phần mềm',
        period VARCHAR(100) DEFAULT NULL,
        file_name VARCHAR(255) DEFAULT NULL,
        file_url VARCHAR(255) DEFAULT NULL,
        status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
        confirmed_at TIMESTAMP NULL DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (intern_id) REFERENCES interns(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Bảng contracts đã được tạo thành công');

    // 3. attendance
    await db.query(`
      CREATE TABLE IF NOT EXISTS attendance (
        id INT AUTO_INCREMENT PRIMARY KEY,
        intern_id INT NOT NULL,
        date DATE NOT NULL,
        check_in VARCHAR(10) DEFAULT NULL,
        check_out VARCHAR(10) DEFAULT NULL,
        total_hours VARCHAR(50) DEFAULT NULL,
        status ENUM('present', 'late', 'leave', 'remote', 'absent') NOT NULL DEFAULT 'present',
        notes VARCHAR(255) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (intern_id) REFERENCES interns(id) ON DELETE CASCADE,
        UNIQUE KEY unique_intern_date (intern_id, date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Bảng attendance đã được tạo thành công');

    // 4. leave_requests
    await db.query(`
      CREATE TABLE IF NOT EXISTS leave_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        intern_id INT NOT NULL,
        leave_type VARCHAR(100) NOT NULL DEFAULT 'Việc cá nhân',
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        days_count INT NOT NULL DEFAULT 1,
        reason TEXT NOT NULL,
        status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
        review_note TEXT DEFAULT NULL,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        reviewed_at TIMESTAMP NULL DEFAULT NULL,
        FOREIGN KEY (intern_id) REFERENCES interns(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Bảng leave_requests đã được tạo thành công');

    // Nạp dữ liệu mẫu ban đầu nếu bảng rỗng
    const [[{ pCount }]] = await db.query('SELECT COUNT(*) as pCount FROM programs');
    if (pCount === 0) {
      await db.query(`
        INSERT INTO programs (name, dept, mentor_default, start_date, end_date, max_interns, status, description) VALUES
        ('Chương trình thực tập Web Frontend React', 'Kỹ thuật phần mềm', 'Nguyễn Anh Tuấn', '2026-07-01', '2026-09-30', 15, 'active', 'Đào tạo và thực chiến ReactJS, Redux Toolkit, Tailwind CSS trên dự án thật.'),
        ('Chương trình thực tập Backend NodeJS & Cloud', 'Kỹ thuật phần mềm', 'Nguyễn Anh Tuấn', '2026-08-01', '2026-10-31', 12, 'active', 'Xây dựng RESTful API, Microservices với Node.js, Express, MySQL và Docker.'),
        ('Chương trình thực tập Tuyển dụng Nhân sự', 'Nhân sự', 'Nguyễn Thị Hoa', '2026-07-15', '2026-10-15', 8, 'active', 'Trải nghiệm quy trình sàng lọc hồ sơ ứng viên, phỏng vấn và quản lý dữ liệu nhân sự.'),
        ('Chương trình thực tập Digital Marketing', 'Marketing', 'Chị Mai', '2026-09-01', '2026-11-30', 10, 'upcoming', 'Triển khai chiến dịch SEO, Social Media và Content Marketing cho CodeGym.')
      `);
      console.log('✅ Đã nạp 4 chương trình mẫu vào bảng programs');
    }

    const [[{ cCount }]] = await db.query('SELECT COUNT(*) as cCount FROM contracts');
    if (cCount === 0) {
      await db.query(`
        INSERT INTO contracts (intern_id, code, title, company, dept, period, file_name, file_url, status) VALUES
        (1, 'HĐTT-2026-001', 'Hợp đồng thực tập Phát triển phần mềm', 'Hệ thống Đào tạo CodeGym Việt Nam', 'Phòng Phát triển Phần mềm', '01/07/2026 - 30/09/2026', 'Hop_Dong_Thuc_Tap_TranMinhKhoa.pdf', '/uploads/contract_khoa.pdf', 'pending'),
        (2, 'HĐTT-2026-002', 'Hợp đồng thực tập Tuyển dụng nhân sự', 'Hệ thống Đào tạo CodeGym Việt Nam', 'Phòng Nhân sự', '15/07/2026 - 15/10/2026', 'Hop_Dong_Thuc_Tap_LeThiLan.pdf', '/uploads/contract_lan.pdf', 'approved')
      `);
      console.log('✅ Đã nạp hợp đồng mẫu vào bảng contracts');
    }

    const [[{ aCount }]] = await db.query('SELECT COUNT(*) as aCount FROM attendance');
    if (aCount === 0) {
      await db.query(`
        INSERT INTO attendance (intern_id, date, check_in, check_out, total_hours, status, notes) VALUES
        (1, '2026-10-05', '08:25', '17:35', '8 giờ 10 phút', 'present', 'Đúng giờ'),
        (1, '2026-10-06', '08:42', '17:30', '7 giờ 48 phút', 'late', 'Đi muộn 12 phút'),
        (1, '2026-10-07', '08:28', '17:32', '8 giờ 04 phút', 'present', 'Đúng giờ'),
        (2, '2026-10-05', '08:20', '17:30', '8 giờ 10 phút', 'present', 'Đúng giờ'),
        (2, '2026-10-06', '08:30', '17:35', '8 giờ 05 phút', 'present', 'Đúng giờ')
      `);
      console.log('✅ Đã nạp dữ liệu chấm công mẫu vào bảng attendance');
    }

    const [[{ lCount }]] = await db.query('SELECT COUNT(*) as lCount FROM leave_requests');
    if (lCount === 0) {
      await db.query(`
        INSERT INTO leave_requests (intern_id, leave_type, start_date, end_date, days_count, reason, status) VALUES
        (1, 'Nghỉ học / Thi', '2026-10-12', '2026-10-13', 2, 'Trùng lịch thi môn Kiến trúc phần mềm tại trường ĐH Bách Khoa', 'pending'),
        (2, 'Việc cá nhân', '2026-10-08', '2026-10-08', 1, 'Giải quyết thủ tục hành chính tại địa phương', 'approved')
      `);
      console.log('✅ Đã nạp đơn nghỉ phép mẫu vào bảng leave_requests');
    }

    console.log('--- Hoàn tất di chuyển Schema Sprint 2 thành công 100%! ---');
  } catch (err) {
    console.error('Lỗi migration:', err);
  } finally {
    process.exit(0);
  }
}

migrate();
