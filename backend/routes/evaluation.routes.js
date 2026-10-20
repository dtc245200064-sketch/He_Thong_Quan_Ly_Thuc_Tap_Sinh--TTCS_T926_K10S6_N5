const express = require('express');
const router = express.Router();
const evaluationController = require('../controllers/evaluation.controller');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, evaluationController.getAllEvaluations);
router.get('/intern/:internId', authenticate, evaluationController.getEvaluationByIntern);
router.post('/', authenticate, evaluationController.saveEvaluation);

module.exports = router;
