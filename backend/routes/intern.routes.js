const express = require('express');
const router = express.Router();
const internController = require('../controllers/intern.controller');

const upload = require('../middleware/upload');

// 1. GET /api/interns
router.get('/', internController.getInterns);

// 2. POST /api/interns
router.post('/', internController.createIntern);

// 3. PUT /api/interns/:id
router.put('/:id', internController.updateIntern);

// 4. GET /api/interns/:id/documents
router.get('/:id/documents', internController.getInternDocuments);

// 5. PATCH /api/interns/:id/documents/status
router.patch('/:id/documents/status', internController.updateDocumentStatus);

// 6. POST /api/interns/:id/documents (Tải lên file tài liệu)
router.post('/:id/documents', upload.single('file'), internController.uploadDocument);

// 7. DELETE /api/interns/:id (Xóa thực tập sinh)
router.delete('/:id', internController.deleteIntern);

// 8. DELETE /api/interns/:id/documents/:docType (Xóa tài liệu của thực tập sinh)
router.delete('/:id/documents/:docType', internController.deleteDocument);

module.exports = router;
