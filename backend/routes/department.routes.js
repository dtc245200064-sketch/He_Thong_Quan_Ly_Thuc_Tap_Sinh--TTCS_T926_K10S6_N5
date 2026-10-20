const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/department.controller');
const { authenticate, requirePermission } = require('../middleware/auth');

router.get('/', authenticate, departmentController.getDepartments);
router.post('/', authenticate, requirePermission('profile_manage', 1), departmentController.createDepartment);
router.put('/:id', authenticate, requirePermission('profile_manage', 2), departmentController.updateDepartment);
router.delete('/:id', authenticate, requirePermission('profile_manage', 3), departmentController.deleteDepartment);

module.exports = router;
