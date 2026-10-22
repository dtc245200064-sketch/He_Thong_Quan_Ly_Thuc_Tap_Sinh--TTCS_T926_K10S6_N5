# 📘 TÀI LIỆU HỢP ĐỒNG API (API CONTRACT)
## Hệ Thống Quản Lý Thực Tập Sinh CodeGym (Fullstack HR & Intern Portal)

- **Phiên bản:** `2.0.0` (Sprint 1, 2, 3 hoàn chỉnh & bảo mật)
- **Base URL:** `http://localhost:5000/api`
- **Định dạng dữ liệu:** `Content-Type: application/json` (hoặc `multipart/form-data` khi upload tài liệu)
- **Tiêu chuẩn xác thực:** `Authorization: Bearer <JWT_TOKEN>`

---

## 1. NGUYÊN TẮC BẢO MẬT & MÃ LỖI TOÀN HỆ THỐNG

### 1.1. Chuẩn Token & Quyền Hạn
- Mọi endpoint API nghiệp vụ (ngoại trừ `/api/auth/login` và `/api/health`) bắt buộc phải có header `Authorization: Bearer <TOKEN>`.
- Token được ký mã hóa bằng thuật toán `HS256` với `JWT_SECRET` được cấu hình từ biến môi trường.
- Ma trận phân quyền thực tế được lưu và kiểm tra động từ bảng `role_permissions` trong MySQL cho các vai trò `Admin`, `HR Manager`, `Mentor`, `Thực tập sinh`.

### 1.2. Định dạng phản hồi lỗi chuẩn (Standard Error Responses)
- **400 Bad Request:** Lỗi validation dữ liệu đầu vào (thiếu trường, sai định dạng, ngày không hợp lệ...).
  ```json
  {
    "success": false,
    "message": "Thông điệp mô tả lỗi chi tiết"
  }
  ```
- **401 Unauthorized:** Chưa đăng nhập hoặc JWT Token không hợp lệ / hết hạn.
  ```json
  {
    "success": false,
    "code": "UNAUTHORIZED",
    "message": "Yêu cầu đăng nhập để truy cập tài nguyên này!"
  }
  ```
- **403 Forbidden:** Không đủ quyền hạn hoặc vi phạm kiểm soát truy cập sở hữu IDOR.
  ```json
  {
    "success": false,
    "code": "PERMISSION_DENIED",
    "message": "Bạn không có quyền thực hiện thao tác này!"
  }
  ```
- **404 Not Found:** Endpoint hoặc tài nguyên truy vấn không tồn tại.
  ```json
  {
    "success": false,
    "code": "NOT_FOUND",
    "message": "Không tìm thấy endpoint API hoặc bản ghi yêu cầu!"
  }
  ```

---

## 2. BẢNG TỔNG HỢP DANH MỤC API THEO SPRINT

| Phân hệ | Phương thức | Endpoint | Chức năng nghiệp vụ | Quyền truy cập |
|---|---|---|---|---|
| **Auth** | `POST` | `/api/auth/login` | Đăng nhập tài khoản hệ thống | Công khai |
| **Auth** | `POST` | `/api/auth/register` | Đăng ký tài khoản Thực tập sinh trực tuyến | Công khai |
| **Auth** | `GET` | `/api/auth/me` | Lấy profile và permissions người dùng | Authenticated |
| **Admin** | `GET` | `/api/admin/users` | Xem danh sách người dùng hệ thống | Admin |
| **Admin** | `POST` | `/api/admin/users` | Tạo mới tài khoản và phân quyền | Admin |
| **Admin** | `PUT` | `/api/admin/users/:id` | Cập nhật thông tin / trạng thái user | Admin |
| **Admin** | `DELETE`| `/api/admin/users/:id` | Xóa tài khoản người dùng | Admin |
| **Admin** | `GET` | `/api/admin/permissions` | Xem ma trận phân quyền hệ thống | Admin, HR |
| **Admin** | `PUT` | `/api/admin/permissions/:role` | Cập nhật ma trận quyền theo role | Admin |
| **Interns** | `GET` | `/api/interns` | Danh sách thực tập sinh (lọc, tìm kiếm) | HR, Mentor, TTS (own) |
| **Interns** | `POST` | `/api/interns` | Thêm mới hồ sơ thực tập sinh | HR Manager |
| **Interns** | `PUT` | `/api/interns/:id` | Cập nhật hồ sơ thực tập sinh | HR, TTS (own) |
| **Interns** | `DELETE`| `/api/interns/:id` | Xóa thực tập sinh và dọn dẹp file | HR Manager |
| **Interns** | `GET` | `/api/interns/:id/documents` | Xem chi tiết hồ sơ, tài liệu & hợp đồng | HR, TTS (own) |
| **Interns** | `POST` | `/api/interns/:id/documents` | Tải lên file CV / Đơn xin thực tập | HR, TTS (own) |
| **Interns** | `DELETE`| `/api/interns/:id/documents/:docType` | Xóa tài liệu CV/Đơn xin thực tập | HR, TTS (own) |
| **Interns** | `PATCH` | `/api/interns/:id/documents/status` | Duyệt / từ chối hồ sơ & gửi email | HR Manager |
| **Contracts** | `GET` | `/api/contracts` | Lấy danh sách hợp đồng thực tập | HR, Mentor, TTS (own) |
| **Contracts** | `POST` | `/api/contracts` | Tạo hợp đồng mới và tải lên bản PDF | HR Manager |
| **Contracts** | `PATCH` | `/api/contracts/:id/confirm` | TTS xác nhận ký hoặc từ chối hợp đồng | TTS (own) |
| **Contracts** | `DELETE`| `/api/contracts/:id` | Xóa hợp đồng theo ID | HR Manager |
| **Programs** | `GET` | `/api/programs` | Danh sách chương trình đào tạo thực tập | Authenticated |
| **Programs** | `POST` | `/api/programs` | Tạo mới chương trình (có lịch schedule) | HR Manager |
| **Programs** | `PUT` | `/api/programs/:id` | Cập nhật chương trình thực tập | HR Manager |
| **Programs** | `DELETE`| `/api/programs/:id` | Xóa chương trình thực tập | HR Manager |
| **Departments**| `GET` | `/api/departments` | Danh sách phòng ban tiếp nhận TTS | Authenticated |
| **Departments**| `POST` | `/api/departments` | Thêm phòng ban mới | HR Manager |
| **Attendance** | `GET` | `/api/attendance` | Lấy bảng chấm công thực tập | HR, Mentor, TTS (own) |
| **Attendance** | `POST` | `/api/attendance/check-in-out` | Check-in / Check-out theo giờ Server | TTS (own) |
| **Leaves** | `GET` | `/api/leaves` | Danh sách đơn xin nghỉ phép | HR, Mentor, TTS (own) |
| **Leaves** | `POST` | `/api/leaves` | Nộp đơn xin nghỉ phép (end >= start) | TTS (own) |
| **Leaves** | `PATCH` | `/api/leaves/:id/review` | Duyệt / Từ chối đơn xin nghỉ phép | HR, Mentor |
| **Schedules** | `GET` | `/api/schedules` | Lấy lịch làm việc / đào tạo theo khoảng ngày | HR, Mentor, TTS (own) |
| **Schedules** | `POST` | `/api/schedules` | Tạo lịch làm việc / đào tạo cho TTS | HR, Mentor |
| **Mentors** | `GET` | `/api/mentors` | Danh sách Mentor & số lượng TTS kèm cặp | HR Manager |
| **Mentors** | `POST` | `/api/mentors/assign` | Phân công Mentor cho TTS (kiểm tra tải) | HR Manager |
| **Tasks** | `GET` | `/api/tasks` | Danh sách nhiệm vụ dự án giao cho TTS | HR, Mentor, TTS (own) |
| **Tasks** | `POST` | `/api/tasks` | Giao nhiệm vụ mới cho thực tập sinh | Mentor, HR |
| **Tasks** | `PATCH` | `/api/tasks/:id/progress` | Cập nhật tiến độ nhiệm vụ (%) | TTS (own), Mentor |
| **Reports** | `GET` | `/api/reports/weekly` | Xem danh sách báo cáo tuần | HR, Mentor, TTS (own) |
| **Reports** | `POST` | `/api/reports/weekly` | Nộp báo cáo tuần mới | TTS (own) |
| **Reports** | `PUT` | `/api/reports/weekly/:id` | Chỉnh sửa báo cáo tuần (chưa duyệt) | TTS (own) |
| **Reports** | `PUT` | `/api/reports/weekly/:id/feedback` | Mentor nhận xét & đánh giá báo cáo tuần | Mentor, HR |
| **Evaluations**| `GET` | `/api/evaluations` | Xem bảng đánh giá kết quả thực tập | HR, Mentor, TTS (own) |
| **Evaluations**| `POST` | `/api/evaluations` | Đánh giá điểm (0-10) và xếp loại | Mentor, HR |
| **Notifications**| `GET` | `/api/notifications` | Danh sách thông báo trong ứng dụng | TTS (own), Authenticated |
| **Notifications**| `PUT` | `/api/notifications/read-all` | Đánh dấu đã đọc tất cả thông báo của mình | TTS (own), Authenticated |
| **Notifications**| `POST` | `/api/notifications/meetings` | Tạo lịch họp và gửi email thông báo | HR, Mentor |
| **Integrations**| `GET` | `/api/integrations` | Danh sách cấu hình tích hợp (che key) | Admin |
| **Integrations**| `POST` | `/api/integrations/sync/hrm` | Mô phỏng đồng bộ dữ liệu hệ thống HRM | Admin |
| **Statistics** | `GET` | `/api/reports/statistics/demographics` | Thống kê số liệu trường, ngành, phòng ban | HR Manager, Admin |
| **Statistics** | `GET` | `/api/reports/statistics/completion` | Thống kê tỷ lệ hoàn thành thực tập | HR Manager, Admin |
| **Statistics** | `GET` | `/api/reports/statistics/departments` | Thống kê phân bổ theo phòng ban | HR Manager, Admin |

---

## 3. CHI TIẾT CÁC ENDPOINT QUAN TRỌNG ĐÃ ĐƯỢC CHUẨN HÓA

### 3.1b. Đăng ký tài khoản Thực tập sinh trực tuyến: `POST /api/auth/register`
- **Quyền truy cập:** Công khai (áp dụng Rate Limiter chống brute-force)
- **Request Body:**
  ```json
  {
    "name": "Nguyễn Văn A",
    "email": "nguyenvana@gmail.com",
    "password": "Password123",
    "phone": "0901234567"
  }
  ```
- **Quy tắc nghiệp vụ:** Bắt buộc họ tên, email đúng định dạng, mật khẩu tối thiểu 6 ký tự. Kiểm tra trùng email (409). Luôn gán vai trò `Thực tập sinh` (bỏ qua mọi role client gửi). Tự động tạo bản ghi trong bảng `interns` với trạng thái ban đầu `Chưa hoàn thiện`.
- **Response 201 Created:**
  ```json
  {
    "success": true,
    "message": "Đăng ký tài khoản Thực tập sinh thành công!",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 15,
      "internId": 12,
      "name": "Nguyễn Văn A",
      "email": "nguyenvana@gmail.com",
      "username": "nguyenvana_1234",
      "phone": "0901234567",
      "role": "Thực tập sinh"
    }
  }
  ```

### 3.1. Đăng nhập hệ thống: `POST /api/auth/login`
- **Request Body:**
  ```json
  {
    "username": "admin", // hoặc email
    "password": "password123"
  }
  ```
- **Response 200 OK:**
  ```json
  {
    "success": true,
    "message": "Đăng nhập thành công!",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "Quản trị viên",
      "email": "dtc245200281@ictu.edu.vn",
      "username": "admin",
      "role": "Admin",
      "internId": null,
      "mentorId": null
    },
    "permissions": { ... }
  }
  ```

### 3.2. Điểm danh: `POST /api/attendance/check-in-out`
- **Quy tắc:** Server tự động sinh ngày và giờ hiện tại theo chuẩn múi giờ Việt Nam. Chặn hoàn toàn việc truyền ngày giả mạo từ Client.
- **Request Body:**
  ```json
  {
    "intern_id": 1,
    "action": "checkin" // hoặc "checkout"
  }
  ```
- **Response 200 OK:**
  ```json
  {
    "success": true,
    "message": "Check-in thành công lúc 08:35:12!",
    "data": {
      "internId": 1,
      "date": "2026-10-20",
      "checkIn": "08:35:12",
      "status": "present"
    }
  }
  ```

### 3.3. Duyệt hồ sơ: `PATCH /api/interns/:id/documents/status`
- **Quy tắc:** Bắt buộc `status` là `approved` hoặc `rejected`. Nếu từ chối, bắt buộc cung cấp `rejectReason` hoặc `note`. Hệ thống tự động gửi email thông báo kết quả và trả về `emailSent: true/false`.
- **Request Body:**
  ```json
  {
    "status": "rejected",
    "rejectReason": "Bảng điểm chưa công chứng theo quy định",
    "note": "Vui lòng cập nhật lại trước ngày 25/10/2026"
  }
  ```

### 3.4. Tải lên tài liệu: `POST /api/interns/:id/documents`
- **Content-Type:** `multipart/form-data`
- **Header:** `Authorization: Bearer <TOKEN>`
- **Fields:**
  - `file`: Tệp tin PDF, PNG, JPG, DOCX, DOC (Tối đa 5MB, kiểm tra Magic Bytes ở tầng nhị phân).
  - `docType`: `CV` | `APPLICATION_LETTER` | `OTHER`
- **Response 201 Created:**
  ```json
  {
    "success": true,
    "message": "Tải lên tài liệu thành công!",
    "data": {
      "id": 12,
      "internId": 1,
      "name": "CV_NguyenVanA.pdf",
      "type": "CV",
      "fileUrl": "/uploads/CV_NguyenVanA-1729412345.pdf",
      "size": "1.2 MB",
      "reviewStatus": "pending"
    }
  }
  ```

---

### 3.4. Quản lý thông báo ứng dụng: `/api/notifications`
* **Người phụ trách:** Ma Công Đức (`dtc245200136@ictu.edu.vn`)
* **Jira Ticket:** SCRUM-56 / SCRUM-176 (Thiết kế CSDL & Backend API Thông báo)

#### A. Lấy danh sách thông báo: `GET /api/notifications`
- **Quyền truy cập:** Đã xác thực (JWT Token).
- **Quy tắc bảo mật:** TTS chỉ xem được thông báo gửi riêng cho `user_id` của mình hoặc thông báo chung cho vai trò `Thực tập sinh`.
- **Response Success (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 15,
        "user_id": 9,
        "role": "Thực tập sinh",
        "title": "Lịch họp: Review Sprint 3",
        "content": "Cuộc họp diễn ra lúc 09:00 - 10:30 ngày 2026-10-25 tại Văn phòng CodeGym",
        "type": "info",
        "is_read": 0,
        "link": "intern.html#schedule",
        "created_at": "2026-10-22T08:00:00.000Z"
      }
    ]
  }
  ```

#### B. Đánh dấu đã đọc tất cả: `PUT /api/notifications/read-all`
- **Quyền truy cập:** TTS / Authenticated.
- **Quy tắc bảo mật (B04):** Chỉ cập nhật thông báo của chính `req.user.id`, không ảnh hưởng người dùng khác.
- **Response Success (200 OK):**
  ```json
  {
    "success": true,
    "message": "Đã đánh dấu tất cả thông báo của bạn là đã đọc"
  }
  ```

#### C. Tạo lịch họp & Gửi email thông báo: `POST /api/notifications/meetings`
- **Quyền truy cập:** HR Manager, Mentor.
- **Validation (B17 & S3-29):** Bắt buộc `end_time > start_time`, lọc link chống XSS. Tự động gửi email qua SMTP và tạo in-app notification.
- **Request Body:**
  ```json
  {
    "title": "Phỏng vấn tiến độ thực tập",
    "meeting_date": "2026-10-25",
    "start_time": "09:00",
    "end_time": "10:30",
    "location": "Phòng họp A3 - CodeGym",
    "link": "https://meet.google.com/xyz-abcd-efg",
    "intern_ids": [9, 10],
    "notes": "Mang theo laptop và báo cáo tuần"
  }
  ```
- **Response Success (201 Created):**
  ```json
  {
    "success": true,
    "message": "Tạo lịch họp thành công và đã gửi email thông báo tự động cho thực tập sinh!",
    "meetingId": 25,
    "email_sent": true,
    "emailsSentCount": 2
  }
  ```

