# 📊 BÁO CÁO KIỂM THỬ BASELINE BAN ĐẦU (TRƯỚC KHI SỬA)

> Ngày thực hiện: 2026-10-20T04:44:27.076Z
> Môi trường: Node.js v24.19.0, MySQL `codegym_test`
> Tổng số ca kiểm thử: **45** | **PASS:** 41 | **FAIL:** 4

## 1. BẢNG CHI TIẾT CÁC CA KIỂM THỬ

| Mã Ca | Phân Loại | Mô Tả Ca Kiểm Thử | Vai Trò | Kết Quả Kỳ Vọng | Kết Quả Thực Tế | Trạng Thái | Mã Lỗi Đối Chiếu |
|---|---|---|---|---|---|---|---|
| `AUTH-01` | D1 | Đăng nhập tài khoản Admin hợp lệ | Admin | 200 OK & JWT | 200 | **PASS** | - |
| `AUTH-01b` | D1 | Đăng nhập mật khẩu sai | Guest | 401 Unauthorized | 401 | **PASS** | - |
| `AUTH-01c` | D1 | Đăng nhập tài khoản không tồn tại | Guest | 401 Unauthorized | 401 | **PASS** | - |
| `AUTH-03` | D1 | Gọi API với JWT token giả mạo | Guest | 401 Unauthorized | 401 | **PASS** | - |
| `AUTH-04-B01` | D1 | Bypass xác thực bằng header x-user-role: Admin | Guest | 401 Unauthorized (Chặn bypass) | 401 | **PASS** | - |
| `AUTH-04-B05` | D1 | Kiểm tra backdoor mannh@gmail.com | Guest | 401 (Chặn backdoor) | 401 | **PASS** | - |
| `SEC-01-attendance` | D1 | Kiểm tra xác thực GET /api/attendance | Guest | 401 Unauthorized | 401 | **PASS** | - |
| `SEC-01-leaves` | D1 | Kiểm tra xác thực GET /api/leaves | Guest | 401 Unauthorized | 401 | **PASS** | - |
| `SEC-01-contracts` | D1 | Kiểm tra xác thực GET /api/contracts | Guest | 401 Unauthorized | 401 | **PASS** | - |
| `SEC-01-programs` | D1 | Kiểm tra xác thực GET /api/programs | Guest | 401 Unauthorized | 401 | **PASS** | - |
| `SEC-01-departments` | D1 | Kiểm tra xác thực GET /api/departments | Guest | 401 Unauthorized | 401 | **PASS** | - |
| `SEC-01-tasks` | D1 | Kiểm tra xác thực GET /api/tasks | Guest | 401 Unauthorized | 401 | **PASS** | - |
| `SEC-01-reports` | D1 | Kiểm tra xác thực GET /api/reports | Guest | 401 Unauthorized | 401 | **PASS** | - |
| `SEC-01-evaluations` | D1 | Kiểm tra xác thực GET /api/evaluations | Guest | 401 Unauthorized | 401 | **PASS** | - |
| `SEC-01-mentors` | D1 | Kiểm tra xác thực GET /api/mentors | Guest | 401 Unauthorized | 401 | **PASS** | - |
| `SEC-01-notifications` | D1 | Kiểm tra xác thực GET /api/notifications | Guest | 401 Unauthorized | 401 | **PASS** | - |
| `SEC-01-schedules` | D1 | Kiểm tra xác thực GET /api/schedules | Guest | 401 Unauthorized | 401 | **PASS** | - |
| `SEC-01-integrations` | D1 | Kiểm tra xác thực GET /api/integrations | Guest | 401 Unauthorized | 401 | **PASS** | - |
| `SEC-01-system-emails` | D1 | Kiểm tra xác thực GET /api/system-emails | Guest | 401 Unauthorized | 401 | **PASS** | - |
| `SEC-04-B07` | D1 | Kiểm tra bảo vệ thư mục /uploads | Guest | 401/403 (Cấm tải trực tiếp) | 401 | **PASS** | - |
| `SEC-02-B06` | D1 | Bảo mật khóa tích hợp /api/integrations | Guest | Ẩn api_key (dạng ****) | Che key | **PASS** | - |
| `S1-26-HR` | Sprint 1 | Admin tạo tài khoản HR Manager | Admin | 201 Created | 201 | **PASS** | - |
| `S1-26-M1` | Sprint 1 | Admin tạo tài khoản Mentor 1 | Admin | 201 Created | 201 | **PASS** | - |
| `S1-26-M2` | Sprint 1 | Admin tạo tài khoản Mentor 2 (kiểm tra tên An B18) | Admin | 201 Created | 201 | **PASS** | - |
| `S1-28-TTS1` | Sprint 1 | Admin tạo tài khoản TTS 1 | Admin | 201 Created | 201 | **PASS** | - |
| `S1-28-TTS2` | Sprint 1 | Admin tạo tài khoản TTS 2 | Admin | 201 Created | 201 | **PASS** | - |
| `S1-28-TTS3` | Sprint 1 | Admin tạo tài khoản TTS 3 | Admin | 201 Created | 201 | **PASS** | - |
| `S1-01` | Sprint 1 | HR thêm mới hồ sơ TTS | HR | 201 Created | 201 | **PASS** | - |
| `S1-02` | Sprint 1 | Thêm hồ sơ thiếu trường bắt buộc | HR | 400 Bad Request | 400 | **PASS** | - |
| `S1-03-B20` | Sprint 1 | Thêm hồ sơ end_date < start_date | HR | 400 Bad Request | 201 | **FAIL** | `B20` |
| `S1-05` | Sprint 1 | TTS gọi API tạo hồ sơ | TTS | 403 Forbidden | 403 | **PASS** | - |
| `S1-10` | Sprint 1 | Tìm kiếm TTS theo từ khóa | HR | 200 OK | 200 | **PASS** | - |
| `S1-13-B04` | Sprint 1 | TTS gọi GET /api/interns chỉ thấy hồ sơ mình | TTS | Chỉ thấy hồ sơ bản thân | Thấy toàn bộ | **FAIL** | `B04` |
| `S2-12-B11` | Sprint 2 | Tạo chương trình có cột schedule | HR | 201 Created | 201 | **PASS** | - |
| `S2-16-B11` | Sprint 2 | Kiểm tra bảng departments trong CSDL | HR | 200 OK | 200 | **PASS** | - |
| `S2-20` | Sprint 2 | TTS Check-in | TTS | 200 OK | 200 | **PASS** | - |
| `S2-22-B15` | Sprint 2 | Check-in với ngày giả mạo từ client | TTS | 400 Bad Request (Chặn ngày giả) | 400 | **PASS** | - |
| `S2-09-B04` | Sprint 2 | TTS B xác nhận hợp đồng TTS A (IDOR) | TTS | 403 Forbidden | 404 | **FAIL** | - |
| `S3-18-B14` | Sprint 3 | Nộp đơn nghỉ phép có end_date < start_date | TTS | 400 Bad Request | 400 | **PASS** | - |
| `S3-21-B04` | Sprint 3 | TTS tự duyệt đơn nghỉ phép (IDOR/Authz) | TTS | 403 Forbidden | 403 | **PASS** | - |
| `S3-13-B19` | Sprint 3 | Đánh giá điểm > 10 hoặc âm | Mentor | 400 Bad Request | 400 | **PASS** | - |
| `S3-25-B18` | Sprint 3 | Kiểm tra danh sách mentors và số lượng intern | HR | 200 OK | 200 | **PASS** | - |
| `S3-29-B17` | Sprint 3 | Tạo lịch họp có giờ kết thúc <= bắt đầu | HR | 400 Bad Request | 400 | **PASS** | - |
| `S3-30-B04` | Sprint 3 | TTS gọi đánh dấu đã đọc tất cả thông báo | TTS | 200 OK (Chỉ áp dụng user của mình) | 200 | **PASS** | - |
| `BONUS-01` | Bonus | Thống kê phòng ban /reports/statistics/departments | HR | 200 OK (Có bảo mật) | 404 | **FAIL** | - |

## 2. DANH SÁCH LỖI XÁC NHẬN TỒN TẠI (FAIL TRÊN BASELINE)

- **[B20] `S1-03-B20`**: Thêm hồ sơ end_date < start_date
  - *Kỳ vọng:* 400 Bad Request
  - *Thực tế:* Nhận được mã phản hồi `201`
  - *Ghi chú:* LỖI P1: Không validate end_date >= start_date
- **[B04] `S1-13-B04`**: TTS gọi GET /api/interns chỉ thấy hồ sơ mình
  - *Kỳ vọng:* Chỉ thấy hồ sơ bản thân
  - *Thực tế:* Nhận được mã phản hồi `Thấy toàn bộ`
  - *Ghi chú:* LỖI P0: TTS thấy danh sách toàn bộ TTS trong hệ thống!
- **[BUG] `S2-09-B04`**: TTS B xác nhận hợp đồng TTS A (IDOR)
  - *Kỳ vọng:* 403 Forbidden
  - *Thực tế:* Nhận được mã phản hồi `404`
- **[BUG] `BONUS-01`**: Thống kê phòng ban /reports/statistics/departments
  - *Kỳ vọng:* 200 OK (Có bảo mật)
  - *Thực tế:* Nhận được mã phản hồi `404`
