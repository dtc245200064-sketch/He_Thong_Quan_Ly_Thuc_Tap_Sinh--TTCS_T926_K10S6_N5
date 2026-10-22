# 🛡️ Báo cáo An toàn & Bảo mật Module Thông báo (Security Audit)

> **Kiểm thử viên / Người phụ trách:** Ma Công Đức (`dtc245200136@ictu.edu.vn`)  
> **Phạm vi:** REST APIs `/api/notifications/*`  

---

## 1. Danh sách các lỗ hổng đã được phòng ngừa

| Mã Bug / Lỗ hổng | Mô tả rủi ro | Giải pháp kỹ thuật đã áp dụng | Trạng thái |
|---|---|---|---|
| **SEC-01-notifications** | Truy cập trái phép endpoint thông báo mà không có token | Tích hợp middleware `authenticate`, trả về `401 Unauthorized` | **PASS (100%)** |
| **B04** | Đánh dấu đọc tất cả làm ảnh hưởng đến thông báo của user khác | Ràng buộc điều kiện `WHERE user_id = req.user.id` trong câu lệnh SQL | **PASS (100%)** |
| **B08** | Tấn công XSS qua thuộc tính `link` khi tạo thông báo | Lọc và loại bỏ tiền tố `javascript:` trong URL trước khi lưu | **PASS (100%)** |
| **B17** | Thực tập sinh xem được lịch họp của người khác | Bộ lọc kiểm tra `intern_ids.includes(req.user.internId)` | **PASS (100%)** |
| **S3-29** | Lỗi logic giờ kết thúc cuộc họp sớm hơn giờ bắt đầu | Kiểm tra `end_time <= start_time`, trả về mã lỗi `400 Bad Request` | **PASS (100%)** |

---

## 2. Kết luận
Module Thông báo đáp ứng đầy đủ các tiêu chuẩn an toàn thông tin theo yêu cầu kiểm thử Sprint 3 của CodeGym.
