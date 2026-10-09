# 🎓 HỆ THỐNG QUẢN LÝ THỰC TẬP SINH (HR & INTERN PORTAL) - CODEGYM
> **Tài liệu bàn giao kỹ thuật & Hướng dẫn phát triển dành cho đội ngũ tiếp nhận**  
> *Phiên bản: 1.1.0 | Ngày cập nhật: 30/09/2026*

---

## 📌 1. TỔNG QUAN DỰ ÁN & TIẾN ĐỘ SPRINT 1

Hệ thống hỗ trợ quản lý quy trình tiếp nhận, sàng lọc, theo dõi và đánh giá thực tập sinh dành cho bộ phận Nhân sự (HR Manager) và Cổng tự phục vụ dành cho Thực tập sinh (Intern).

### 🎯 Tiến độ bàn giao:
* **Nhóm Quản lý hồ sơ thực tập sinh (HR & Intern): ĐÃ HOÀN THÀNH 100% (5/5 User Stories)**
  1. `STT 01`: HR thêm mới hồ sơ thực tập sinh vào cơ sở dữ liệu.
  2. `STT 02`: HR chỉnh sửa thông tin thực tập sinh.
  3. `STT 03`: HR tìm kiếm theo từ khóa và lọc đa chiều theo Trường, Ngành/Phòng ban, Trạng thái.
  4. `STT 04`: Thực tập sinh tải lên CV và Đơn xin thực tập (Hỗ trợ file thật: PDF, DOCX, Ảnh PNG, JPG).
  5. `STT 05`: HR xem trước tài liệu trực tiếp (Preview PDF / Ảnh) và thực hiện Duyệt hoặc Từ chối kèm lý do.
* **Nhóm Quản trị hệ thống (Admin): TẠM HOÃN SANG SPRINT SAU**
  * `STT 39 & 40` (Tạo tài khoản Admin, ma trận phân quyền chi tiết): Chưa thực hiện do chưa có thiết kế giao diện (UI/UX) và đặc tả API trong Hợp đồng ban đầu.

---

## 🏗️ 2. CẤU TRÚC THƯ MỤC DỰ ÁN

```text
CODEGYM/
├── README.md               # Tài liệu bàn giao & hướng dẫn hệ thống
├── API_CONTRACT.md         # Đặc tả hợp đồng API RESTful
├── database.sql            # File kịch bản khởi tạo cơ sở dữ liệu mẫu
│
├── backend/                # Server API (Node.js & Express)
│   ├── config/
│   │   └── db.js           # Kết nối MySQL Connection Pool (mysql2/promise)
│   ├── controllers/
│   │   ├── auth.controller.js    # Logic đăng nhập, xác thực bcrypt & cấp JWT
│   │   └── intern.controller.js  # CRUD thực tập sinh, upload & duyệt tài liệu
│   ├── middleware/
│   │   └── upload.js       # Middleware Multer kiểm soát upload file (tối đa 10MB)
│   ├── routes/
│   │   ├── auth.routes.js        # Route xác thực người dùng
│   │   └── intern.routes.js      # Route nghiệp vụ quản lý thực tập sinh
│   ├── uploads/            # Thư mục lưu trữ vật lý file PDF & Ảnh do user tải lên
│   ├── server.js           # File khởi chạy Express Server (Port 5000)
│   └── package.json        # Dependencies backend
│
└── frontend/               # Giao diện người dùng (HTML5 / CSS3 / Vanilla JS)
    ├── index.html          # Màn hình Đăng nhập (Hỗ trợ chọn vai trò HR / Intern)
    ├── style.css           # Định dạng CSS trang đăng nhập
    ├── script.js           # Xử lý logic đăng nhập, gọi API xác thực
    ├── dashboard.html      # Giao diện Bảng điều khiển quản lý dành cho HR Manager
    ├── dashboard.css       # Định dạng CSS giao diện Dashboard
    ├── dashboard.js        # Logic Dashboard (gọi API MySQL, tìm kiếm, lọc, duyệt hồ sơ)
    ├── intern.html         # Cổng thông tin hồ sơ dành riêng cho Thực tập sinh
    ├── intern-style.css    # Định dạng CSS cổng thực tập sinh
    ├── intern.js           # Logic Cổng thực tập sinh (upload file PDF/Ảnh lên server)
    ├── api.js              # Module tập trung các hàm gọi fetch API lên Backend
    └── image/              # Thư mục chứa hình ảnh icon, banner giao diện
```