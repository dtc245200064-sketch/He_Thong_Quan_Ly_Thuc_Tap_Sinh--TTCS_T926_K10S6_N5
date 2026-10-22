# 📊 Quy trình Xử lý Thông báo (Notification Workflow)

> **Phụ trách:** Ma Công Đức (`dtc245200136@ictu.edu.vn`)  
> **Jira:** SCRUM-56 / SCRUM-176  

---

## 1. Luồng tạo thông báo khi có sự kiện hệ thống

```text
[Sự kiện hệ thống]
       │
       ├──> Phân công task mới (Task Controller)
       ├──> Tạo lịch họp tuần (Meeting Controller)
       └──> Duyệt báo cáo tuần (Report Controller)
       │
       ▼
[Notification Service / Controller]
       │
       ├── 1. Kiểm tra quyền & validate dữ liệu đầu vào (B08, B17)
       ├── 2. Lọc link an toàn (loại bỏ javascript: URL)
       ├── 3. INSERT vào bảng inapp_notifications
       └── 4. Gửi email qua SMTP (nếu có yêu cầu gửi mail)
       │
       ▼
[Client (Frontend Intern Portal)]
       │
       ├── Polling hoặc load khi mở tab Thông báo
       ├── Hiển thị số lượng chưa đọc (Badge counter)
       └── Cho phép Đánh dấu đã đọc / Đọc tất cả (B04)
```

---

## 2. Quy tắc phân quyền và bảo mật dữ liệu
1. **Bảo mật truy cập (D1 / SEC-01):** Bắt buộc JWT Token hợp lệ, nếu không có token trả về `401 Unauthorized`.
2. **Quyền riêng tư (B04):** TTS chỉ được xem và đánh dấu đọc thông báo của chính mình (`user_id = req.user.id`).
3. **Phòng chống XSS (B08):** Loại bỏ các liên kết nguy hiểm như `javascript:alert(1)` trong thuộc tính link.
