const express = require('express');
const router = express.Router();
const internController = require('../controllers/intern.controller');

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

module.exports = router;
