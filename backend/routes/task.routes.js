const express = require('express');
const router = express.Router();
const taskController = require('../controllers/task.controller');

router.get('/', taskController.getTasks);
router.post('/', taskController.createTask);
router.put('/:id', taskController.updateTask);
router.put('/:id/progress', taskController.updateTaskProgress);
router.put('/:id/feedback', taskController.feedbackTask);
router.delete('/:id', taskController.deleteTask);

module.exports = router;
