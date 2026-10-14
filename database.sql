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
    mentor_id INT NULL DEFAULT NULL,
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

-- Tài khoản quản trị viên duy nhất (User Admin)
INSERT INTO users (id, email, username, password, name, role, status, avatar, phone) VALUES
(1, 'dtc245200281@ictu.edu.vn', 'admin', '$2b$10$VKlPttUsgKx3eGDoreoqde1AYQ3p9qsOcCFkPqQ89aXWtV/6gZaYe', 'Quản trị viên', 'Admin', 'active', 'image/GiangVien.png', '0901 000 001')
ON DUPLICATE KEY UPDATE 
    email=VALUES(email),
    username=VALUES(username),
    password=VALUES(password),
    role=VALUES(role), 
    status=VALUES(status);

-- Ma trận phân quyền chi tiết cho 4 vai trò
INSERT INTO role_permissions (role, permissions) VALUES
('Admin', '{"acc_manage": [true, true, true, true, false], "perm_system": [true, false, true, false, false], "profile_manage": [false, false, false, false, false], "search_intern": [false, false, false, false, false], "view_docs": [false, false, false, false, false], "review_docs": [false, false, false, false, false], "view_own_profile": [false, false, false, false, false], "upload_cv": [false, false, false, false, false], "upload_letter": [false, false, false, false, false], "view_status": [false, false, false, false, false]}'),
('HR Manager', '{"acc_manage": [true, false, false, false, false], "perm_system": [false, false, false, false, false], "profile_manage": [true, true, true, true, true], "search_intern": [true, true, true, true, false], "view_docs": [true, true, true, true, false], "review_docs": [true, true, true, true, true], "view_own_profile": [true, false, true, false, false], "upload_cv": [false, false, false, false, false], "upload_letter": [false, false, false, false, false], "view_status": [true, false, false, false, false]}'),
('Mentor', '{"acc_manage": [false, false, false, false, false], "perm_system": [false, false, false, false, false], "profile_manage": [true, false, true, false, false], "search_intern": [true, false, false, false, false], "view_docs": [true, false, false, false, false], "review_docs": [false, false, false, false, false], "view_own_profile": [true, false, true, false, false], "upload_cv": [false, false, false, false, false], "upload_letter": [false, false, false, false, false], "view_status": [false, false, false, false, false]}'),
('Thực tập sinh', '{"acc_manage": [false, false, false, false, false], "perm_system": [false, false, false, false, false], "profile_manage": [false, false, false, false, false], "search_intern": [false, false, false, false, false], "view_docs": [false, false, false, false, false], "review_docs": [false, false, false, false, false], "view_own_profile": [true, false, true, false, false], "upload_cv": [true, true, true, false, false], "upload_letter": [true, true, true, false, false], "view_status": [true, false, false, false, false]}')
ON DUPLICATE KEY UPDATE permissions=VALUES(permissions);

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

-- 10. BẢNG TASKS (STT 15, 16 - Giao nhiệm vụ & Cập nhật tiến độ - SCRUM-198)
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

-- 16. BẢNG INTERN_SCHEDULES (LỊCH THỰC TẬP & KẾ HOẠCH LÀM VIỆC ĐỘNG)
CREATE TABLE IF NOT EXISTS intern_schedules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    intern_id INT NOT NULL,
    schedule_date DATE NOT NULL,
    start_time VARCHAR(10) DEFAULT '08:30',
    end_time VARCHAR(10) DEFAULT '17:30',
    title VARCHAR(255) NOT NULL,
    content TEXT DEFAULT NULL,
    location VARCHAR(255) DEFAULT 'Văn phòng CodeGym',
    mentor_id INT NULL DEFAULT NULL,
    schedule_type ENUM('working', 'training', 'meeting', 'task', 'review', 'off') DEFAULT 'working',
    status ENUM('scheduled', 'completed', 'cancelled') DEFAULT 'scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (intern_id) REFERENCES interns(id) ON DELETE CASCADE,
    FOREIGN KEY (mentor_id) REFERENCES mentors(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Cấu hình tích hợp hệ thống mặc định (Core Integrations)
INSERT INTO system_integrations (id, integration_type, name, endpoint_url, api_key, status, last_sync_at, sync_frequency, config_data) VALUES
(1, 'hrm', 'Hệ thống Quản lý Nhân sự HRM Core', 'https://hrm.codegym.vn/api/v1/sync', 'hrm_live_key_99882233', 'connected', NOW(), 'Hàng ngày 00:00', '{"autoSync": true, "syncFields": ["employees", "interns", "contracts"]}'),
(2, 'qr_card_attendance', 'Máy chấm công Quét mã QR & Thẻ từ Hikvision', 'https://access.codegym.vn/device/gate-01', 'att_device_sec_771144', 'connected', NOW(), 'Thời gian thực (Webhook)', '{"autoCheckIn": true, "toleranceMinutes": 15, "cameraActive": true}')
ON DUPLICATE KEY UPDATE name=VALUES(name);



