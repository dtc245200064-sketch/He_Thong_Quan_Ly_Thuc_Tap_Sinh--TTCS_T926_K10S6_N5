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

---

## 🛠️ 3. CÔNG NGHỆ SỬ DỤNG (TECH STACK)

* **Frontend:** HTML5, CSS3, JavaScript thuần (ES6+), Bootstrap Icons / FontAwesome. Hoàn toàn không phụ thuộc framework nặng, tải trang cực nhanh.
* **Backend:** Node.js v18+, Express.js, CORS, Multer (xử lý multipart/form-data upload file).
* **Bảo mật:** `bcryptjs` (băm mật khẩu một chiều), `jsonwebtoken` (JWT Token xác thực phiên).
* **Cơ sở dữ liệu:** MySQL 8.x / MariaDB (chạy qua XAMPP trên cổng 3306), kết nối qua thư viện `mysql2/promise`.

---

## 🗄️ 4. KIẾN TRÚC CƠ SỞ DỮ LIỆU (DATABASE SCHEMA)

Cơ sở dữ liệu tên là: `codegym` (Bảng mã: `utf8mb4_unicode_ci`).

### 1. Bảng `users` (Tài khoản người dùng)
* `id` (INT, PK, Auto Increment)
* `email` (VARCHAR 100, UNIQUE, NOT NULL)
* `password` (VARCHAR 255, NOT NULL - lưu mật khẩu đã hash bcrypt)
* `name` (VARCHAR 100, NOT NULL)
* `role` (ENUM: `'HR'`, `'INTERN'`, `'ADMIN'`)
* `avatar` (VARCHAR 255)
* `phone` (VARCHAR 20)
* `created_at` (TIMESTAMP)

### 2. Bảng `interns` (Hồ sơ thực tập sinh & ứng viên)
* `id` (INT, PK, Auto Increment)
* `user_id` (INT, FK trỏ tới `users.id`, ON DELETE SET NULL)
* `name`, `email`, `phone`, `school`, `major`, `dept`, `mentor`, `position`
* `start_date`, `end_date` (DATE)
* `gpa` (VARCHAR 20)
* `status` (VARCHAR 50: `'Chờ xét duyệt'`, `'Đang thực tập'`, `'Hoàn thành'`, `'Đã từ chối'`)
* `reject_reason`, `reject_note` (Lưu lý do từ chối nếu có)
* `skills`, `bio`, `projects` (TEXT)
* `created_at`, `updated_at` (TIMESTAMP)

### 3. Bảng `documents` (Tài liệu CV, Đơn xin thực tập)
* `id` (INT, PK, Auto Increment)
* `intern_id` (INT, FK trỏ tới `interns.id`, ON DELETE CASCADE)
* `doc_name` (VARCHAR 255 - tên file gốc)
* `doc_type` (ENUM: `'CV'`, `'APPLICATION_LETTER'`, `'OTHER'`)
* `file_url` (VARCHAR 255 - đường dẫn tĩnh, ví dụ: `/uploads/cv_123.pdf`)
* `file_size` (VARCHAR 50)
* `review_status` (ENUM: `'pending'`, `'approved'`, `'rejected'`)
* `uploaded_at` (TIMESTAMP)

> 💡 **Quy tắc lưu trữ tài liệu:** File vật lý được lưu trực tiếp tại thư mục `backend/uploads/`. Cơ sở dữ liệu chỉ lưu chuỗi đường dẫn `file_url` nhằm tối ưu hiệu năng và dung lượng DB.

---

## 📡 5. DANH SÁCH RESTFUL API ENDPOINTS

Base URL: `http://localhost:5000/api`

| Phương thức | Endpoint | Chức năng | Body / Params |
| :---: | :--- | :--- | :--- |
| **POST** | `/auth/login` | Đăng nhập hệ thống (cấp JWT token) | `{ email, password }` |
| **GET** | `/interns` | Lấy danh sách TTS (hỗ trợ search, filter) | `?search=&school=&dept=&status=` |
| **POST** | `/interns` | Thêm mới một hồ sơ thực tập sinh | `{ name, school, major, dept, ... }` |
| **PUT** | `/interns/:id` | Cập nhật thông tin thực tập sinh | `{ name, school, ... }` |
| **DELETE**| `/interns/:id` | Xóa thực tập sinh khỏi hệ thống | `:id` |
| **GET** | `/interns/:id/documents` | Lấy danh sách tài liệu của TTS | `:id` |
| **POST** | `/interns/:id/documents` | Tải lên file CV / Đơn (multipart/form-data) | Form: `file`, `docType` |
| **DELETE**| `/interns/:id/documents/:docType` | Xóa tài liệu khỏi hệ thống & ổ đĩa server | `:id`, `:docType` |
| **PATCH**| `/interns/:id/documents/status` | Duyệt / Từ chối hồ sơ tài liệu | `{ status, note, rejectReason }` |
| **GET** | `/health` | Kiểm tra tình trạng hoạt động Backend | N/A |

---

## 🚀 6. HƯỚNG DẪN KHỞI CHẠY HỆ THỐNG CHI TIẾT

### Bước 1: Khởi động & Thiết lập MySQL Database (Bằng XAMPP)

Hệ thống sử dụng MySQL làm cơ sở dữ liệu chính. Có 2 cách để thiết lập và khởi chạy MySQL:

#### Cách 1: Sử dụng giao diện đồ họa XAMPP & phpMyAdmin (Khuyên dùng)
1. **Khởi động dịch vụ:**
   * Mở ứng dụng **XAMPP Control Panel**.
   * Nhấn nút **Start** ở cả 2 module:
     * `Apache` (Cổng 80 / 443) -> Chuyển sang nền màu xanh lá.
     * `MySQL` (Cổng 3306) -> Chuyển sang nền màu xanh lá.
2. **Truy cập trang quản trị phpMyAdmin:**
   * Mở trình duyệt web và truy cập địa chỉ: [http://localhost/phpmyadmin](http://localhost/phpmyadmin) (hoặc bấm nút **Admin** cạnh nút Start của MySQL trong XAMPP).
3. **Tạo Cơ sở dữ liệu:**
   * Nhìn vào cột menu bên trái, bấm vào nút **Mới (New)** có biểu tượng dấu cộng `+`.
   * Tại ô **Tên cơ sở dữ liệu (Database name)**: Nhập chính xác tên: `codegym`.
   * Tại ô **Bảng mã (Collation)** bên cạnh: Chọn `utf8mb4_unicode_ci` (hoặc `utf8mb4_general_ci`) để lưu tiếng Việt có dấu chuẩn xác.
   * Nhấn nút **Tạo (Create)**.
4. **Nạp cấu trúc bảng và dữ liệu (Import SQL):**
   * Nhấp chuột chọn database `codegym` vừa tạo ở cột bên trái.
   * Trên thanh menu ngang phía trên, bấm vào tab **Nhập (Import)**.
   * Tại mục *Tệp cần nhập (File to import)*: Bấm nút **Chọn tệp (Choose File)** -> tìm và chọn file `.sql` của dự án (ví dụ `database.sql`).
   * Cuộn xuống cuối trang và bấm nút **Nhập (Import / Thực hiện)**.
   * Sau khi hoàn tất, bạn sẽ thấy 3 bảng: `users`, `interns`, `documents` xuất hiện đầy đủ trong database `codegym`.

#### Cách 2: Chạy MySQL bằng Dòng lệnh (Terminal / Command Prompt)
Dành cho lập trình viên quen thao tác terminal:
```bash
# 1. Đăng nhập vào MySQL CLI của XAMPP
C:\xampp\mysql\bin\mysql.exe -u root

# 2. Tạo database trong MySQL shell
CREATE DATABASE IF NOT EXISTS codegym CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;

# 3. Import file SQL từ thư mục dự án
# Dành cho Command Prompt (CMD):
C:\xampp\mysql\bin\mysql.exe -u root codegym < database.sql

# Dành cho PowerShell:
Get-Content -Raw -Encoding UTF8 database.sql | & "C:\xampp\mysql\bin\mysql.exe" -u root --default-character-set=utf8mb4 codegym
```

#### ⚙️ Cấu hình thông số kết nối Database (Nếu cần chỉnh sửa):
Thông tin kết nối MySQL được đặt tập trung tại file: `backend/config/db.js`:
* **Host:** `localhost`
* **Port:** `3306` (Cổng mặc định của MySQL)
* **User:** `root` (User mặc định của XAMPP)
* **Password:** `""` (Mặc định XAMPP không đặt mật khẩu)
* **Database:** `codegym`

> ⚠️ **Xử lý sự cố thường gặp với MySQL:**
> * **Lỗi cổng 3306 bị chiếm (Port 3306 in use):** Nếu MySQL trong XAMPP báo đỏ do trùng cổng với một bản MySQL khác đã cài trên máy:
>   * Mở `services.msc` trên Windows -> tìm service `MySQL` hoặc `MySQL80` độc lập -> bấm **Stop**.
>   * Hoặc trong XAMPP, bấm nút **Config** ở dòng MySQL -> chọn `my.ini` -> đổi cổng `3306` thành `3307`, sau đó cập nhật `DB_PORT=3307` trong file `backend/config/db.js`.
> * **Lỗi quyền truy cập (Access denied for user 'root'):** Nếu XAMPP của bạn có đặt mật khẩu cho root, hãy cập nhật mật khẩu tương ứng vào thuộc tính `password` trong file `backend/config/db.js`.

---

### Bước 2: Khởi chạy Backend API (Port 5000)
> ⚠️ **LƯU Ý:** Hệ thống yêu cầu mở **2 cửa sổ Terminal độc lập** chạy song song (1 cho Backend, 1 cho Frontend).

1. Mở Terminal thứ nhất tại thư mục `backend`:
   ```bash
   cd backend
   npm install        # Cài đặt thư viện (nếu mới clone/tải dự án về lần đầu)
   npm start          # Khởi động server (hoặc npm run dev nếu cài nodemon)
   ```
2. Quan sát thông báo thành công trên màn hình console:
   ```text
   ===============================================
   🚀 HR Portal Backend đang chạy tại: http://localhost:5000
   ✅ Kết nối MySQL Database (codegym) thành công!
   ===============================================
   ```
3. **Kiểm tra API trên trình duyệt:** Truy cập [http://localhost:5000/api/health](http://localhost:5000/api/health). Nếu thấy hiện `{"status":"OK",...}` nghĩa là Backend đã sẵn sàng!

---

### Bước 3: Khởi chạy Giao diện Frontend (Port 3000)

> 🛑 **CẢNH BÁO QUAN TRỌNG (DÀNH CHO NGƯỜI MỚI):**  
> **TUYỆT ĐỐI KHÔNG** click đúp chuột trực tiếp vào file `index.html` trong thư mục Windows để mở trình duyệt (đường dẫn dạng `file:///C:/...`).  
> ❌ *Nguyên nhân:* Mở trực tiếp kiểu file sẽ bị trình duyệt chặn giao tiếp API (Lỗi CORS / Origin Null), khiến chức năng đăng nhập và gọi dữ liệu từ MySQL không hoạt động.  
> ✅ *Bắt buộc:* Phải chạy Frontend qua một máy chủ Web cục bộ (Local Server) theo 1 trong 2 cách dưới đây:

#### 🔹 Cách 1: Chạy bằng lệnh dòng lệnh (Khuyên dùng - Nhanh & Chuẩn nhất):
Mở một cửa sổ **Terminal thứ hai** tại thư mục `frontend`:
```bash
cd frontend
npx serve -l 3000
```
*(Nếu hệ thống hỏi `Need to install the following packages: serve... (y)`, bạn chỉ cần gõ `y` rồi nhấn `Enter`)*.
* Sau đó mở trình duyệt (Chrome / Cốc Cốc / Edge / Firefox) và gõ địa chỉ:  
  👉 **[http://localhost:3000](http://localhost:3000)**

#### 🔹 Cách 2: Sử dụng Extension "Live Server" trên VS Code:
1. Mở toàn bộ thư mục `CODEGYM` bằng Visual Studio Code.
2. Cài đặt tiện ích mở rộng **Live Server** (tác giả *Ritwick Dey*) từ VS Code Marketplace.
3. Mở thư mục `frontend`, nhấp chuột phải vào file `index.html` -> Chọn **"Open with Live Server"**.
4. Trình duyệt sẽ tự động mở lên giao diện tại địa chỉ: `http://127.0.0.1:5500/frontend/index.html` (hoặc cổng tương tự).

---

### 🌐 TÓM TẮT ĐỊA CHỈ TRUY CẬP TRÊN LOCALHOST:

| Thành phần | Địa chỉ URL trên Trình duyệt | Cổng (Port) | Chức năng |
| :--- | :--- | :---: | :--- |
| **Giao diện Web (Frontend)** | **[http://localhost:3000](http://localhost:3000)** | `3000` | Trang Đăng nhập, Dashboard HR, Portal Thực tập sinh |
| **Backend REST API** | **[http://localhost:5000](http://localhost:5000)** | `5000` | Cung cấp dữ liệu JSON, xử lý xác thực, upload file |
| **Quản trị MySQL (phpMyAdmin)**| **[http://localhost/phpmyadmin](http://localhost/phpmyadmin)** | `80` / `3306` | Xem, sửa trực tiếp các bảng dữ liệu trong CSDL `codegym` |
| **Kho file tải lên vật lý** | **`http://localhost:5000/uploads/<tên_file>`** | `5000` | Nơi lưu và xem trực tiếp các file PDF / Ảnh CV do user gửi lên |

---

## 🔑 7. TÀI KHOẢN ĐĂNG NHẬP KIỂM THỬ

Cơ sở dữ liệu đã chuẩn bị sẵn 3 tài khoản mặc định (mật khẩu đều là `123456`):

1. **HR Manager (Quản lý Nhân sự):**
   * Email: `hr@company.vn`
   * Mật khẩu: `123456`
   * Chức năng: Thêm/Sửa/Xóa TTS, lọc danh sách, xem trước và duyệt/từ chối tài liệu CV.

2. **Thực tập sinh (Intern Portal):**
   * Email: `intern@student.vn`
   * Mật khẩu: `123456`
   * Chức năng: Xem thông tin cá nhân, kéo thả / chọn file tải lên CV và Đơn xin thực tập.

3. **Quản trị viên (Admin):**
   * Email: `admin@company.vn`
   * Mật khẩu: `123456`

---

## 📋 8. CÔNG VIỆC ĐỀ XUẤT CHO BỘ PHẬN TIẾP THEO (BACKLOG)

1. **Xây dựng phân hệ Quản trị (Admin Module - Sprint 2):**
   * Thiết kế giao diện Dashboard Admin riêng biệt.
   * Chức năng tạo/khóa tài khoản cho HR, Mentor và Thực tập sinh (`STT 39`).
   * Phân quyền chi tiết (RBAC) kiểm soát quyền hạn thao tác từng màn hình (`STT 40`).
2. **Gửi thông báo Email tự động:**
   * Tích hợp `nodemailer` gửi email thông báo kết quả duyệt/từ chối hồ sơ kèm lý do cho ứng viên.
3. **Phân trang dữ liệu (Pagination):**
   * Thêm `limit` và `page` cho API `GET /api/interns` khi số lượng hồ sơ thực tập sinh vượt quá 1000 bản ghi.
