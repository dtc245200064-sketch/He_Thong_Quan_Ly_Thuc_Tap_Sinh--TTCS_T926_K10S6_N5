const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, reportController.getWeeklyReports);
router.get('/weekly', authenticate, reportController.getWeeklyReports);
router.post('/weekly', authenticate, reportController.submitWeeklyReport);
router.put('/weekly/:id', authenticate, reportController.updateWeeklyReport);
router.delete('/weekly/:id', authenticate, reportController.deleteWeeklyReport);
router.put('/weekly/:id/feedback', authenticate, reportController.feedbackWeeklyReport);
router.get('/statistics/demographics', authenticate, reportController.getStatisticsDemographics);
router.get('/statistics/completion', authenticate, reportController.getStatisticsCompletion);
router.get('/statistics/departments', authenticate, reportController.getStatisticsDepartments);

module.exports = router;
