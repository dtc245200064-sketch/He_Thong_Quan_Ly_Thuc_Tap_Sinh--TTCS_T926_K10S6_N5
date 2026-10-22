# Hệ thống Quản lý Thực tập sinh

Ứng dụng web số hóa quy trình quản lý thực tập sinh: từ tiếp nhận hồ sơ, xét duyệt, phân công mentor, chấm công, giao việc, báo cáo tuần đến đánh giá cuối kỳ.

> Dự án thực tập TTCS **T926_K10S6 · Nhóm 5** · Đơn vị: CodeGym · Trường Đại học Công nghệ Thông tin và Truyền thông (ICTU)
> Kỳ thực tập: 07/09/2026 – 26/10/2026 · Mentor hướng dẫn: Phan Văn Luân

---

## Mục lục

1. [Giới thiệu](#1-giới-thiệu)
2. [Tiến độ theo Sprint](#2-tiến-độ-theo-sprint)
3. [Chức năng theo vai trò](#3-chức-năng-theo-vai-trò)
4. [Công nghệ sử dụng](#4-công-nghệ-sử-dụng)
5. [Cấu trúc thư mục](#5-cấu-trúc-thư-mục)
6. [Cài đặt và chạy dự án](#6-cài-đặt-và-chạy-dự-án)
7. [API](#7-api)
8. [Quy trình làm việc nhóm](#8-quy-trình-làm-việc-nhóm)
9. [Hạn chế đã biết và hướng phát triển](#9-hạn-chế-đã-biết-và-hướng-phát-triển)
10. [Thành viên](#10-thành-viên)

---

## 1. Giới thiệu

**Tầm nhìn.** Tạo ra một hệ thống số hóa toàn diện để quản lý thực tập sinh, giúp doanh nghiệp tối ưu quy trình tuyển chọn, quản lý và đánh giá; đồng thời mang đến cho thực tập sinh trải nghiệm minh bạch, chuyên nghiệp và hiệu quả.

**Mục tiêu sản phẩm**

1. Chuẩn hóa và số hóa quy trình quản lý thực tập sinh, giảm công việc thủ công (Excel, email rời rạc).
2. Tăng hiệu quả quản lý cho HR và mentor, giảm thời gian theo dõi và đánh giá.
3. Nâng cao trải nghiệm cho thực tập sinh: xem lịch, chấm công, nộp báo cáo, theo dõi tiến độ và đánh giá.
4. Củng cố hợp tác giữa doanh nghiệp và trường đại học bằng báo cáo minh bạch.
5. Cung cấp dữ liệu phân tích: thống kê theo trường/ngành, tỉ lệ hoàn thành chương trình.

Backlog đầy đủ gồm **42 user story** chia thành 9 epic (xem bảng Product Backlog của nhóm).

---

## 2. Tiến độ theo Sprint

Số sprint dưới đây theo **Product Backlog** của nhóm. Tên sprint trên Jira có thể khác (ví dụ "SCRUM Sprint 2", "SCRUM Sprint 3").

### Dòng thời gian

| Sprint | Thời gian | Trọng tâm |
|---|---|---|
| Sprint 0 | 07/09 – 24/09/2026 | Onboarding, thiết lập môi trường, học khóa học |
| Sprint 1 | 25/09 – 02/10/2026 | Nền tảng hệ thống: hồ sơ thực tập sinh, tài khoản và phân quyền |
| Sprint 2 | 02/10 – 09/10/2026 | Quản lý thực tập: tiếp nhận, hợp đồng, chương trình, chấm công, nghỉ phép |
| Sprint 3 | 09/10 – 16/10/2026 | Theo dõi và đánh giá: giao việc, báo cáo, đánh giá, mentor, thông báo |
| Sprint 4 | 16/10 – 23/10/2026 | Hoàn thiện, làm mịn, kiểm thử, bàn giao |

### Tổng quan

| Phạm vi | Số user story |
|---|---|
| Sprint 1 | 7 |
| Sprint 2 | 11 |
| Sprint 3 | 13 |
| Chưa lên kế hoạch / chưa thực hiện | 11 |
| **Tổng** | **42** |

Theo Jira (cập nhật 21/10/2026): 152 work item (gồm Epic, Task, Subtask), 128 Done, 24 To Do.

### Sprint 1: Nền tảng hệ thống (7 user story)

| STT | User story | Epic |
|---|---|---|
| 1 | HR thêm mới hồ sơ thực tập sinh | Quản lý hồ sơ thực tập sinh |
| 2 | HR chỉnh sửa hồ sơ thực tập sinh | Quản lý hồ sơ thực tập sinh |
| 3 | HR tìm kiếm và lọc thực tập sinh theo trường/ngành | Quản lý hồ sơ thực tập sinh |
| 4 | Thực tập sinh upload CV và đơn xin thực tập (PDF, DOCX, PNG, JPG) | Quản lý hồ sơ thực tập sinh |
| 5 | HR xem trước và duyệt/từ chối tài liệu, kèm lý do | Quản lý hồ sơ thực tập sinh |
| 39 | Admin tạo tài khoản cho HR, mentor và thực tập sinh | Quản trị hệ thống |
| 40 | Admin phân quyền chi tiết theo vai trò | Quản trị hệ thống |

### Sprint 2: Quản lý thực tập (11 user story)

| STT | User story | Epic |
|---|---|---|
| 6 | Thực tập sinh đăng ký tài khoản và nộp hồ sơ trực tuyến | Tiếp nhận và xét duyệt |
| 7 | HR duyệt hoặc từ chối hồ sơ | Tiếp nhận và xét duyệt |
| 8 | Hệ thống gửi email thông báo kết quả xét duyệt | Tiếp nhận và xét duyệt |
| 9 | HR tải lên hợp đồng thực tập | Tiếp nhận và xét duyệt |
| 10 | Thực tập sinh xác nhận hợp đồng trên hệ thống | Tiếp nhận và xét duyệt |
| 11 | HR tạo chương trình thực tập theo phòng ban | Quản lý chương trình thực tập |
| 12 | HR phân công thực tập sinh cho mentor | Quản lý chương trình thực tập |
| 13 | HR thiết lập ngày bắt đầu và kết thúc chương trình | Quản lý chương trình thực tập |
| 14 | Thực tập sinh xem lịch thực tập cá nhân | Quản lý chương trình thực tập |
| 21 | Thực tập sinh check-in/check-out | Quản lý chấm công và thời gian |
| 22 | HR xem báo cáo đi làm và nghỉ phép | Quản lý chấm công và thời gian |

### Sprint 3: Theo dõi và đánh giá (13 user story)

| STT | User story | Epic |
|---|---|---|
| 15 | Mentor giao nhiệm vụ cho thực tập sinh | Quản lý công việc và đánh giá |
| 16 | Thực tập sinh cập nhật tiến độ công việc | Quản lý công việc và đánh giá |
| 17 | Thực tập sinh nộp báo cáo tuần | Quản lý công việc và đánh giá |
| 18 | Mentor xem báo cáo và phản hồi | Quản lý công việc và đánh giá |
| 19 | Mentor đánh giá kỹ năng và thái độ | Quản lý công việc và đánh giá |
| 20 | HR tổng hợp đánh giá thành báo cáo cuối kỳ | Quản lý công việc và đánh giá |
| 23 | HR thiết lập lịch làm việc linh hoạt | Quản lý chấm công và thời gian |
| 24 | Thực tập sinh đăng ký nghỉ phép | Quản lý chấm công và thời gian |
| 29 | HR thêm mới mentor | Quản lý mentor và phòng ban |
| 30 | HR gán mentor cho thực tập sinh | Quản lý mentor và phòng ban |
| 31 | HR xem số thực tập sinh mỗi mentor đang quản lý | Quản lý mentor và phòng ban |
| 35 | Hệ thống gửi email tự động khi có lịch họp | Tích hợp và thông báo |
| 36 | Thực tập sinh nhận thông báo trên ứng dụng | Tích hợp và thông báo |

### Sprint 4: Hoàn thiện và bàn giao

Sprint này không thêm user story mới, tập trung vào chất lượng và chuẩn hóa:

- Chuyển toàn bộ dữ liệu nghiệp vụ từ `localStorage` sang MySQL và REST API.
- Loại bỏ dữ liệu demo, chỉ giữ một tài khoản quản trị viên khởi tạo.
- Tách giao diện riêng cho mentor, đồng bộ lịch thực tập động từ công việc và lịch họp.
- Bổ sung trường tiến độ, ngày cập nhật và phản hồi cho công việc (SCRUM-198).

### Chưa thực hiện hoặc chưa hoàn thiện (11 user story)

| STT | User story | Ghi chú |
|---|---|---|
| 25, 26 | Quản lý phụ cấp (HR nhập, thực tập sinh xem lịch sử) | Chưa thực hiện |
| 27, 28 | Yêu cầu hỗ trợ (thực tập sinh gửi, HR duyệt và phản hồi) | Chưa thực hiện |
| 32, 33 | Thống kê theo trường/ngành, tỉ lệ hoàn thành chương trình | Đã có API thống kê, chưa đóng ticket trên Jira |
| 34 | Xuất báo cáo Excel/PDF | Chưa hoàn thiện |
| 37 | Tích hợp HRM | Có cấu hình và API đồng bộ, chưa đóng ticket trên Jira |
| 38 | Tích hợp chấm công QR/thẻ | Mới ở mức mô phỏng |
| 41 | Sao lưu dữ liệu định kỳ | Chưa thực hiện |
| 42 | Nhật ký hoạt động của admin | Chưa thực hiện |

---

## 3. Chức năng theo vai trò

| Vai trò | Giao diện | Chức năng chính |
|---|---|---|
| **Admin** | `admin.html` | Tạo và khóa tài khoản, phân quyền chi tiết theo vai trò |
| **HR** | `dashboard.html` | Quản lý hồ sơ và tài liệu thực tập sinh, duyệt hồ sơ, hợp đồng, chương trình thực tập, mentor, chấm công, nghỉ phép, lịch làm việc, tổng hợp đánh giá |
| **Mentor** | `mentor.html` | Giao việc, theo dõi tiến độ, xem và phản hồi báo cáo tuần, đánh giá thực tập sinh |
| **Thực tập sinh** | `intern.html` | Tải CV và đơn xin thực tập, xem lịch, check-in/check-out, đăng ký nghỉ phép, cập nhật tiến độ, nộp báo cáo tuần, nhận thông báo |

Đăng nhập tại `index.html`. Tài khoản do Admin tạo, không có đăng ký tự do.

---

## 4. Công nghệ sử dụng

| Thành phần | Công nghệ |
|---|---|
| Frontend | HTML5, CSS3, JavaScript thuần (không dùng framework) |
| Backend | Node.js, Express 5 |
| Cơ sở dữ liệu | MySQL (thư viện `mysql2`) |
| Xác thực | JWT (`jsonwebtoken`), mã hóa mật khẩu bằng `bcryptjs` |
| Upload file | Multer (tối đa 10 MB mỗi file) |
| Gửi email | Nodemailer |
| Công cụ nhóm | Jira (backlog, sprint), GitHub (mã nguồn), Figma (thiết kế), Zalo (trao đổi) |

---

## 5. Cấu trúc thư mục

```text
.
├── README.md
├── API_CONTRACT.md          # Đặc tả API (hiện mới mô tả nhóm endpoint Sprint 1)
├── database.sql             # Kịch bản tạo CSDL, bảng và tài khoản admin khởi tạo
├── package.json             # Script chạy nhanh từ thư mục gốc
│
├── backend/
│   ├── server.js            # Khởi chạy Express, đăng ký routes, phục vụ frontend
│   ├── config/db.js         # Kết nối MySQL (connection pool)
│   ├── middleware/          # auth.js (JWT, phân quyền), upload.js (Multer)
│   ├── routes/              # Khai báo endpoint theo từng nhóm nghiệp vụ
│   ├── controllers/         # Xử lý nghiệp vụ cho từng nhóm
│   ├── services/            # email.service.js (gửi và lưu lịch sử email)
│   ├── migrate_sprint2.js   # Tạo bảng cho Sprint 2
│   ├── migrate_sprint3.js   # Tạo bảng cho Sprint 3 (tự chạy khi server khởi động)
│   └── uploads/             # File do người dùng tải lên (không đưa lên Git)
│
└── frontend/
    ├── index.html           # Đăng nhập
    ├── dashboard.*          # Giao diện HR
    ├── admin.*              # Giao diện Admin
    ├── mentor.*             # Giao diện Mentor
    ├── intern.*             # Giao diện Thực tập sinh
    ├── api.js               # Các hàm gọi API tập trung
    └── image/               # Icon, banner
```

---

## 6. Cài đặt và chạy dự án

### Yêu cầu

- Node.js 18 trở lên
- MySQL 8 (hoặc XAMPP/MariaDB tương đương)

### Các bước

**1. Tạo cơ sở dữ liệu**

```bash
mysql -u root -p < database.sql
```

Lệnh này tạo CSDL `codegym`, các bảng và một tài khoản quản trị viên khởi tạo (tên đăng nhập `admin`). Mật khẩu khởi tạo được đặt trong `database.sql` (dạng băm bcrypt). **Hãy đổi mật khẩu ngay sau lần đăng nhập đầu tiên.**

**2. Cài đặt thư viện backend**

```bash
cd backend
npm install
```

**3. Cấu hình biến môi trường**

Tạo file `backend/.env` (file này đã nằm trong `.gitignore`):

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=codegym
JWT_SECRET=<chuoi-bi-mat-cua-ban>

# Tùy chọn: gửi email thật qua SMTP
SMTP_SERVICE=gmail
SMTP_USER=
SMTP_PASS=
```

| Biến | Mặc định | Ý nghĩa |
|---|---|---|
| `PORT` | `5000` | Cổng chạy server |
| `DB_HOST`, `DB_PORT` | `localhost`, `3306` | Địa chỉ MySQL |
| `DB_USER`, `DB_PASSWORD` | `root`, rỗng | Tài khoản MySQL |
| `DB_NAME` | `codegym` | Tên CSDL |
| `JWT_SECRET` | không có | **Bắt buộc.** Thiếu biến này, server báo lỗi `FATAL` và không khởi động |
| `SMTP_USER`, `SMTP_PASS`, `SMTP_SERVICE` | không có | Nếu bỏ trống, hệ thống dùng tài khoản email thử nghiệm |

**4. Chạy server**

```bash
npm start          # chạy một lần
npm run dev        # tự khởi động lại khi sửa mã (nodemon)
```

Từ thư mục gốc cũng có thể chạy `npm start` (sau khi đã cài thư viện ở thư mục `backend`).

**5. Mở ứng dụng**

Backend phục vụ luôn frontend tại **http://localhost:5000**. Kiểm tra server hoạt động tại `http://localhost:5000/api/health`.

---

## 7. API

Base URL: `http://localhost:5000/api` · Xác thực: `Authorization: Bearer <TOKEN>`

| Nhóm | Đường dẫn | Nội dung |
|---|---|---|
| Xác thực | `/auth`, `/login` | Đăng nhập, lấy thông tin tài khoản |
| Quản trị | `/admin` | Tài khoản người dùng, ma trận phân quyền |
| Thực tập sinh | `/interns` | Hồ sơ, tài liệu, duyệt tài liệu, lịch sử email |
| Chương trình | `/programs` | Chương trình thực tập |
| Hợp đồng | `/contracts` | Tải lên, xác nhận hợp đồng |
| Chấm công | `/attendance` | Check-in/check-out, báo cáo đi làm |
| Nghỉ phép | `/leaves` | Đăng ký, duyệt |
| Lịch | `/schedules` | Lịch làm việc, lịch thực tập |
| Công việc | `/tasks` | Giao việc, cập nhật tiến độ |
| Báo cáo | `/reports` | Báo cáo tuần, phản hồi, thống kê |
| Đánh giá | `/evaluations` | Đánh giá của mentor, tổng hợp cuối kỳ |
| Mentor | `/mentors` | Quản lý và gán mentor |
| Phòng ban | `/departments` | Danh mục phòng ban |
| Thông báo | `/notifications` | Thông báo trong ứng dụng, lịch họp |
| Tích hợp | `/integrations` | Cấu hình HRM, chấm công QR |

Đặc tả chi tiết các endpoint của Sprint 1 xem tại [`API_CONTRACT.md`](API_CONTRACT.md). Các nhóm endpoint của Sprint 2 và Sprint 3 chưa được ghi đầy đủ trong tài liệu này.

---

## 8. Quy trình làm việc nhóm

- **Mô hình:** Scrum, sprint ngắn (khoảng 1 tuần/sprint sau giai đoạn onboarding), có họp Daily, sprint review và retrospective.
- **Quản lý công việc:** Jira (project `SCRUM`), mỗi user story được chia thành các subtask.
- **Quy tắc Git:** nhánh `main` giữ bản ổn định, `develop` là nhánh tích hợp. Một số thay đổi được merge qua Pull Request. Các nhánh `feature/*` dùng để đánh dấu từng chức năng, các nhánh `fix/*` dùng cho đợt sửa lỗi và kiểm thử cuối kỳ.
- **Thông điệp commit:** theo dạng `feat:`, `fix:`, `refactor:`, `style:`, `chore:` kèm mô tả ngắn.

---

## 9. Hạn chế đã biết và hướng phát triển

**Hạn chế**

- Một số user story chưa thực hiện (xem [mục 2](#chưa-thực-hiện-hoặc-chưa-hoàn-thiện-11-user-story)).
- Chưa có kiểm thử tự động và CI.
- CORS đang mở cho mọi origin (`*`). Cần giới hạn lại trước khi triển khai thật.
- `API_CONTRACT.md` chưa cập nhật cho Sprint 2 và Sprint 3.

**Hướng phát triển**

- Ngắn hạn: hoàn thiện xuất báo cáo Excel/PDF, thống kê, phụ cấp và yêu cầu hỗ trợ.
- 1–3 tháng: tích hợp thật với HRM và chấm công QR/thẻ, sao lưu dữ liệu, nhật ký hoạt động.
- Dài hạn: ứng dụng di động cho thực tập sinh, báo cáo gửi trường tự động, dự báo nguồn nhân lực trẻ.

---

## 10. Thành viên

| Họ tên | Vai trò theo phân công |
|---|---|
| Tạ Văn Đức | Backend |
| Ma Công Đức (@dtc245200136-sudo) | Backend (CSDL & Module Thông báo SCRUM-56, SCRUM-176) |
| Hoàng Minh Đức | Backend |
| Nông Tiến Tài | Backend |
| Nguyễn Trọng Xuyên | Frontend |
| Nguyễn Quý Tôn | Frontend |
| Nguyễn Văn Tùng | Frontend |
| Hoàng Trọng Tấn | Frontend |
| Ma Công Tuân | Frontend |
| Tô Văn Thịnh | Frontend |

**Mentor hướng dẫn:** Phan Văn Luân · **Lớp:** T926_K10S6 · **Đơn vị:** CodeGym
