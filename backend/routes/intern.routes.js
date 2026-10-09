const express = require('express');
const router = express.Router();
const internController = require('../controllers/intern.controller');
const upload = require('../middleware/upload');
const { authenticate, requirePermission } = require('../middleware/auth');

// 1. GET /api/interns (Xem danh sách thực tập sinh & ứng viên)
router.get('/', authenticate, (req, res, next) => {
  if (req.user && (req.user.role === 'Thực tập sinh' || req.user.role === 'INTERN')) {
    return next();
  }
  return requirePermission('profile_manage', 0)(req, res, next);
}, internController.getInterns);

// 2. POST /api/interns (Thêm mới thực tập sinh)
router.post('/', authenticate, requirePermission('profile_manage', 1), internController.createIntern);

// GET /api/interns/emails/history (Lấy danh sách email hệ thống đã gửi - User Story 8)
router.get('/emails/history', authenticate, internController.getEmailHistory);

// 3. PUT /api/interns/:id (Chỉnh sửa hồ sơ thực tập sinh)
router.put('/:id', authenticate, requirePermission('profile_manage', 2), internController.updateIntern);

// 4. GET /api/interns/:id/documents (Xem tài liệu CV & Đơn)
router.get('/:id/documents', authenticate, (req, res, next) => {
  if (req.user && (req.user.role === 'Thực tập sinh' || req.user.role === 'INTERN')) {
    return next();
  }
  return requirePermission('view_docs', 0)(req, res, next);
}, internController.getInternDocuments);

// 5. PATCH /api/interns/:id/documents/status (Duyệt / Từ chối tài liệu và hồ sơ ứng viên)
router.patch('/:id/documents/status', authenticate, requirePermission('review_docs', 4), internController.updateDocumentStatus);

// 6. POST /api/interns/:id/documents (Tải lên file tài liệu)
router.post('/:id/documents', authenticate, upload.single('file'), internController.uploadDocument);

// 7. DELETE /api/interns/:id (Xóa thực tập sinh)
router.delete('/:id', authenticate, requirePermission('profile_manage', 3), internController.deleteIntern);

// 8. DELETE /api/interns/:id/documents/:docType (Xóa tài liệu của thực tập sinh)
router.delete('/:id/documents/:docType', authenticate, requirePermission('profile_manage', 3), internController.deleteDocument);

module.exports = router;
