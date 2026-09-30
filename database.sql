-- ==============================================================================
-- CƠ SỞ DỮ LIỆU DỰ ÁN CODEGYM - HỆ THỐNG QUẢN LÝ THỰC TẬP SINH (HR PORTAL)
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS codegym CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE codegym;

-- 1. BẢNG USERS (TÀI KHOẢN ĐĂNG NHẬP)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role ENUM('HR', 'INTERN', 'ADMIN', 'MENTOR') NOT NULL DEFAULT 'INTERN',
    avatar VARCHAR(255) DEFAULT NULL,
    phone VARCHAR(20) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. BẢNG INTERNS (HỒ SƠ THỰC TẬP SINH & ỨNG VIÊN)
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. BẢNG DOCUMENTS (TÀI LIỆU CV, ĐƠN XIN THỰC TẬP)
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

-- ==============================================================================
-- DỮ LIỆU MẪU BAN ĐẦU (SEED DATA KHỚP VỚI GIAO DIỆN FRONTEND)
-- ==============================================================================

-- Mật khẩu mặc định: 123456 (được băm bằng bcrypt: $2a$10$wK1b8B.k72p4T14oZ.k7teq8vIe1r58v9u1oR/Qd7yC0hZ0f6G9wO)
INSERT INTO users (id, email, password, name, role, avatar, phone) VALUES
(1, 'admin@company.vn', '$2a$10$wK1b8B.k72p4T14oZ.k7teq8vIe1r58v9u1oR/Qd7yC0hZ0f6G9wO', 'Quản Trị Viên', 'ADMIN', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120', '0901 000 001'),
(2, 'hr@company.vn', '$2a$10$wK1b8B.k72p4T14oZ.k7teq8vIe1r58v9u1oR/Qd7yC0hZ0f6G9wO', 'Nguyễn Thị Hoa', 'HR', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120', '0988 888 999'),
(3, 'intern@student.vn', '$2a$10$wK1b8B.k72p4T14oZ.k7teq8vIe1r58v9u1oR/Qd7yC0hZ0f6G9wO', 'Trần Minh Khoa', 'INTERN', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', '0912 345 678')
ON DUPLICATE KEY UPDATE id=id;

-- Danh sách thực tập sinh & ứng viên
INSERT INTO interns (id, user_id, name, email, phone, school, major, dept, mentor, position, start_date, end_date, gpa, status, skills, bio) VALUES
(1, 3, 'Trần Minh Khoa', 'intern@student.vn', '0912 345 678', 'ĐH Bách Khoa HN', 'CNTT', 'Kỹ thuật phần mềm', 'Anh Tuấn', 'Thực tập sinh Frontend React', '2026-07-01', '2026-09-30', '3.50', 'Đang thực tập', 'HTML, CSS, JavaScript, ReactJS', 'Sinh viên năm cuối nhiệt huyết, đam mê Frontend.'),
(2, NULL, 'Lê Thị Lan', 'lan.lt@ftu.edu.vn', '0933 222 111', 'ĐH Ngoại thương', 'Kinh doanh quốc tế', 'Nhân sự', 'Chị Lan', 'Thực tập sinh Tuyển dụng', '2026-07-15', '2026-10-15', '3.70', 'Đang thực tập', 'Kỹ năng giao tiếp, Sàng lọc CV, Phỏng vấn cơ bản', 'Ham học hỏi, cẩn thận, yêu thích công việc nhân sự.'),
(3, NULL, 'Nguyễn Hoàng Nam', 'nam.nh@student.hust.edu.vn', '0987 112 233', 'ĐH Bách Khoa HN', 'CNTT', 'Kỹ thuật phần mềm', 'Anh Tuấn', 'Thực tập sinh Frontend React/JS', '2026-10-01', '2026-12-31', '3.62', 'Chờ xét duyệt', 'JavaScript (ES6+), ReactJS, HTML5/CSS3, Git', 'Sinh viên năm cuối ĐH Bách Khoa Hà Nội.'),
(4, NULL, 'Trần Bảo Ngọc', 'ngoc.tb@ftu.edu.vn', '0976 554 321', 'ĐH Ngoại thương', 'Marketing', 'Marketing', 'Chị Mai', 'Thực tập sinh Digital Marketing', '2026-10-01', '2026-12-31', '3.75', 'Chờ xét duyệt', 'Content SEO, Google Analytics 4, Meta Ads', 'Năng động, sáng tạo, đạt giải nhì cuộc thi Marketing.'),
(5, NULL, 'Lê Quốc Thái', 'thai.lq@fpt.edu.vn', '0934 889 900', 'ĐH FPT', 'Kỹ thuật phần mềm', 'Kỹ thuật phần mềm', 'Anh Nam', 'Thực tập sinh Backend Node.js', '2026-10-01', '2026-12-31', '3.45', 'Chờ xét duyệt', 'Node.js, Express, PostgreSQL, MongoDB', 'Định hướng trở thành Backend Developer chất lượng cao.')
ON DUPLICATE KEY UPDATE id=id;

-- Danh sách tài liệu đính kèm
INSERT INTO documents (intern_id, doc_name, doc_type, file_url, file_size, review_status) VALUES
(1, 'CV_TranMinhKhoa_Frontend.pdf', 'CV', '/uploads/cv_tranminhkhoa.pdf', '1.2 MB', 'approved'),
(1, 'Don_Xin_Thuc_Tap_Khoa.pdf', 'APPLICATION_LETTER', '/uploads/don_khoa.pdf', '850 KB', 'approved'),
(3, 'CV_NguyenHoangNam_Frontend.pdf', 'CV', '/uploads/cv_nam.pdf', '1.4 MB', 'pending'),
(3, 'Don_Xin_Thuc_Tap_BK.pdf', 'APPLICATION_LETTER', '/uploads/don_nam.pdf', '920 KB', 'pending'),
(4, 'CV_TranBaoNgoc_Marketing.pdf', 'CV', '/uploads/cv_ngoc.pdf', '1.1 MB', 'pending'),
(5, 'CV_LeQuocThai_Backend.pdf', 'CV', '/uploads/cv_thai.pdf', '1.5 MB', 'pending')
ON DUPLICATE KEY UPDATE id=id;
