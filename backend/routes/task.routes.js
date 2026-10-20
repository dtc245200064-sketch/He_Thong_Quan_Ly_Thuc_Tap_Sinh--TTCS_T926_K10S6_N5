const express = require('express');
const router = express.Router();
const taskController = require('../controllers/task.controller');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, taskController.getTasks);
router.post('/', authenticate, taskController.createTask);
router.put('/:id', authenticate, taskController.updateTask);
router.put('/:id/progress', authenticate, taskController.updateTaskProgress);
router.delete('/:id', authenticate, taskController.deleteTask);

module.exports = router;
