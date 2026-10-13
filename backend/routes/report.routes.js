const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');

router.get('/', reportController.getWeeklyReports);
router.get('/weekly', reportController.getWeeklyReports);
router.post('/weekly', reportController.submitWeeklyReport);
router.put('/weekly/:id/feedback', reportController.feedbackWeeklyReport);
router.get('/statistics/demographics', reportController.getStatisticsDemographics);
router.get('/statistics/completion', reportController.getStatisticsCompletion);

module.exports = router;
