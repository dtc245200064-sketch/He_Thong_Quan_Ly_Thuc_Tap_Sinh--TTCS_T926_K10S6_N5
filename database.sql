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

-- Mật khẩu mặc định: 123456 (được băm bằng bcrypt: $2a$10$wK1b8B.k72p4T14oZ.k7teq8vIe1r58v9u1oR/Qd7yC0hZ0f6G9wO)
INSERT INTO users (id, email, username, password, name, role, status, avatar, phone) VALUES
(1, 'admin@company.vn', 'admin', '$2a$10$wK1b8B.k72p4T14oZ.k7teq8vIe1r58v9u1oR/Qd7yC0hZ0f6G9wO', 'Lê Văn Admin', 'Admin', 'active', 'image/GiangVien.png', '0901 000 001'),
(2, 'hr@company.vn', 'hr.hoa', '$2a$10$wK1b8B.k72p4T14oZ.k7teq8vIe1r58v9u1oR/Qd7yC0hZ0f6G9wO', 'Nguyễn Thị Hoa', 'HR Manager', 'active', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120', '0988 888 999'),
(3, 'intern@student.vn', 'khoa.tm', '$2a$10$wK1b8B.k72p4T14oZ.k7teq8vIe1r58v9u1oR/Qd7yC0hZ0f6G9wO', 'Trần Minh Khoa', 'Thực tập sinh', 'active', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', '0912 345 678'),
(4, 'mentor@company.vn', 'mentor.tuan', '$2a$10$wK1b8B.k72p4T14oZ.k7teq8vIe1r58v9u1oR/Qd7yC0hZ0f6G9wO', 'Nguyễn Anh Tuấn', 'Mentor', 'active', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120', '0945 667 889')
ON DUPLICATE KEY UPDATE 
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

