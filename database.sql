-- ==============================================================================
-- CƠ SỞ DỮ LIỆU DỰ ÁN CODEGYM - HỆ THỐNG QUẢN LÝ THỰC TẬP SINH (HR & ADMIN PORTAL)
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS codegym CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE codegym;

-- 1. BẢNG USERS (TÀI KHOẢN ĐĂNG NHẬP CHO ADMIN, HR, MENTOR, THỰC TẬP SINH)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    username VARCHAR(50) DEFAULT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'Thực tập sinh',
    status ENUM('active', 'locked') NOT NULL DEFAULT 'active',
    avatar VARCHAR(255) DEFAULT NULL,
    phone VARCHAR(20) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. BẢNG ROLE_PERMISSIONS (MA TRẬN PHÂN QUYỀN CHI TIẾT THEO VAI TRÒ)
CREATE TABLE IF NOT EXISTS role_permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role VARCHAR(50) NOT NULL UNIQUE,
    permissions JSON NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. BẢNG INTERNS (HỒ SƠ THỰC TẬP SINH & ỨNG VIÊN)
CREATE TABLE IF NOT EXISTS interns (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20) DEFAULT NULL,
    school VARCHAR(100) NOT NULL,
    major VARCHAR(100) NOT NULL,
    dept VARCHAR(100) NOT NULL,
    mentor VARCHAR(100) DEFAULT NULL,
    position VARCHAR(100) DEFAULT NULL,
    start_date DATE DEFAULT NULL,
    end_date DATE DEFAULT NULL,
    gpa VARCHAR(20) DEFAULT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Chờ xét duyệt',
    reject_reason VARCHAR(255) DEFAULT NULL,
    reject_note TEXT DEFAULT NULL,
    skills TEXT DEFAULT NULL,
    bio TEXT DEFAULT NULL,
    projects TEXT DEFAULT NULL,
    birth_date VARCHAR(50) DEFAULT NULL,
    course VARCHAR(50) DEFAULT NULL,
    faculty VARCHAR(100) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. BẢNG DOCUMENTS (TÀI LIỆU CV, ĐƠN XIN THỰC TẬP)
CREATE TABLE IF NOT EXISTS documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    intern_id INT NOT NULL,
    doc_name VARCHAR(255) NOT NULL,
    doc_type ENUM('CV', 'APPLICATION_LETTER', 'TRANSCRIPT', 'OTHER') NOT NULL DEFAULT 'CV',
    file_url VARCHAR(255) NOT NULL,
    file_size VARCHAR(50) DEFAULT NULL,
    review_status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    reject_reason VARCHAR(255) DEFAULT NULL,
    reject_note TEXT DEFAULT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (intern_id) REFERENCES interns(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. BẢNG PROGRAMS (QUẢN LÝ CHƯƠNG TRÌNH THỰC TẬP THEO PHÒNG BAN - SPRINT 2)
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. BẢNG CONTRACTS (HỢP ĐỒNG THỰC TẬP & KÝ KẾT TRỰC TUYẾN - SPRINT 2)
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
    reject_reason TEXT DEFAULT NULL,
    confirmed_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (intern_id) REFERENCES interns(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. BẢNG ATTENDANCE (CHẤM CÔNG, CHECK-IN / CHECK-OUT HÀNG NGÀY - SPRINT 2)
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. BẢNG LEAVE_REQUESTS (ĐĂNG KÝ VÀ XÉT DUYỆT NGHỈ PHÉP - SPRINT 2)
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- DỮ LIỆU MẪU BAN ĐẦU (SEED DATA KHỚP VỚI GIAO DIỆN FRONTEND)
-- ==============================================================================

-- Mật khẩu mặc định: 123456 (được băm bằng bcrypt: $2b$10$mA/3TNEpZxS6.rvbnxt50eFKBore8bil8wpklMgnG4ql8tF.0N58S)
INSERT INTO users (id, email, username, password, name, role, status, avatar, phone) VALUES
(1, 'admin@company.vn', 'admin', '$2b$10$mA/3TNEpZxS6.rvbnxt50eFKBore8bil8wpklMgnG4ql8tF.0N58S', 'Lê Văn Admin', 'Admin', 'active', 'image/GiangVien.png', '0901 000 001'),
(2, 'hr@company.vn', 'hr.hoa', '$2b$10$mA/3TNEpZxS6.rvbnxt50eFKBore8bil8wpklMgnG4ql8tF.0N58S', 'Nguyễn Thị Hoa', 'HR Manager', 'active', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120', '0988 888 999'),
(3, 'intern@student.vn', 'khoa.tm', '$2b$10$mA/3TNEpZxS6.rvbnxt50eFKBore8bil8wpklMgnG4ql8tF.0N58S', 'Trần Minh Khoa', 'Thực tập sinh', 'active', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', '0912 345 678'),
(4, 'mentor@company.vn', 'mentor.tuan', '$2b$10$mA/3TNEpZxS6.rvbnxt50eFKBore8bil8wpklMgnG4ql8tF.0N58S', 'Nguyễn Anh Tuấn', 'Mentor', 'active', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120', '0945 667 889')
ON DUPLICATE KEY UPDATE 
    password=VALUES(password),
    username=VALUES(username), 
    role=VALUES(role), 
    status=VALUES(status);

-- Ma trận phân quyền chi tiết cho 4 vai trò
INSERT INTO role_permissions (role, permissions) VALUES
('Admin', '{"acc_manage": [true, true, true, true, false], "perm_system": [true, false, true, false, false], "profile_manage": [false, false, false, false, false], "search_intern": [false, false, false, false, false], "view_docs": [false, false, false, false, false], "review_docs": [false, false, false, false, false], "view_own_profile": [false, false, false, false, false], "upload_cv": [false, false, false, false, false], "upload_letter": [false, false, false, false, false], "view_status": [false, false, false, false, false]}'),
('HR Manager', '{"acc_manage": [true, false, false, false, false], "perm_system": [false, false, false, false, false], "profile_manage": [true, true, true, true, true], "search_intern": [true, true, true, true, false], "view_docs": [true, true, true, true, false], "review_docs": [true, true, true, true, true], "view_own_profile": [true, false, true, false, false], "upload_cv": [false, false, false, false, false], "upload_letter": [false, false, false, false, false], "view_status": [true, false, false, false, false]}'),
('Mentor', '{"acc_manage": [false, false, false, false, false], "perm_system": [false, false, false, false, false], "profile_manage": [true, false, true, false, false], "search_intern": [true, false, false, false, false], "view_docs": [true, false, false, false, false], "review_docs": [false, false, false, false, false], "view_own_profile": [true, false, true, false, false], "upload_cv": [false, false, false, false, false], "upload_letter": [false, false, false, false, false], "view_status": [false, false, false, false, false]}'),
('Thực tập sinh', '{"acc_manage": [false, false, false, false, false], "perm_system": [false, false, false, false, false], "profile_manage": [false, false, false, false, false], "search_intern": [false, false, false, false, false], "view_docs": [false, false, false, false, false], "review_docs": [false, false, false, false, false], "view_own_profile": [true, false, true, false, false], "upload_cv": [true, true, true, false, false], "upload_letter": [true, true, true, false, false], "view_status": [true, false, false, false, false]}')
ON DUPLICATE KEY UPDATE permissions=VALUES(permissions);

-- Danh sách thực tập sinh & ứng viên
INSERT INTO interns (id, user_id, name, email, phone, school, major, dept, mentor, position, start_date, end_date, gpa, status, skills, bio) VALUES
(1, 3, 'Trần Minh Khoa', 'intern@student.vn', '0912 345 678', 'ĐH Bách Khoa HN', 'CNTT', 'Kỹ thuật phần mềm', 'Anh Tuấn', 'Thực tập sinh Frontend React', '2026-07-01', '2026-09-30', '3.50', 'Đang thực tập', 'HTML, CSS, JavaScript, ReactJS', 'Sinh viên năm cuối nhiệt huyết, đam mê Frontend.'),
(2, NULL, 'Lê Thị Lan', 'lan.lt@ftu.edu.vn', '0933 222 111', 'ĐH Ngoại thương', 'Kinh doanh quốc tế', 'Nhân sự', 'Chị Lan', 'Thực tập sinh Tuyển dụng', '2026-07-15', '2026-10-15', '3.70', 'Đang thực tập', 'Kỹ năng giao tiếp, Sàng lọc CV, Phỏng vấn cơ bản', 'Ham học hỏi, cẩn thận, yêu thích công việc nhân sự.'),
(3, NULL, 'Nguyễn Hoàng Nam', 'nam.nh@student.hust.edu.vn', '0987 112 233', 'ĐH Bách Khoa HN', 'CNTT', 'Kỹ thuật phần mềm', 'Anh Tuấn', 'Thực tập sinh Frontend React/JS', '2026-10-01', '2026-12-31', '3.62', 'Chờ xét duyệt', 'JavaScript (ES6+), ReactJS, HTML5/CSS3, Git', 'Sinh viên năm cuối ĐH Bách Khoa Hà Nội.'),
(4, NULL, 'Trần Bảo Ngọc', 'ngoc.tb@ftu.edu.vn', '0976 554 321', 'ĐH Ngoại thương', 'Marketing', 'Marketing', 'Chị Mai', 'Thực tập sinh Digital Marketing', '2026-10-01', '2026-12-31', '3.75', 'Chờ xét duyệt', 'Content SEO, Google Analytics 4, Meta Ads', 'Năng động, sáng tạo, đạt giải nhì cuộc thi Marketing.'),
(5, NULL, 'Lê Quốc Thái', 'thai.lq@fpt.edu.vn', '0934 889 900', 'ĐH FPT', 'Kỹ thuật phần mềm', 'Kỹ thuật phần mềm', 'Anh Nam', 'Thực tập sinh Backend Node.js', '2026-10-01', '2026-12-31', '3.45', 'Chờ xét duyệt', 'Node.js, Express, PostgreSQL, MongoDB', 'Định hướng trở thành Backend Developer chất lượng cao.')
ON DUPLICATE KEY UPDATE id=id;


-- Danh sách chương trình thực tập (Sprint 2)
INSERT INTO programs (name, dept, mentor_default, start_date, end_date, max_interns, status, description) VALUES
('Chương trình thực tập Web Frontend React', 'Kỹ thuật phần mềm', 'Nguyễn Anh Tuấn', '2026-07-01', '2026-09-30', 15, 'active', 'Đào tạo và thực chiến ReactJS, Redux Toolkit, Tailwind CSS trên dự án thật.'),
('Chương trình thực tập Backend NodeJS & Cloud', 'Kỹ thuật phần mềm', 'Nguyễn Anh Tuấn', '2026-08-01', '2026-10-31', 12, 'active', 'Xây dựng RESTful API, Microservices với Node.js, Express, MySQL và Docker.'),
('Chương trình thực tập Tuyển dụng Nhân sự', 'Nhân sự', 'Nguyễn Thị Hoa', '2026-07-15', '2026-10-15', 8, 'active', 'Trải nghiệm quy trình sàng lọc hồ sơ ứng viên, phỏng vấn và quản lý dữ liệu nhân sự.'),
('Chương trình thực tập Digital Marketing', 'Marketing', 'Chị Mai', '2026-09-01', '2026-11-30', 10, 'upcoming', 'Triển khai chiến dịch SEO, Social Media và Content Marketing cho CodeGym.')
ON DUPLICATE KEY UPDATE id=id;

-- ==============================================================================
-- SPRINT 3: QUẢN LÝ CÔNG VIỆC, BÁO CÁO, ĐÁNH GIÁ, MENTOR, THỐNG KÊ & TÍCH HỢP
-- ==============================================================================

-- 9. BẢNG MENTORS (STT 29, 30, 31 - Quản lý mentor & phòng ban)
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. BẢNG TASKS (STT 15, 16 - Giao nhiệm vụ & Cập nhật tiến độ)
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. BẢNG WEEKLY_REPORTS (STT 17, 18 - Báo cáo tuần & Phản hồi)
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. BẢNG EVALUATIONS (STT 19, 20 - Đánh giá kỹ năng & thái độ)
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. BẢNG MEETINGS (STT 35 - Lịch họp & Gửi email tự động)
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. BẢNG INAPP_NOTIFICATIONS (STT 36 - Thông báo ứng dụng cho TTS)
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. BẢNG SYSTEM_INTEGRATIONS (STT 37, 38 - Tích hợp HRM & Chấm công QR/thẻ)
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed dữ liệu mẫu Sprint 3
INSERT INTO mentors (id, user_id, name, email, phone, dept, position, max_interns, status) VALUES
(1, 4, 'Nguyễn Anh Tuấn', 'mentor@company.vn', '0945 667 889', 'Phòng Phát triển Phần mềm', 'Tech Lead', 5, 'active'),
(2, NULL, 'Trần Minh Hoàng', 'hoang.tm@company.vn', '0912 345 670', 'Phòng Phát triển Phần mềm', 'Senior Fullstack Dev', 4, 'active'),
(3, NULL, 'Lê Thị Thu Lan', 'lan.lt@company.vn', '0933 222 110', 'Phòng Tuyển dụng & Đào tạo', 'HR Lead / Mentor', 6, 'active'),
(4, NULL, 'Phạm Quốc Cường', 'cuong.pq@company.vn', '0988 777 660', 'Phòng Marketing & Truyền thông', 'Marketing Manager', 4, 'active')
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO tasks (id, intern_id, mentor_id, title, description, deadline, progress, status, priority) VALUES
(1, 1, 1, 'Xây dựng giao diện Dashboard bằng HTML/CSS', 'Cắt giao diện chuẩn responsive theo thiết kế Figma cho phân hệ HR.', DATE_ADD(CURRENT_DATE, INTERVAL 3 DAY), 100, 'done', 'high'),
(2, 1, 1, 'Tích hợp API đăng nhập JWT và phân quyền', 'Viết hàm gọi API /api/auth/login và lưu token vào LocalStorage.', DATE_ADD(CURRENT_DATE, INTERVAL 7 DAY), 75, 'in_progress', 'high'),
(3, 1, 1, 'Viết Unit Test cho module quản lý thực tập sinh', 'Kiểm thử các hàm tìm kiếm, lọc và phân trang hồ sơ.', DATE_ADD(CURRENT_DATE, INTERVAL 12 DAY), 20, 'todo', 'medium')
ON DUPLICATE KEY UPDATE title=VALUES(title);

INSERT INTO weekly_reports (id, intern_id, mentor_id, week_number, start_date, end_date, tasks_completed, issues_faced, plans_next_week, status, mentor_feedback, mentor_rating) VALUES
(1, 1, 1, 1, DATE_SUB(CURRENT_DATE, INTERVAL 14 DAY), DATE_SUB(CURRENT_DATE, INTERVAL 7 DAY), 'Tìm hiểu cấu trúc thư mục, clone repo và hoàn thành giao diện đăng nhập.', 'Chưa quen với chuẩn CSS Flexbox & Grid.', 'Bắt tay vào ghép API login và bảng danh sách thực tập sinh.', 'reviewed', 'Tiến độ rất tốt, chủ động hỏi han khi gặp lỗi.', 9),
(2, 1, 1, 2, DATE_SUB(CURRENT_DATE, INTERVAL 7 DAY), CURRENT_DATE, 'Hoàn thiện chức năng chấm công, upload CV và sửa lỗi giao diện.', 'Gặp khó khăn khi cấu hình Multer upload file.', 'Làm tiếp module báo cáo tuần và tích hợp API nhiệm vụ.', 'submitted', NULL, NULL)
ON DUPLICATE KEY UPDATE week_number=VALUES(week_number);

INSERT INTO evaluations (id, intern_id, mentor_id, technical_score, discipline_score, attitude_score, total_score, grade, mentor_comments, hr_notes, status) VALUES
(1, 1, 1, 8.5, 9.0, 9.5, 9.0, 'Xuất sắc', 'Nắm bắt công nghệ nhanh, hoàn thành tốt các task được giao đúng hạn.', 'Đề xuất xem xét ký hợp đồng chính thức sau khi tốt nghiệp.', 'finalized')
ON DUPLICATE KEY UPDATE total_score=VALUES(total_score);

INSERT INTO system_integrations (id, integration_type, name, endpoint_url, api_key, status, last_sync_at, sync_frequency, config_data) VALUES
(1, 'hrm', 'Hệ thống Quản lý Nhân sự HRM Core', 'https://hrm.codegym.vn/api/v1/sync', 'hrm_live_key_99882233', 'connected', NOW(), 'Hàng ngày 00:00', '{"autoSync": true, "syncFields": ["employees", "interns", "contracts"]}'),
(2, 'qr_card_attendance', 'Máy chấm công Quét mã QR & Thẻ từ Hikvision', 'https://access.codegym.vn/device/gate-01', 'att_device_sec_771144', 'connected', NOW(), 'Thời gian thực (Webhook)', '{"autoCheckIn": true, "toleranceMinutes": 15, "cameraActive": true}')
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO meetings (id, title, meeting_date, start_time, end_time, location, link, host_name, intern_ids, notes, email_sent) VALUES
(1, 'Họp Review tiến độ công việc tuần với Mentor', CURRENT_DATE, '09:00', '10:30', 'Phòng họp P204 / Online Meet', 'https://meet.google.com/codegym-mentor-sync', 'Nguyễn Anh Tuấn', '[1]', 'Báo cáo kết quả công việc tuần và trao đổi các khó khăn kỹ thuật.', TRUE),
(2, 'Phỏng vấn & Đánh giá định kỳ thực tập sinh', DATE_ADD(CURRENT_DATE, INTERVAL 3 DAY), '14:00', '15:00', 'Google Meet Online', 'https://meet.google.com/codegym-mid-eval', 'Nguyễn Anh Tuấn & HR', '[1]', 'Đánh giá kỹ năng và định hướng mục tiêu giai đoạn tiếp theo.', TRUE)
ON DUPLICATE KEY UPDATE title=VALUES(title);



