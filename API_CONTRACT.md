# TÀI LIỆU HỢP ĐỒNG API (API CONTRACT)
## Module: Quản lý thực tập sinh (HR Portal)

- **Base URL:** `http://localhost:5000/api`
- **Định dạng dữ liệu:** `Content-Type: application/json`
- **Chuẩn xác thực (Auth Header):** `Authorization: Bearer <TOKEN>`

---

## 1. Danh sách Endpoints RESTful

| Phương thức | Endpoint | Chức năng | Phụ trách |
|---|---|---|---|
| **POST** | `/auth/login` | Đăng nhập tài khoản HR Manager | Auth |
| **GET** | `/interns` | Lấy danh sách thực tập sinh (có search & filter) | Intern |
| **POST** | `/interns` | Thêm mới một thực tập sinh | Intern |
| **PUT** | `/interns/:id` | Cập nhật thông tin thực tập sinh | Intern |
| **GET** | `/interns/:id/documents` | Xem chi tiết hồ sơ & tài liệu đính kèm | Intern |
| **POST** | `/interns/:id/documents` | Tải lên file CV / Đơn xin thực tập (multipart) | Intern |
| **DELETE**| `/interns/:id/documents/:docType` | Xóa tài liệu khỏi hệ thống và server | Intern |
| **PATCH** | `/interns/:id/documents/status` | Duyệt / Từ chối hồ sơ tài liệu | Intern |

---

## 2. Chi tiết từng API Endpoint

### 2.1. Đăng nhập HR Manager
- **Endpoint:** `POST /api/auth/login`
- **Mô tả:** Kiểm tra email/mật khẩu và trả về JWT Token cùng thông tin tài khoản.
- **Request Body mẫu:**
```json
{
  "email": "hr@company.vn",
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
    "id": 2,
    "name": "Nguyễn Thị Hoa",
    "email": "hr@company.vn",
    "role": "HR Manager"
  }
}
```
- **Response 401 Unauthorized:**
```json
{
  "success": false,
  "message": "Email hoặc mật khẩu không chính xác!"
}
```

---

### 2.2. Lấy danh sách thực tập sinh
- **Endpoint:** `GET /api/interns`
- **Mô tả:** Lấy danh sách thực tập sinh, hỗ trợ tìm kiếm theo từ khóa và lọc theo trường/phòng ban.
- **Query Parameters (Tùy chọn):**
  - `search`: Từ khóa tìm kiếm theo tên, trường, ngành (ví dụ: `?search=Khoa`)
  - `school`: Lọc theo trường (ví dụ: `?school=ĐH Bách Khoa HN`)
  - `dept`: Lọc theo phòng ban (ví dụ: `?dept=Kỹ thuật phần mềm`)
- **Response 200 OK:**
```json
{
  "success": true,
  "total": 7,
  "data": [
    {
      "id": 1,
      "name": "Trần Minh Khoa",
      "major": "CNTT",
      "school": "ĐH Bách Khoa HN",
      "dept": "Kỹ thuật phần mềm",
      "mentor": "Anh Tuấn",
      "time": "01/07/2026 - 30/09/2026",
      "status": "Đang thực tập"
    }
  ]
}
```

---

### 2.3. Thêm mới thực tập sinh
- **Endpoint:** `POST /api/interns`
- **Mô tả:** Nhận thông tin từ form Thêm mới và lưu vào cơ sở dữ liệu.
- **Request Body mẫu:**
```json
{
  "name": "Nguyễn Văn A",
  "major": "CNTT",
  "school": "ĐH Bách Khoa HN",
  "dept": "Kỹ thuật phần mềm",
  "mentor": "Anh Tuấn",
  "startDate": "2026-07-01",
  "endDate": "2026-09-30",
  "status": "Đang thực tập"
}
```
- **Response 201 Created:**
```json
{
  "success": true,
  "message": "Thêm thực tập sinh mới thành công!",
  "data": {
    "id": 8,
    "name": "Nguyễn Văn A",
    "major": "CNTT",
    "school": "ĐH Bách Khoa HN",
    "dept": "Kỹ thuật phần mềm",
    "mentor": "Anh Tuấn",
    "time": "01/07/2026 - 30/09/2026",
    "status": "Đang thực tập"
  }
}
```

---

### 2.4. Chỉnh sửa thông tin thực tập sinh
- **Endpoint:** `PUT /api/interns/:id`
- **Mô tả:** Cập nhật thông tin chi tiết của thực tập sinh theo `id`.
- **Request Body mẫu:**
```json
{
  "name": "Trần Minh Khoa",
  "major": "CNTT",
  "school": "ĐH Bách Khoa HN",
  "dept": "Kỹ thuật phần mềm",
  "mentor": "Anh Tuấn",
  "time": "01/07/2026 - 30/09/2026",
  "status": "Đang thực tập"
}
```
- **Response 200 OK:**
```json
{
  "success": true,
  "message": "Cập nhật hồ sơ thành công!",
  "data": {
    "id": 1,
    "name": "Trần Minh Khoa",
    "major": "CNTT",
    "school": "ĐH Bách Khoa HN",
    "dept": "Kỹ thuật phần mềm",
    "mentor": "Anh Tuấn",
    "time": "01/07/2026 - 30/09/2026",
    "status": "Đang thực tập"
  }
}
```

---

### 2.5. Xem chi tiết hồ sơ & tài liệu đính kèm
- **Endpoint:** `GET /api/interns/:id/documents`
- **Mô tả:** Lấy thông tin ứng viên và danh sách file tài liệu (CV, Bảng điểm) để hiển thị trong Modal Xem & Duyệt.
- **Response 200 OK:**
```json
{
  "success": true,
  "data": {
    "internId": 1,
    "internName": "Trần Minh Khoa",
    "school": "ĐH Bách Khoa HN",
    "major": "CNTT",
    "dept": "Kỹ thuật phần mềm",
    "mentor": "Anh Tuấn",
    "status": "Đang thực tập",
    "documents": [
      {
        "id": "doc_01",
        "name": "CV_BanGoc.pdf",
        "size": "1.4 MB",
        "uploadedAt": "2026-06-25",
        "fileUrl": "http://localhost:5000/uploads/cv_tranminhkhoa.pdf",
        "reviewStatus": "pending"
      }
    ]
  }
}
```

---

### 2.6. Duyệt / Từ chối hồ sơ tài liệu
- **Endpoint:** `PATCH /api/interns/:id/documents/status`
- **Mô tả:** HR duyệt (approve) hoặc từ chối (reject) hồ sơ tài liệu của thực tập sinh.
- **Request Body mẫu:**
```json
{
  "status": "approved", // hoặc "rejected"
  "note": "Hồ sơ hợp lệ, đủ điều kiện thực tập"
}
```
- **Response 200 OK:**
```json
{
  "success": true,
  "message": "Cập nhật trạng thái duyệt hồ sơ thành công!",
  "data": {
    "internId": 1,
    "reviewStatus": "approved",
    "status": "Đang thực tập",
    "updatedAt": "2026-09-26T09:40:00.000Z"
  }
}
```

---

## 3. Module Quản lý nhiệm vụ & Cập nhật tiến độ (SCRUM-36 / SCRUM-198 - Mã Công Đức)

### 3.1. Cập nhật tiến độ nhiệm vụ (Dành cho Thực tập sinh)
- **Endpoint:** `PUT /api/tasks/:id/progress`
- **Mô tả:** Thực tập sinh cập nhật phần trăm tiến độ, ngày cập nhật và mô tả nội dung thực hiện để mentor theo dõi.
- **Request Body mẫu:**
```json
{
  "progress": 75,
  "progress_date": "2026-10-14",
  "description": "Đã hoàn thành thiết kế cơ sở dữ liệu và tích hợp API",
  "intern_note": "Gặp khó khăn ở cấu hình CORS nhưng đã giải quyết xong"
}
```
- **Response 200 OK:**
```json
{
  "success": true,
  "message": "Cập nhật tiến độ nhiệm vụ thành công!"
}
```

---

### 3.2. Gửi phản hồi tiến độ nhiệm vụ (Dành cho Mentor)
- **Endpoint:** `PUT /api/tasks/:id/feedback`
- **Mô tả:** Mentor gửi nhận xét, chỉ dẫn và nội dung phản hồi về tiến độ công việc của thực tập sinh.
- **Request Body mẫu:**
```json
{
  "mentor_feedback": "Tiến độ rất tốt, đã kiểm tra code và chạy ổn định. Em tiếp tục làm module tiếp theo nhé!"
}
```
- **Response 200 OK:**
```json
{
  "success": true,
  "message": "Gửi nội dung phản hồi thành công!"
}
```

