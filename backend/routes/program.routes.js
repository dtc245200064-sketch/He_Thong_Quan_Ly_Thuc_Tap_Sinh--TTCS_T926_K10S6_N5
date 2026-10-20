const express = require('express');
const router = express.Router();
const programController = require('../controllers/program.controller');
const { authenticate, requirePermission } = require('../middleware/auth');

router.get('/', authenticate, programController.getPrograms);
router.post('/', authenticate, requirePermission('profile_manage', 1), programController.createProgram);
router.put('/:id', authenticate, requirePermission('profile_manage', 2), programController.updateProgram);
router.delete('/:id', authenticate, requirePermission('profile_manage', 3), programController.deleteProgram);

module.exports = router;
