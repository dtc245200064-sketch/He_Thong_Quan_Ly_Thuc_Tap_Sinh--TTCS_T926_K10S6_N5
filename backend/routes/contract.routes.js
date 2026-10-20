const express = require('express');
const router = express.Router();
const contractController = require('../controllers/contract.controller');
const { authenticate, requirePermission } = require('../middleware/auth');
const { upload, validateMagicBytes } = require('../middleware/upload');

router.get('/', authenticate, contractController.getContracts);
router.post('/', authenticate, requirePermission('profile_manage', 1), upload.single('file'), validateMagicBytes, contractController.createContract);
router.patch('/:id/confirm', authenticate, contractController.confirmContract);
router.delete('/:id', authenticate, requirePermission('profile_manage', 3), contractController.deleteContract);

module.exports = router;
