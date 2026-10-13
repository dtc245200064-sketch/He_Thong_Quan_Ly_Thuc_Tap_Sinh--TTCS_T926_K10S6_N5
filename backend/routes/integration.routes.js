const express = require('express');
const router = express.Router();
const integrationController = require('../controllers/integration.controller');

router.get('/', integrationController.getIntegrations);
router.put('/:type', integrationController.updateIntegration);
router.post('/hrm/sync', integrationController.syncHRM);
router.post('/qr-attendance/checkin', integrationController.simulateQRCheckIn);

module.exports = router;
