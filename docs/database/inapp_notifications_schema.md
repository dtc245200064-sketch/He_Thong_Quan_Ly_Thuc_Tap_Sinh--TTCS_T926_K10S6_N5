# 🗄️ Thiết kế Cơ sở Dữ liệu Module Thông báo (SCRUM-176)

> **Người thiết kế:** Ma Công Đức (`dtc245200136@ictu.edu.vn`)  
> **Jira Subtask:** SCRUM-176 - Thiết kế CSDL thông báo  
> **Công nghệ:** MySQL 8.0 / InnoDB / Charset utf8mb4_unicode_ci

---

## 1. Bảng `inapp_notifications`

Bảng lưu trữ toàn bộ các thông báo gửi đến người dùng trên ứng dụng web.

### Cấu trúc chi tiết:
| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | `INT(11)` | `AUTO_INCREMENT PRIMARY KEY` | Khóa chính tự tăng |
| `user_id` | `INT(11)` | `NULL`, `FOREIGN KEY (users.id)` | ID người nhận (NULL nếu gửi toàn role) |
| `role` | `VARCHAR(50)` | `DEFAULT 'Thực tập sinh'` | Nhóm vai trò nhận thông báo |
| `title` | `VARCHAR(200)` | `NOT NULL` | Tiêu đề thông báo ngắn gọn |
| `content` | `TEXT` | `NOT NULL` | Nội dung chi tiết thông báo |
| `type` | `ENUM` | `('info','warning','success','urgent')` | Phân loại hiển thị giao diện |
| `is_read` | `TINYINT(1)` | `DEFAULT 0` | Trạng thái: 0 = Chưa đọc, 1 = Đã đọc |
| `link` | `VARCHAR(255)` | `DEFAULT NULL` | Điều hướng khi click (chống javascript: XSS) |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Thời gian tạo thông báo |

### Ràng buộc toàn vẹn:
```sql
ALTER TABLE inapp_notifications
  ADD CONSTRAINT inapp_notifications_ibfk_1 
  FOREIGN KEY (user_id) REFERENCES users (id) 
  ON DELETE CASCADE;
```

---

## 2. Bảng `meetings` (Lịch họp & Thông báo meeting)

| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | `INT(11)` | `PRIMARY KEY AUTO_INCREMENT` | Mã cuộc họp |
| `title` | `VARCHAR(255)` | `NOT NULL` | Tiêu đề cuộc họp |
| `meeting_date` | `DATE` | `NOT NULL` | Ngày diễn ra cuộc họp |
| `start_time` | `VARCHAR(10)` | `NOT NULL` | Giờ bắt đầu (HH:mm) |
| `end_time` | `VARCHAR(10)` | `NOT NULL` | Giờ kết thúc (HH:mm > start_time) |
| `location` | `VARCHAR(255)` | `DEFAULT 'Online Meet'` | Phòng họp hoặc nền tảng trực tuyến |
| `link` | `VARCHAR(255)` | `DEFAULT ''` | URL Google Meet / Zoom |
| `host_name` | `VARCHAR(100)` | `DEFAULT 'Mentor / HR'` | Người chủ trì cuộc họp |
| `intern_ids` | `LONGTEXT` | `JSON Array` | Danh sách ID thực tập sinh tham gia |
| `notes` | `TEXT` | `NULL` | Ghi chú dặn dò chuẩn bị |
| `email_sent` | `TINYINT(1)` | `DEFAULT 0` | Cờ xác nhận đã gửi email thành công |
