const express = require('express');
const router = express.Router();
const programController = require('../controllers/program.controller');

router.get('/', programController.getPrograms);
router.post('/', programController.createProgram);

module.exports = router;
