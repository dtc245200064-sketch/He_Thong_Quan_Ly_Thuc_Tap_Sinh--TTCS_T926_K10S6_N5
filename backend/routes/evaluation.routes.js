const express = require('express');
const router = express.Router();
const evalController = require('../controllers/evaluation.controller');

router.get('/', evalController.getAllEvaluations);
router.get('/intern/:internId', evalController.getEvaluationByIntern);
router.post('/', evalController.saveEvaluation);

module.exports = router;
