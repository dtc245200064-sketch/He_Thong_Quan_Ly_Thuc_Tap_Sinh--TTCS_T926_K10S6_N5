const express = require('express');
const router = express.Router();
const integrationController = require('../controllers/integration.controller');
const { authenticate, requirePermission } = require('../middleware/auth');

router.get('/', authenticate, requirePermission('perm_system', 0), integrationController.getIntegrations);
router.put('/:type', authenticate, requirePermission('perm_system', 2), integrationController.updateIntegration);
router.post('/hrm/sync', authenticate, requirePermission('perm_system', 2), integrationController.syncHRM);
router.post('/qr-card/simulate', authenticate, requirePermission('perm_system', 2), integrationController.simulateQRCheckIn);

module.exports = router;
