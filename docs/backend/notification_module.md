# 🔔 Module Thông báo Ứng dụng (In-app Notification Backend)

> **Dự án:** Hệ thống Quản lý Thực tập sinh CodeGym (Fullstack HR & Intern Portal)  
> **Người thực hiện:** Ma Công Đức (`dtc245200136@ictu.edu.vn`)  
> **Jira User Story:** SCRUM-56 - *Là thực tập sinh, tôi muốn nhận thông báo trên ứng dụng để không bỏ lỡ lịch trình*  
> **Jira Subtask:** SCRUM-176 - *Thiết kế CSDL & Backend API Thông báo*

---

## 1. Tổng quan Module
Module Thông báo chịu trách nhiệm cung cấp thông tin cập nhật theo thời gian thực hoặc định kỳ tới người dùng (Thực tập sinh, Mentor, HR Manager), bao gồm:
1. **Thông báo hệ thống:** Tin nhắn chào mừng, phân công nhiệm vụ mới, kết quả duyệt báo cáo.
2. **Thông báo lịch họp:** Lịch phỏng vấn, họp định kỳ tuần kèm liên kết phòng họp (Google Meet / Zoom).
3. **Quản lý trạng thái:** Đánh dấu đã đọc từng thông báo (`is_read = true`) hoặc toàn bộ thông báo của người dùng.

---

## 2. Cấu trúc Source Code
```text
backend/
├── controllers/
│   └── notification.controller.js   # Xử lý logic nghiệp vụ, bảo mật & truy vấn DB
├── routes/
│   └── notification.routes.js       # Định tuyến endpoint & middleware xác thực
├── services/
│   └── email.service.js             # Dịch vụ gửi email thông báo qua SMTP
└── config/
    └── db.js                        # Pool kết nối MySQL 8.0
```

---

## 3. Các hàm Controller chính
* `getInAppNotifications`: Trả về danh sách thông báo phân quyền theo `req.user.id` và `req.user.role`.
* `markAsRead`: Cập nhật trạng thái đã đọc cho 1 thông báo cụ thể.
* `markAllAsRead`: Cập nhật toàn bộ thông báo của người dùng hiện tại (bảo mật B04).
* `createNotification`: Tạo thông báo mới (lọc link chống XSS - B08).
* `createMeeting`: Tạo lịch họp, gửi email qua SMTP và tự động tạo thông báo in-app.
* `getMeetings`: Lấy danh sách lịch họp, TTS chỉ thấy lịch mình tham gia (B17).
