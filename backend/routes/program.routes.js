const express = require('express');
const router = express.Router();
const programController = require('../controllers/program.controller');

router.get('/', programController.getPrograms);
router.post('/', programController.createProgram);
router.put('/:id', programController.updateProgram);
router.delete('/:id', programController.deleteProgram);

module.exports = router;
