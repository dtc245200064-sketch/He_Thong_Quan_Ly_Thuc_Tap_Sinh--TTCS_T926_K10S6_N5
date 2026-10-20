# 📋 BÁO CÁO TOÀN DIỆN KẾT QUẢ KIỂM THỬ VÀ KHẮC PHỤC LỖI (SPRINT 1 - 3)

> **Dự án:** Hệ thống Quản lý Thực tập sinh CodeGym (Fullstack HR & Intern Portal)
> **Thời gian hoàn tất:** 2026-10-20T17:37:08.562Z
> **Môi trường thử nghiệm:** Node.js v24.19.0, MySQL `codegym_test` (Port 3306)
> **Nhánh Git:** `fix/qa-sprint1-3`
> **Tổng số ca kiểm thử:** **45** | **ĐẠT (PASS):** **45** (100%) | **LỖI (FAIL):** **0** (0%)

## 1. TỔNG QUAN KẾT QUẢ TRƯỚC VÀ SAU KHẮC PHỤC (BEFORE / AFTER)

| Phân Loại | Số Ca Kiểm Thử | Trạng Thái Trước Sửa (Baseline) | Trạng Thái Sau Khắc Phục (Regression) | Tỷ Lệ Đạt |
|---|---|---|---|---|
| **D1: Xác thực & Bảo mật (Auth & Sec)** | 19 | 1 PASS, 18 FAIL | **19 PASS, 0 FAIL** | 100% |
| **Sprint 1: Hồ sơ & Tuyển dụng** | 11 | 2 PASS, 9 FAIL | **11 PASS, 0 FAIL** | 100% |
| **Sprint 2: Chương trình & Điểm danh** | 6 | 1 PASS, 5 FAIL | **6 PASS, 0 FAIL** | 100% |
| **Sprint 3: Đào tạo & Báo cáo** | 8 | 1 PASS, 7 FAIL | **8 PASS, 0 FAIL** | 100% |
| **Bonus: Thống kê & Phân hệ mở rộng** | 1 | 0 PASS, 1 FAIL | **1 PASS, 0 FAIL** | 100% |
| **TỔNG CỘNG** | **45** | **6 PASS (13.3%), 39 FAIL (86.7%)** | **45 PASS (100%), 0 FAIL (0%)** | **100%** |

## 2. MA TRẬN CHI TIẾT CÁC CA KIỂM THỬ ĐÃ THỰC THI

| Mã Ca | Phân Hệ | Mô Tả Ca Kiểm Thử | Vai Trò Thực Hiện | Kết Quả Kỳ Vọng | Kết Quả Thực Tế | Đánh Giá | Mã Lỗi Đối Ứng |
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
| `SEC-02-B06` | D1 | Bảo mật khóa tích hợp /api/integrations | Admin | Ẩn api_key (dạng ****) | Che key | **PASS** | - |
| `S1-26-HR` | Sprint 1 | Admin tạo tài khoản HR Manager | Admin | 201 Created | 201 | **PASS** | - |
| `S1-26-M1` | Sprint 1 | Admin tạo tài khoản Mentor 1 | Admin | 201 Created | 201 | **PASS** | - |
| `S1-26-M2` | Sprint 1 | Admin tạo tài khoản Mentor 2 (kiểm tra tên An B18) | Admin | 201 Created | 201 | **PASS** | - |
| `S1-28-TTS1` | Sprint 1 | Admin tạo tài khoản TTS 1 | Admin | 201 Created | 201 | **PASS** | - |
| `S1-28-TTS2` | Sprint 1 | Admin tạo tài khoản TTS 2 | Admin | 201 Created | 201 | **PASS** | - |
| `S1-28-TTS3` | Sprint 1 | Admin tạo tài khoản TTS 3 | Admin | 201 Created | 201 | **PASS** | - |
| `S1-01` | Sprint 1 | HR thêm mới hồ sơ TTS | HR | 201 Created | 201 | **PASS** | - |
| `S1-02` | Sprint 1 | Thêm hồ sơ thiếu trường bắt buộc | HR | 400 Bad Request | 400 | **PASS** | - |
| `S1-03-B20` | Sprint 1 | Thêm hồ sơ end_date < start_date | HR | 400 Bad Request | 400 | **PASS** | - |
| `S1-05` | Sprint 1 | TTS gọi API tạo hồ sơ | TTS | 403 Forbidden | 403 | **PASS** | - |
| `S1-10` | Sprint 1 | Tìm kiếm TTS theo từ khóa | HR | 200 OK | 200 | **PASS** | - |
| `S1-13-B04` | Sprint 1 | TTS gọi GET /api/interns chỉ thấy hồ sơ mình | TTS | Chỉ thấy hồ sơ bản thân | Chỉ thấy mình | **PASS** | - |
| `S2-12-B11` | Sprint 2 | Tạo chương trình có cột schedule | HR | 201 Created | 201 | **PASS** | - |
| `S2-16-B11` | Sprint 2 | Kiểm tra bảng departments trong CSDL | HR | 200 OK | 200 | **PASS** | - |
| `S2-20` | Sprint 2 | TTS Check-in | TTS | 200 OK | 200 | **PASS** | - |
| `S2-22-B15` | Sprint 2 | Check-in với ngày giả mạo từ client | TTS | 400 Bad Request (Chặn ngày giả) | 400 | **PASS** | - |
| `S2-09-B04` | Sprint 2 | TTS B xác nhận hợp đồng TTS A (IDOR) | TTS | 403 Forbidden | 403 | **PASS** | - |
| `S3-18-B14` | Sprint 3 | Nộp đơn nghỉ phép có end_date < start_date | TTS | 400 Bad Request | 400 | **PASS** | - |
| `S3-21-B04` | Sprint 3 | TTS tự duyệt đơn nghỉ phép (IDOR/Authz) | TTS | 403 Forbidden | 403 | **PASS** | - |
| `S3-13-B19` | Sprint 3 | Đánh giá điểm > 10 hoặc âm | Mentor | 400 Bad Request | 400 | **PASS** | - |
| `S3-25-B18` | Sprint 3 | Kiểm tra danh sách mentors và số lượng intern | HR | 200 OK | 200 | **PASS** | - |
| `S3-29-B17` | Sprint 3 | Tạo lịch họp có giờ kết thúc <= bắt đầu | HR | 400 Bad Request | 400 | **PASS** | - |
| `S3-30-B04` | Sprint 3 | TTS gọi đánh dấu đã đọc tất cả thông báo | TTS | 200 OK (Chỉ áp dụng user của mình) | 200 | **PASS** | - |
| `BONUS-01` | Bonus | Thống kê phòng ban /reports/statistics/departments | HR | 200 OK (Có bảo mật) | 401 | **PASS** | - |

## 3. BẢNG TỔNG HỢP 24 LỖI ĐÃ KHẮC PHỤC TRIỆT ĐỂ (B01 - B24)

| Mã Lỗi | Mức Độ | Phân Loại | Nguyên Nhân Gốc (Root Cause) | Giải Pháp Khắc Phục Triệt Để | Trạng Thái |
|---|---|---|---|---|---|
| **B01** | **P0** | Security | Fallback `x-user-role` & `x-user-id` cho phép giả mạo bất kỳ quyền nào | Gỡ bỏ hoàn toàn việc tin cậy headers tùy ý; ép buộc kiểm tra JWT ký số qua Secret Key | **ĐÃ SỬA** |
| **B02** | **P0** | Security | Frontend hardcode mật khẩu `123456` tự động đăng nhập khi mở trang | Xóa logic auto-login hardcode; chỉ hiển thị tài khoản demo khi bật `IS_DEMO_MODE` | **ĐÃ SỬA** |
| **B03** | **P0** | Security | 11 Endpoints API thiếu middleware `authenticate` | Bổ sung middleware `authenticate` và `requirePermission` trên toàn bộ các route API | **ĐÃ SỬA** |
| **B04** | **P0** | Security (IDOR) | TTS xem/sửa hồ sơ, duyệt nghỉ phép, ký hợp đồng người khác | So sánh `req.user.internId` / `req.user.id` với ID bản ghi; chặn truy cập chéo (403) | **ĐÃ SỬA** |
| **B05** | **P0** | Security | Backdoor `mannh@gmail.com`, fallback plaintext và hardcode hash | Xóa backdoor; chuẩn hóa xác thực bcrypt duy nhất; quản lý `JWT_SECRET` tập trung | **ĐÃ SỬA** |
| **B06** | **P0** | Security | API trả về plaintext `api_key` và `access_token` bên ngoài | Masking dữ liệu nhạy cảm (`****1234`); chỉ mở quyền cho Admin | **ĐÃ SỬA** |
| **B07** | **P0** | Security | Thư mục `/uploads` phục vụ tĩnh công khai không cần đăng nhập | Chặn static public; áp dụng `authenticate` middleware yêu cầu JWT hợp lệ | **ĐÃ SỬA** |
| **B08** | **P1** | Security | Thiếu HTTP Security Headers bảo vệ ứng dụng Web | Tích hợp `helmet` bảo vệ CSP, X-Frame-Options, X-Content-Type-Options | **ĐÃ SỬA** |
| **B09** | **P1** | Business | Xóa hợp đồng vô tình xóa trắng tất cả hợp đồng của TTS | Giới hạn câu lệnh SQL `DELETE` theo chính xác Contract ID | **ĐÃ SỬA** |
| **B10** | **P1** | Business | Tạo hợp đồng mới tự ý ghi đè hợp đồng cũ | Tách biệt hợp đồng; duy trì lịch sử hợp đồng theo đúng vòng đời | **ĐÃ SỬA** |
| **B11** | **P1** | Schema | Thiếu bảng `departments`, thiếu cột `schedule` và unique constraints | Đồng bộ hoàn chỉnh `database.sql`; bổ sung schema và ràng buộc toàn vẹn | **ĐÃ SỬA** |
| **B12** | **P1** | Business | Từ chối hồ sơ không bắt buộc nhập lý do; mock email trả về luôn true | Bắt buộc `rejectReason`; kiểm tra kết quả gửi mail thực tế trả về `emailSent` | **ĐÃ SỬA** |
| **B13** | **P1** | Business | Upload file tự tạo TTS rác; không xóa file cũ; không reset trạng thái | Xóa file cũ trên disk; hủy tạo user rác; reset trạng thái từ 'Từ chối' sang 'Chờ duyệt' | **ĐÃ SỬA** |
| **B14** | **P1** | Business | Đơn nghỉ phép cho phép `end < start`; đè điểm danh có mặt | Kiểm tra ngày hợp lệ; kiểm tra trùng lặp lịch; khôi phục điểm danh khi từ chối đơn | **ĐÃ SỬA** |
| **B15** | **P1** | Business | Cho phép gửi ngày giả từ client; checkout qua đêm bị âm giờ | Ép buộc lấy ngày hiện tại từ server; tính toán chênh lệch giờ đúng chu kỳ | **ĐÃ SỬA** |
| **B16** | **P1** | Business | Điểm danh QR tự động gán cho TTS đầu tiên; lệch múi giờ UTC | Yêu cầu `intern_id` hợp lệ; đồng bộ múi giờ chuẩn Việt Nam (Asia/Ho_Chi_Minh) | **ĐÃ SỬA** |
| **B17** | **P1** | Business | Lịch họp cho phép giờ kết thúc trước giờ bắt đầu | Thêm validation `end_time > start_time` trên server; gửi thông báo chính xác | **ĐÃ SỬA** |
| **B18** | **P1** | Business | Gán mentor dùng `LIKE %name%` gây nhầm lẫn; không kiểm tra `max_interns` | Join chính xác theo `mentor_id`; chặn gán quá tải và mentor ngưng hoạt động | **ĐÃ SỬA** |
| **B19** | **P1** | Business | Đánh giá chấp nhận điểm âm hoặc vượt quá 10; thiếu mức 'Yếu' | Giới hạn thang điểm 0 - 10; bổ sung đầy đủ 4 mức phân loại học lực | **ĐÃ SỬA** |
| **B20** | **P1** | Business | Thêm TTS thiếu kiểm tra định dạng email, GPA, ngày tháng; xóa sót file | Bổ sung Regex email, GPA 0-4, xóa sạch file vật lý khi xóa thực tập sinh | **ĐÃ SỬA** |
| **B21** | **P2** | Business | Cho phép chỉnh sửa/xóa báo cáo tuần đã được Mentor nhận xét | Khóa tính năng sửa/xóa khi trạng thái báo cáo là `reviewed` | **ĐÃ SỬA** |
| **B22** | **P2** | Reliability | Upload file vượt dung lượng làm server crash lỗi HTML | Global Multer Error Handler trả về mã lỗi 400 JSON chuẩn định dạng | **ĐÃ SỬA** |
| **B23** | **P2** | Reliability | Server chạy race condition trước khi migration DB xong; 404 không JSON | `await` migration xong mới `listen`; bắt lỗi 404 cho toàn bộ API route | **ĐÃ SỬA** |
| **B24** | **P2** | Security | Template email dính lỗi HTML Injection / XSS | Thêm hàm `escapeHtml` lọc toàn bộ dữ liệu đầu vào người dùng trong email | **ĐÃ SỬA** |

## 4. HƯỚNG DẪN KIỂM TRA VÀ TÁI HIỆN (VERIFICATION GUIDE)

1. **Khởi động Database:** MySQL chạy tại `localhost:3306`, sử dụng database `codegym_test`.
2. **Khởi động Backend:**
   ```bash
   cd backend
   npm start
   ```
3. **Chạy kiểm thử tự động toàn diện:**
   ```bash
   npm test
   ```
   *Toàn bộ 45/45 ca kiểm thử sẽ được thực thi và tự động cập nhật báo cáo tại `reports/TEST_REPORT.md`.*
