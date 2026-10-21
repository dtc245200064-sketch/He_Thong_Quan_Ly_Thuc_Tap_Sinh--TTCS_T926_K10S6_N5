-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th10 20, 2026 lúc 07:24 PM
-- Phiên bản máy phục vụ: 10.4.32-MariaDB
-- Phiên bản PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `codegym`
CREATE DATABASE IF NOT EXISTS `codegym` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `codegym`;
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `attendance`
--

CREATE TABLE `attendance` (
  `id` int(11) NOT NULL,
  `intern_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `check_in` varchar(10) DEFAULT NULL,
  `check_out` varchar(10) DEFAULT NULL,
  `total_hours` varchar(50) DEFAULT NULL,
  `status` enum('present','late','leave','remote','absent') NOT NULL DEFAULT 'present',
  `notes` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `attendance`
--

INSERT INTO `attendance` (`id`, `intern_id`, `date`, `check_in`, `check_out`, `total_hours`, `status`, `notes`, `created_at`) VALUES
(2, 4, '2026-10-20', '10:40', '10:40', '0 giờ 00 phút', 'leave', 'Nghỉ phép theo đơn duyệt', '2026-10-20 03:40:51');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `contracts`
--

CREATE TABLE `contracts` (
  `id` int(11) NOT NULL,
  `intern_id` int(11) NOT NULL,
  `code` varchar(50) NOT NULL,
  `title` varchar(200) NOT NULL,
  `company` varchar(150) NOT NULL DEFAULT 'Hệ thống Đào tạo CodeGym Việt Nam',
  `dept` varchar(100) NOT NULL DEFAULT 'Phòng Phát triển Phần mềm',
  `period` varchar(100) DEFAULT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `file_url` varchar(255) DEFAULT NULL,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `confirmed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `reject_reason` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `contracts`
--

INSERT INTO `contracts` (`id`, `intern_id`, `code`, `title`, `company`, `dept`, `period`, `file_name`, `file_url`, `status`, `confirmed_at`, `created_at`, `reject_reason`) VALUES
(2, 4, 'HĐTT-2026-004', 'Hợp đồng thực tập Kỹ thuật phần mềm', 'Hệ thống Đào tạo CodeGym Việt Nam', 'Kỹ thuật phần mềm', '20/10/2026 - 20/11/2026', '01_GenAI_SoftwareDevelopment_project-plan.docx', '/uploads/01_GenAI_SoftwareDevelopment_project-plan-1792467605803-4600.docx', 'approved', '2026-10-20 03:40:44', '2026-10-20 03:40:05', NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `departments`
--

CREATE TABLE `departments` (
  `id` int(11) NOT NULL,
  `code` varchar(50) NOT NULL,
  `name` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `departments`
--

INSERT INTO `departments` (`id`, `code`, `name`, `description`, `created_at`, `updated_at`) VALUES
(3, 'PTPM', 'Phát Triển Phần Mềm', 'ok', '2026-10-20 03:45:11', '2026-10-20 03:45:11');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `documents`
--

CREATE TABLE `documents` (
  `id` int(11) NOT NULL,
  `intern_id` int(11) NOT NULL,
  `doc_name` varchar(255) NOT NULL,
  `doc_type` enum('CV','APPLICATION_LETTER','TRANSCRIPT','CONTRACT','OTHER') NOT NULL DEFAULT 'CV',
  `file_url` varchar(255) NOT NULL,
  `file_size` varchar(50) DEFAULT NULL,
  `review_status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `reject_reason` varchar(255) DEFAULT NULL,
  `reject_note` text DEFAULT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `documents`
--

INSERT INTO `documents` (`id`, `intern_id`, `doc_name`, `doc_type`, `file_url`, `file_size`, `review_status`, `reject_reason`, `reject_note`, `uploaded_at`) VALUES
(4, 4, 'Screenshot 2026-10-02 223231.png', 'CV', '/uploads/Screenshot_2026-10-02_223231-1792467408178-6421.png', '105 KB', 'approved', NULL, 'Đã duyệt hồ sơ', '2026-10-20 03:36:48'),
(5, 4, 'Screenshot 2026-10-02 223827.png', 'APPLICATION_LETTER', '/uploads/Screenshot_2026-10-02_223827-1792467414695-1819.png', '71 KB', 'approved', NULL, 'Đã duyệt hồ sơ', '2026-10-20 03:36:54'),
(6, 4, '01_GenAI_SoftwareDevelopment_project-plan.docx', 'CONTRACT', '/uploads/01_GenAI_SoftwareDevelopment_project-plan-1792467605803-4600.docx', 'Hợp đồng thực tập', 'pending', NULL, NULL, '2026-10-20 03:40:05');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `evaluations`
--

CREATE TABLE `evaluations` (
  `id` int(11) NOT NULL,
  `intern_id` int(11) NOT NULL,
  `mentor_id` int(11) DEFAULT NULL,
  `technical_score` decimal(3,1) NOT NULL DEFAULT 8.0,
  `discipline_score` decimal(3,1) NOT NULL DEFAULT 8.5,
  `attitude_score` decimal(3,1) NOT NULL DEFAULT 9.0,
  `total_score` decimal(3,1) NOT NULL DEFAULT 8.5,
  `grade` enum('Xuất sắc','Giỏi','Khá','Trung bình','Yếu') NOT NULL DEFAULT 'Giỏi',
  `mentor_comments` text DEFAULT NULL,
  `hr_notes` text DEFAULT NULL,
  `status` enum('draft','finalized','approved') DEFAULT 'finalized',
  `evaluated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `inapp_notifications`
--

CREATE TABLE `inapp_notifications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `role` varchar(50) DEFAULT NULL,
  `title` varchar(200) NOT NULL,
  `content` text NOT NULL,
  `type` enum('info','warning','success','urgent') DEFAULT 'info',
  `is_read` tinyint(1) DEFAULT 0,
  `link` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `inapp_notifications`
--

INSERT INTO `inapp_notifications` (`id`, `user_id`, `role`, `title`, `content`, `type`, `is_read`, `link`, `created_at`) VALUES
(1, NULL, 'Thực tập sinh', 'Chào mừng bạn đến với kỳ thực tập Sprint 3!', 'Hệ thống đã cập nhật tính năng quản lý công việc và báo cáo tuần.', 'success', 1, 'intern.html#reports', '2026-10-13 11:27:21'),
(2, NULL, 'Thực tập sinh', 'Lịch họp định kỳ tuần vào 09:00 Thứ Hai', 'Vui lòng chuẩn bị nội dung báo cáo tuần trước khi tham gia.', 'info', 1, 'intern.html#schedule', '2026-10-13 11:27:21'),
(5, NULL, 'Thực tập sinh', 'Cập nhật tiến độ mới', 'Bạn đã ghi nhận tiến độ công việc \"Thiết Kế DB\" đạt 50%.', 'info', 1, '', '2026-10-13 11:49:04'),
(6, NULL, 'Thực tập sinh', 'Đã nộp báo cáo tuần', 'Báo cáo \"Tuần 3\" đã được đã nộp thành công vào hệ thống.', 'success', 1, '', '2026-10-13 11:49:20'),
(7, 9, 'Thực tập sinh', 'Nhiệm vụ mới: Xây dựng giao diện Dashboard bằng HTML/CSS', 'Công việc \"Xây dựng giao diện Dashboard bằng HTML/CSS\" đã được ghi nhận vào hệ thống. Hạn hoàn thành: 2026-10-20', 'info', 0, 'intern.html#progress', '2026-10-20 03:42:31'),
(8, NULL, 'Thực tập sinh', 'Cập nhật tiến độ mới', 'Bạn đã ghi nhận tiến độ công việc \"Xây dựng giao diện Dashboard bằng HTML/CSS\" đạt 35%.', 'info', 0, '', '2026-10-20 03:42:31'),
(9, NULL, 'Thực tập sinh', 'Đã nộp báo cáo tuần', 'Báo cáo \"Tuần 3\" đã được đã nộp thành công vào hệ thống.', 'success', 0, '', '2026-10-20 03:42:44'),
(10, 9, 'Thực tập sinh', 'Nhiệm vụ mới: ok', 'Công việc \"ok\" đã được ghi nhận vào hệ thống. Hạn hoàn thành: 2026-10-27', 'info', 0, 'intern.html#progress', '2026-10-20 03:46:32'),
(11, 9, 'Thực tập sinh', 'Lịch họp: ok', 'Cuộc họp diễn ra lúc 09:00 - 14:00 ngày 2026-10-20. Địa điểm: Google Meet Online', 'info', 0, 'intern.html#schedule', '2026-10-20 03:47:53'),
(17, 9, 'Thực tập sinh', 'Lịch họp: Học meet', 'Cuộc họp diễn ra lúc 09:00 - 10:00 ngày 2026-10-20. Địa điểm: Google Meet Online', 'info', 0, 'intern.html#schedule', '2026-10-20 03:55:08');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `interns`
--

CREATE TABLE `interns` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `school` varchar(100) NOT NULL,
  `major` varchar(100) NOT NULL,
  `dept` varchar(100) NOT NULL,
  `mentor` varchar(100) DEFAULT NULL,
  `mentor_id` int(11) DEFAULT NULL,
  `position` varchar(100) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `gpa` varchar(20) DEFAULT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'Chờ xét duyệt',
  `reject_reason` varchar(255) DEFAULT NULL,
  `reject_note` text DEFAULT NULL,
  `skills` text DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `projects` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `birth_date` varchar(50) DEFAULT NULL,
  `course` varchar(50) DEFAULT NULL,
  `faculty` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `interns`
--

INSERT INTO `interns` (`id`, `user_id`, `name`, `email`, `phone`, `school`, `major`, `dept`, `mentor`, `mentor_id`, `position`, `start_date`, `end_date`, `gpa`, `status`, `reject_reason`, `reject_note`, `skills`, `bio`, `projects`, `created_at`, `updated_at`, `birth_date`, `course`, `faculty`) VALUES
(4, 9, 'Nguyễn Trọng Xuyên', 'xuyen@xuyen.com', '', 'Đại học Bách Khoa', 'CNTT', 'Kỹ thuật phần mềm', 'Đinh Tiến Mạnh', 5, 'Thực tập sinh CNTT', '2026-10-20', '2026-11-20', NULL, 'Đang thực tập', NULL, 'Đã duyệt hồ sơ', NULL, NULL, NULL, '2026-10-20 03:36:48', '2026-10-20 03:45:31', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `intern_schedules`
--

CREATE TABLE `intern_schedules` (
  `id` int(11) NOT NULL,
  `intern_id` int(11) NOT NULL,
  `schedule_date` date NOT NULL,
  `start_time` varchar(10) DEFAULT '08:30',
  `end_time` varchar(10) DEFAULT '17:30',
  `title` varchar(255) NOT NULL,
  `content` text DEFAULT NULL,
  `location` varchar(255) DEFAULT 'Văn phòng CodeGym',
  `mentor_id` int(11) DEFAULT NULL,
  `schedule_type` enum('working','training','meeting','task','review','off') DEFAULT 'working',
  `status` enum('scheduled','completed','cancelled') DEFAULT 'scheduled',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `leave_requests`
--

CREATE TABLE `leave_requests` (
  `id` int(11) NOT NULL,
  `intern_id` int(11) NOT NULL,
  `leave_type` varchar(100) NOT NULL DEFAULT 'Việc cá nhân',
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `days_count` int(11) NOT NULL DEFAULT 1,
  `reason` text NOT NULL,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `review_note` text DEFAULT NULL,
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `reviewed_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `leave_requests`
--

INSERT INTO `leave_requests` (`id`, `intern_id`, `leave_type`, `start_date`, `end_date`, `days_count`, `reason`, `status`, `review_note`, `submitted_at`, `reviewed_at`) VALUES
(1, 4, 'Việc cá nhân', '2026-10-20', '2026-10-20', 1, 'cc', 'approved', NULL, '2026-10-20 03:41:11', '2026-10-20 03:41:37');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `meetings`
--

CREATE TABLE `meetings` (
  `id` int(11) NOT NULL,
  `title` varchar(200) NOT NULL,
  `meeting_date` date NOT NULL,
  `start_time` varchar(10) NOT NULL,
  `end_time` varchar(10) NOT NULL,
  `location` varchar(255) DEFAULT 'Phòng họp Tầng 3 / Google Meet',
  `link` varchar(255) DEFAULT NULL,
  `host_name` varchar(100) NOT NULL,
  `intern_ids` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`intern_ids`)),
  `notes` text DEFAULT NULL,
  `email_sent` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `meetings`
--

INSERT INTO `meetings` (`id`, `title`, `meeting_date`, `start_time`, `end_time`, `location`, `link`, `host_name`, `intern_ids`, `notes`, `email_sent`, `created_at`) VALUES
(3, 'ok', '2026-10-20', '09:00', '14:00', 'Google Meet Online', '310', 'Đinh Tiến Mạnh', '[4]', 'tts cbi', 1, '2026-10-20 03:47:48'),
(9, 'Học meet', '2026-10-20', '09:00', '10:00', 'Google Meet Online', 'https://meet.google.com/qmk-sqfp-wxx', 'Đinh Tiến Mạnh', '[4]', 'tts vô học', 1, '2026-10-20 03:55:04');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `mentors`
--

CREATE TABLE `mentors` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `dept` varchar(100) NOT NULL,
  `position` varchar(100) DEFAULT 'Senior Mentor',
  `max_interns` int(11) DEFAULT 5,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `mentors`
--

INSERT INTO `mentors` (`id`, `user_id`, `name`, `email`, `phone`, `dept`, `position`, `max_interns`, `status`, `created_at`) VALUES
(5, 8, 'Đinh Tiến Mạnh', 'manh@manh.com', '0912 345 678', 'Phát Triển Phần Mềm', 'Quản Lý', 5, 'active', '2026-10-20 03:45:22');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `programs`
--

CREATE TABLE `programs` (
  `id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL,
  `dept` varchar(100) NOT NULL,
  `mentor_default` varchar(100) DEFAULT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `max_interns` int(11) DEFAULT 10,
  `status` enum('active','upcoming','completed') DEFAULT 'active',
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `schedule` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`schedule`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `programs`
--

INSERT INTO `programs` (`id`, `name`, `dept`, `mentor_default`, `start_date`, `end_date`, `max_interns`, `status`, `description`, `created_at`, `schedule`) VALUES
(1, 'Chương trình thực tập Web Frontend React', 'Kỹ thuật phần mềm', 'Nguyễn Trọng Xuyên', '2026-10-13', '2026-10-14', 5, 'active', 'Làm Tốt', '2026-10-13 11:55:25', '[]');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `role_permissions`
--

CREATE TABLE `role_permissions` (
  `id` int(11) NOT NULL,
  `role` varchar(50) NOT NULL,
  `permissions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`permissions`)),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `role_permissions`
--

INSERT INTO `role_permissions` (`id`, `role`, `permissions`, `updated_at`) VALUES
(1, 'Admin', '{\"acc_manage\": [true, true, true, true, false], \"perm_system\": [true, false, true, false, false], \"profile_manage\": [false, false, false, false, false], \"search_intern\": [false, false, false, false, false], \"view_docs\": [false, false, false, false, false], \"review_docs\": [false, false, false, false, false], \"view_own_profile\": [false, false, false, false, false], \"upload_cv\": [false, false, false, false, false], \"upload_letter\": [false, false, false, false, false], \"view_status\": [false, false, false, false, false]}', '2026-10-08 18:31:31'),
(2, 'HR Manager', '{\"acc_manage\": [true, false, false, false, false], \"perm_system\": [false, false, false, false, false], \"profile_manage\": [true, true, true, true, true], \"search_intern\": [true, true, true, true, false], \"view_docs\": [true, true, true, true, false], \"review_docs\": [true, true, true, true, true], \"view_own_profile\": [true, false, true, false, false], \"upload_cv\": [false, false, false, false, false], \"upload_letter\": [false, false, false, false, false], \"view_status\": [true, false, false, false, false]}', '2026-10-20 04:07:57'),
(3, 'Mentor', '{\"acc_manage\": [false, false, false, false, false], \"perm_system\": [false, false, false, false, false], \"profile_manage\": [true, false, true, false, false], \"search_intern\": [true, false, false, false, false], \"view_docs\": [true, false, false, false, false], \"review_docs\": [false, false, false, false, false], \"view_own_profile\": [true, false, true, false, false], \"upload_cv\": [false, false, false, false, false], \"upload_letter\": [false, false, false, false, false], \"view_status\": [false, false, false, false, false]}', '2026-10-20 04:07:57'),
(10, 'Thực tập sinh', '{\"acc_manage\": [false, false, false, false, false], \"perm_system\": [false, false, false, false, false], \"profile_manage\": [false, false, false, false, false], \"search_intern\": [false, false, false, false, false], \"view_docs\": [false, false, false, false, false], \"review_docs\": [false, false, false, false, false], \"view_own_profile\": [true, false, true, false, false], \"upload_cv\": [true, true, true, false, false], \"upload_letter\": [true, true, true, false, false], \"view_status\": [true, false, false, false, false]}', '2026-10-08 18:31:31'),
(20, 'Th???c t???p sinh', '{\"acc_manage\": [false, false, false, false, false], \"perm_system\": [false, false, false, false, false], \"profile_manage\": [false, false, false, false, false], \"search_intern\": [false, false, false, false, false], \"view_docs\": [false, false, false, false, false], \"review_docs\": [false, false, false, false, false], \"view_own_profile\": [true, false, true, false, false], \"upload_cv\": [true, true, true, false, false], \"upload_letter\": [true, true, true, false, false], \"view_status\": [true, false, false, false, false]}', '2026-10-20 04:07:57');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `system_emails`
--

CREATE TABLE `system_emails` (
  `id` int(11) NOT NULL,
  `recipient_email` varchar(150) NOT NULL,
  `recipient_name` varchar(100) DEFAULT NULL,
  `subject` varchar(255) NOT NULL,
  `email_type` enum('approved','rejected','contract','general') DEFAULT 'general',
  `content` text NOT NULL,
  `preview_url` varchar(255) DEFAULT NULL,
  `status` enum('sent','failed') DEFAULT 'sent',
  `sent_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `system_emails`
--

INSERT INTO `system_emails` (`id`, `recipient_email`, `recipient_name`, `subject`, `email_type`, `content`, `preview_url`, `status`, `sent_at`) VALUES
(1, 'intern@gmail.com', 'Tạ Văn Đức', '[CodeGym] Chúc mừng! Hồ sơ thực tập của bạn đã được phê duyệt', 'approved', '\n    <!DOCTYPE html>\n    <html>\n    <head>\n      <meta charset=\"utf-8\">\n      <style>\n        body { font-family: \'Segoe UI\', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }\n        .email-container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }\n        .email-header { background: linear-gradient(135deg, #1e3a8a, #2563eb); padding: 30px 24px; text-align: center; color: white; }\n        .email-header h1 { margin: 0; font-size: 22px; font-weight: 700; }\n        .email-header p { margin: 8px 0 0; font-size: 14px; opacity: 0.9; }\n        .email-body { padding: 32px 28px; line-height: 1.6; }\n        .status-badge { display: inline-block; padding: 6px 16px; border-radius: 20px; font-weight: 600; font-size: 14px; margin-bottom: 20px; background: #dcfce7; color: #166534; }\n        .info-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0; }\n        .info-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }\n        .info-label { color: #64748b; font-weight: 500; }\n        .info-value { color: #0f172a; font-weight: 600; }\n        .btn-action { display: inline-block; padding: 12px 28px; background: #2563eb; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; margin-top: 15px; text-align: center; }\n        .email-footer { background: #f1f5f9; padding: 20px 24px; text-align: center; font-size: 12.5px; color: #64748b; border-top: 1px solid #e2e8f0; }\n      </style>\n    </head>\n    <body>\n      <div class=\"email-container\">\n        <div class=\"email-header\">\n          <h1>HỆ THỐNG THỰC TẬP CODEGYM</h1>\n          <p>Phòng Đào tạo & Quản lý Nhân sự Doanh nghiệp</p>\n        </div>\n        <div class=\"email-body\">\n          <p>Kính gửi bạn <b>Tạ Văn Đức</b>,</p>\n          \n          <div class=\"status-badge\">\n            ✓ HỒ SƠ ĐÃ ĐƯỢC DUYỆT\n          </div>\n\n          <p>\n            Chúc mừng bạn! Sau quá trình đánh giá và xem xét hồ sơ, Phòng Nhân sự CodeGym trân trọng thông báo hồ sơ xin thực tập của bạn đã <b>được phê duyệt thành công</b>.\n          </p>\n\n          <div class=\"info-card\">\n            <div class=\"info-row\"><span class=\"info-label\">Ứng viên:</span> <span class=\"info-value\">Tạ Văn Đức</span></div>\n            <div class=\"info-row\"><span class=\"info-label\">Email:</span> <span class=\"info-value\">intern@gmail.com</span></div>\n            <div class=\"info-row\"><span class=\"info-label\">Kết quả xét duyệt:</span> <span class=\"info-value\" style=\"color: #16a34a\">Đã duyệt (Trúng tuyển)</span></div>\n            \n            <div class=\"info-row\"><span class=\"info-label\">Ghi chú từ HR:</span> <span class=\"info-value\">Đã duyệt hồ sơ</span></div>\n          </div>\n\n          \n            <p><b>Bước tiếp theo:</b></p>\n            <p>Vui lòng đăng nhập vào <b>Cổng Thực tập sinh</b> để kiểm tra thông tin, xem và xác nhận <b>Hợp đồng thực tập</b> theo quy định.</p>\n            <center>\n              <a href=\"http://localhost:5000/intern.html\" class=\"btn-action\">Truy cập Cổng Thực tập sinh</a>\n            </center>\n          \n\n          <p style=\"margin-top: 30px;\">Trân trọng,<br><b>Phòng Nhân sự & Đào tạo CodeGym Việt Nam</b></p>\n        </div>\n        <div class=\"email-footer\">\n          Email này được gửi tự động từ Hệ thống Quản lý Thực tập sinh CodeGym.<br>\n          Địa chỉ: Tầng 2, Tòa nhà CodeGym, Hà Nội • Hotline: 1900 888 888\n        </div>\n      </div>\n    </body>\n    </html>\n  ', 'https://ethereal.email/message/as4U228uLh9DMGj-as4U37JrKujo9ffcAAAAAbPocvrXuc1T3xt0F.my1kc', 'sent', '2026-10-13 11:24:05'),
(2, 'xuyen@xuyen.com', 'Nguyễn Trọng Xuyên', '[CodeGym] Chúc mừng! Hồ sơ thực tập của bạn đã được phê duyệt', 'approved', '\n    <!DOCTYPE html>\n    <html>\n    <head>\n      <meta charset=\"utf-8\">\n      <style>\n        body { font-family: \'Segoe UI\', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }\n        .email-container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }\n        .email-header { background: linear-gradient(135deg, #1e3a8a, #2563eb); padding: 30px 24px; text-align: center; color: white; }\n        .email-header h1 { margin: 0; font-size: 22px; font-weight: 700; }\n        .email-header p { margin: 8px 0 0; font-size: 14px; opacity: 0.9; }\n        .email-body { padding: 32px 28px; line-height: 1.6; }\n        .status-badge { display: inline-block; padding: 6px 16px; border-radius: 20px; font-weight: 600; font-size: 14px; margin-bottom: 20px; background: #dcfce7; color: #166534; }\n        .info-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0; }\n        .info-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }\n        .info-label { color: #64748b; font-weight: 500; }\n        .info-value { color: #0f172a; font-weight: 600; }\n        .btn-action { display: inline-block; padding: 12px 28px; background: #2563eb; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; margin-top: 15px; text-align: center; }\n        .email-footer { background: #f1f5f9; padding: 20px 24px; text-align: center; font-size: 12.5px; color: #64748b; border-top: 1px solid #e2e8f0; }\n      </style>\n    </head>\n    <body>\n      <div class=\"email-container\">\n        <div class=\"email-header\">\n          <h1>HỆ THỐNG THỰC TẬP CODEGYM</h1>\n          <p>Phòng Đào tạo & Quản lý Nhân sự Doanh nghiệp</p>\n        </div>\n        <div class=\"email-body\">\n          <p>Kính gửi bạn <b>Nguyễn Trọng Xuyên</b>,</p>\n          \n          <div class=\"status-badge\">\n            ✓ HỒ SƠ ĐÃ ĐƯỢC DUYỆT\n          </div>\n\n          <p>\n            Chúc mừng bạn! Sau quá trình đánh giá và xem xét hồ sơ, Phòng Nhân sự CodeGym trân trọng thông báo hồ sơ xin thực tập của bạn đã <b>được phê duyệt thành công</b>.\n          </p>\n\n          <div class=\"info-card\">\n            <div class=\"info-row\"><span class=\"info-label\">Ứng viên:</span> <span class=\"info-value\">Nguyễn Trọng Xuyên</span></div>\n            <div class=\"info-row\"><span class=\"info-label\">Email:</span> <span class=\"info-value\">xuyen@xuyen.com</span></div>\n            <div class=\"info-row\"><span class=\"info-label\">Kết quả xét duyệt:</span> <span class=\"info-value\" style=\"color: #16a34a\">Đã duyệt (Trúng tuyển)</span></div>\n            \n            <div class=\"info-row\"><span class=\"info-label\">Ghi chú từ HR:</span> <span class=\"info-value\">Đã duyệt hồ sơ</span></div>\n          </div>\n\n          \n            <p><b>Bước tiếp theo:</b></p>\n            <p>Vui lòng đăng nhập vào <b>Cổng Thực tập sinh</b> để kiểm tra thông tin, xem và xác nhận <b>Hợp đồng thực tập</b> theo quy định.</p>\n            <center>\n              <a href=\"http://localhost:5000/intern.html\" class=\"btn-action\">Truy cập Cổng Thực tập sinh</a>\n            </center>\n          \n\n          <p style=\"margin-top: 30px;\">Trân trọng,<br><b>Phòng Nhân sự & Đào tạo CodeGym Việt Nam</b></p>\n        </div>\n        <div class=\"email-footer\">\n          Email này được gửi tự động từ Hệ thống Quản lý Thực tập sinh CodeGym.<br>\n          Địa chỉ: Tầng 2, Tòa nhà CodeGym, Hà Nội • Hotline: 1900 888 888\n        </div>\n      </div>\n    </body>\n    </html>\n  ', 'https://ethereal.email/message/atbh-OO.J4b7WrFJatbh.Z0L.yTpBwEKAAAAAVU5-N.RPv4NAqOqLV.Vrxk', 'sent', '2026-10-20 03:37:28'),
(9, 'xuyen@xuyen.com', 'Nguyễn Trọng Xuyên', '[THÔNG BÁO LỊCH HỌP] Học meet - Hệ thống Quản lý Thực tập sinh CodeGym', 'general', '\n    <div style=\"font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;\">\n      <div style=\"background-color: #0d6efd; color: #ffffff; padding: 20px; text-align: center;\">\n        <h2 style=\"margin: 0; font-size: 20px;\">LỊCH HỌP MỚI DÀNH CHO THỰC TẬP SINH</h2>\n        <p style=\"margin: 5px 0 0; opacity: 0.9; font-size: 14px;\">Hệ thống Đào tạo & Quản lý CodeGym</p>\n      </div>\n      <div style=\"padding: 24px;\">\n        <p>Xin chào <strong>Nguyễn Trọng Xuyên</strong>,</p>\n        <p>Bạn có một lịch họp mới được sắp xếp trên hệ thống. Dưới đây là thông tin chi tiết:</p>\n        <div style=\"background-color: #f8fafc; border-left: 4px solid #0d6efd; padding: 16px; margin: 20px 0; border-radius: 0 4px 4px 0;\">\n          <p style=\"margin: 0 0 8px;\">📅 <strong>Chủ đề cuộc họp:</strong> Học meet</p>\n          <p style=\"margin: 0 0 8px;\">⏰ <strong>Thời gian:</strong> 09:00 - 10:00, ngày <strong>2026-10-20</strong></p>\n          <p style=\"margin: 0 0 8px;\">📍 <strong>Địa điểm / Hình thức:</strong> Google Meet Online</p>\n          <p style=\"margin: 0 0 8px;\">🔗 <strong>Đường dẫn tham gia:</strong> <a href=\"https://meet.google.com/qmk-sqfp-wxx\" target=\"_blank\" style=\"color: #0d6efd;\">https://meet.google.com/qmk-sqfp-wxx</a></p>\n          <p style=\"margin: 0 0 8px;\">👤 <strong>Người chủ trì:</strong> Đinh Tiến Mạnh</p>\n          <p style=\"margin: 0;\">📝 <strong>Ghi chú:</strong> tts vô học</p>\n        </div>\n        <p style=\"font-size: 13px; color: #64748b;\">Vui lòng sắp xếp thời gian tham gia đúng giờ và chuẩn bị nội dung báo cáo theo yêu cầu.</p>\n      </div>\n      <div style=\"background-color: #f1f5f9; padding: 12px; text-align: center; font-size: 12px; color: #64748b;\">\n        © 2026 CodeGym Vietnam - Email thông báo tự động từ Hệ thống Quản lý Thực tập sinh.\n      </div>\n    </div>\n  ', 'https://ethereal.email/message/atbh-OO.J4b7WrFJatbmIVz99noLekBcAAAACGdQaXAwj37LLLTUPzqwejc', 'sent', '2026-10-20 03:55:08');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `system_integrations`
--

CREATE TABLE `system_integrations` (
  `id` int(11) NOT NULL,
  `integration_type` enum('hrm','qr_card_attendance') NOT NULL,
  `name` varchar(150) NOT NULL,
  `endpoint_url` varchar(255) DEFAULT NULL,
  `api_key` varchar(255) DEFAULT NULL,
  `secret_token` varchar(255) DEFAULT NULL,
  `status` enum('connected','disconnected','syncing','error') DEFAULT 'connected',
  `last_sync_at` timestamp NULL DEFAULT NULL,
  `sync_frequency` varchar(50) DEFAULT 'Daily',
  `config_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`config_data`)),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `system_integrations`
--

INSERT INTO `system_integrations` (`id`, `integration_type`, `name`, `endpoint_url`, `api_key`, `secret_token`, `status`, `last_sync_at`, `sync_frequency`, `config_data`, `updated_at`) VALUES
(1, 'hrm', 'H??? th???ng Qu???n l?? Nh??n s??? HRM Core', 'https://hrm.codegym.vn/api/v1/sync', 'hrm_live_key_99882233', NULL, 'connected', '2026-10-13 04:47:37', 'Hàng ngày 00:00', '{\"autoSync\": true, \"syncFields\": [\"employees\", \"interns\", \"contracts\"]}', '2026-10-20 04:07:57'),
(2, 'qr_card_attendance', 'M??y ch???m c??ng Qu??t m?? QR & Th??? t??? Hikvision', 'https://access.codegym.vn/device/gate-01', 'att_device_sec_771144', NULL, 'connected', '2026-10-13 04:47:37', 'Thời gian thực (Webhook)', '{\"autoCheckIn\": true, \"toleranceMinutes\": 15, \"cameraActive\": true}', '2026-10-20 04:07:57');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `tasks`
--

CREATE TABLE `tasks` (
  `id` int(11) NOT NULL,
  `intern_id` int(11) NOT NULL,
  `mentor_id` int(11) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `deadline` date DEFAULT NULL,
  `progress` int(11) DEFAULT 0,
  `status` enum('todo','in_progress','review','done','canceled') DEFAULT 'todo',
  `priority` enum('low','medium','high','urgent') DEFAULT 'medium',
  `mentor_note` text DEFAULT NULL,
  `intern_note` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `tasks`
--

INSERT INTO `tasks` (`id`, `intern_id`, `mentor_id`, `title`, `description`, `deadline`, `progress`, `status`, `priority`, `mentor_note`, `intern_note`, `created_at`, `updated_at`) VALUES
(6, 4, NULL, 'Xây dựng giao diện Dashboard bằng HTML/CSS', 'not', '2026-10-20', 35, 'in_progress', 'medium', NULL, 'not', '2026-10-20 03:42:31', '2026-10-20 03:42:31'),
(7, 4, 5, 'ok', 'ok', '2026-10-27', 100, 'done', 'high', NULL, '', '2026-10-20 03:46:32', '2026-10-20 03:52:29');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(100) NOT NULL,
  `username` varchar(50) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(100) NOT NULL,
  `role` varchar(50) NOT NULL DEFAULT 'INTERN',
  `status` varchar(20) NOT NULL DEFAULT 'active',
  `avatar` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `users`
--

INSERT INTO `users` (`id`, `email`, `username`, `password`, `name`, `role`, `status`, `avatar`, `phone`, `created_at`) VALUES
(1, 'dtc245200281@ictu.edu.vn', 'admin', '$2b$10$ED0SWcX/mtmKZbfc/tSUTugKJpFnqAfHdKE5UcNcCC1c0phdKeUUe', 'Quản trị viên', 'Admin', 'active', 'image/GiangVien.png', '0901 000 001', '2026-10-13 10:56:25'),
(7, 'duc@duc.com', 'vanduc', '$2b$10$SUw.onhRdQSr4/DWbNBrq.1TBpTx9gkZbOwAQD9VUhiGpM8LaZSBW', 'Tạ Văn Đức', 'HR Manager', 'active', NULL, NULL, '2026-10-20 03:33:18'),
(8, 'manh@manh.com', 'dinhmanh', '$2b$10$MRPfODZjiO5cEO7jt9wvSOpD.7gwvH40iP1M.32ROKSm.D9aamYDK', 'Đinh Tiến Mạnh', 'Mentor', 'active', NULL, NULL, '2026-10-20 03:33:52'),
(9, 'xuyen@xuyen.com', 'nguyenxuyen', '$2b$10$kpQZblawXGKPEQSVs5qlYuVDiArW9HcJJr73SoZFsDtlJmC4xlYT.', 'Nguyễn Trọng Xuyên', 'Thực tập sinh', 'active', NULL, '', '2026-10-20 03:34:26');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `weekly_reports`
--

CREATE TABLE `weekly_reports` (
  `id` int(11) NOT NULL,
  `intern_id` int(11) NOT NULL,
  `mentor_id` int(11) DEFAULT NULL,
  `week_number` int(11) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `tasks_completed` text NOT NULL,
  `issues_faced` text DEFAULT NULL,
  `plans_next_week` text NOT NULL,
  `status` enum('draft','submitted','reviewed') DEFAULT 'submitted',
  `mentor_feedback` text DEFAULT NULL,
  `mentor_rating` int(11) DEFAULT NULL,
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `reviewed_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `weekly_reports`
--

INSERT INTO `weekly_reports` (`id`, `intern_id`, `mentor_id`, `week_number`, `start_date`, `end_date`, `tasks_completed`, `issues_faced`, `plans_next_week`, `status`, `mentor_feedback`, `mentor_rating`, `submitted_at`, `reviewed_at`) VALUES
(5, 4, NULL, 3, '2026-10-20', '2026-10-20', 'aa', 'aa', 'aa', 'reviewed', 'ok', 9, '2026-10-20 03:42:44', '2026-10-20 03:43:19');

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `attendance`
--
ALTER TABLE `attendance`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_intern_date` (`intern_id`,`date`);

--
-- Chỉ mục cho bảng `contracts`
--
ALTER TABLE `contracts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `intern_id` (`intern_id`);

--
-- Chỉ mục cho bảng `departments`
--
ALTER TABLE `departments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Chỉ mục cho bảng `documents`
--
ALTER TABLE `documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `intern_id` (`intern_id`);

--
-- Chỉ mục cho bảng `evaluations`
--
ALTER TABLE `evaluations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `intern_id` (`intern_id`),
  ADD KEY `mentor_id` (`mentor_id`);

--
-- Chỉ mục cho bảng `inapp_notifications`
--
ALTER TABLE `inapp_notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Chỉ mục cho bảng `interns`
--
ALTER TABLE `interns`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Chỉ mục cho bảng `intern_schedules`
--
ALTER TABLE `intern_schedules`
  ADD PRIMARY KEY (`id`),
  ADD KEY `intern_id` (`intern_id`),
  ADD KEY `mentor_id` (`mentor_id`);

--
-- Chỉ mục cho bảng `leave_requests`
--
ALTER TABLE `leave_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `intern_id` (`intern_id`);

--
-- Chỉ mục cho bảng `meetings`
--
ALTER TABLE `meetings`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `mentors`
--
ALTER TABLE `mentors`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `user_id` (`user_id`);

--
-- Chỉ mục cho bảng `programs`
--
ALTER TABLE `programs`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `role` (`role`);

--
-- Chỉ mục cho bảng `system_emails`
--
ALTER TABLE `system_emails`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `system_integrations`
--
ALTER TABLE `system_integrations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `integration_type` (`integration_type`);

--
-- Chỉ mục cho bảng `tasks`
--
ALTER TABLE `tasks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `intern_id` (`intern_id`),
  ADD KEY `mentor_id` (`mentor_id`);

--
-- Chỉ mục cho bảng `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Chỉ mục cho bảng `weekly_reports`
--
ALTER TABLE `weekly_reports`
  ADD PRIMARY KEY (`id`),
  ADD KEY `intern_id` (`intern_id`),
  ADD KEY `mentor_id` (`mentor_id`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `attendance`
--
ALTER TABLE `attendance`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT cho bảng `contracts`
--
ALTER TABLE `contracts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT cho bảng `departments`
--
ALTER TABLE `departments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT cho bảng `documents`
--
ALTER TABLE `documents`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT cho bảng `evaluations`
--
ALTER TABLE `evaluations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT cho bảng `inapp_notifications`
--
ALTER TABLE `inapp_notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT cho bảng `interns`
--
ALTER TABLE `interns`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT cho bảng `intern_schedules`
--
ALTER TABLE `intern_schedules`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `leave_requests`
--
ALTER TABLE `leave_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT cho bảng `meetings`
--
ALTER TABLE `meetings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT cho bảng `mentors`
--
ALTER TABLE `mentors`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT cho bảng `programs`
--
ALTER TABLE `programs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT cho bảng `role_permissions`
--
ALTER TABLE `role_permissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT cho bảng `system_emails`
--
ALTER TABLE `system_emails`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT cho bảng `system_integrations`
--
ALTER TABLE `system_integrations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT cho bảng `tasks`
--
ALTER TABLE `tasks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT cho bảng `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT cho bảng `weekly_reports`
--
ALTER TABLE `weekly_reports`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `attendance`
--
ALTER TABLE `attendance`
  ADD CONSTRAINT `attendance_ibfk_1` FOREIGN KEY (`intern_id`) REFERENCES `interns` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `contracts`
--
ALTER TABLE `contracts`
  ADD CONSTRAINT `contracts_ibfk_1` FOREIGN KEY (`intern_id`) REFERENCES `interns` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `documents`
--
ALTER TABLE `documents`
  ADD CONSTRAINT `documents_ibfk_1` FOREIGN KEY (`intern_id`) REFERENCES `interns` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `evaluations`
--
ALTER TABLE `evaluations`
  ADD CONSTRAINT `evaluations_ibfk_1` FOREIGN KEY (`intern_id`) REFERENCES `interns` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `evaluations_ibfk_2` FOREIGN KEY (`mentor_id`) REFERENCES `mentors` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `inapp_notifications`
--
ALTER TABLE `inapp_notifications`
  ADD CONSTRAINT `inapp_notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `interns`
--
ALTER TABLE `interns`
  ADD CONSTRAINT `interns_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `intern_schedules`
--
ALTER TABLE `intern_schedules`
  ADD CONSTRAINT `intern_schedules_ibfk_1` FOREIGN KEY (`intern_id`) REFERENCES `interns` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `intern_schedules_ibfk_2` FOREIGN KEY (`mentor_id`) REFERENCES `mentors` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `leave_requests`
--
ALTER TABLE `leave_requests`
  ADD CONSTRAINT `leave_requests_ibfk_1` FOREIGN KEY (`intern_id`) REFERENCES `interns` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `mentors`
--
ALTER TABLE `mentors`
  ADD CONSTRAINT `mentors_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `tasks`
--
ALTER TABLE `tasks`
  ADD CONSTRAINT `tasks_ibfk_1` FOREIGN KEY (`intern_id`) REFERENCES `interns` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `tasks_ibfk_2` FOREIGN KEY (`mentor_id`) REFERENCES `mentors` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `weekly_reports`
--
ALTER TABLE `weekly_reports`
  ADD CONSTRAINT `weekly_reports_ibfk_1` FOREIGN KEY (`intern_id`) REFERENCES `interns` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `weekly_reports_ibfk_2` FOREIGN KEY (`mentor_id`) REFERENCES `mentors` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
