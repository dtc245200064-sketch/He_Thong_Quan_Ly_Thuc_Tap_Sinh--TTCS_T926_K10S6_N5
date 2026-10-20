const express = require('express');
const router = express.Router();
const mentorController = require('../controllers/mentor.controller');
const { authenticate, requirePermission } = require('../middleware/auth');

router.get('/available-users', authenticate, mentorController.getAvailableMentorUsers);
router.get('/', authenticate, mentorController.getMentors);
router.post('/', authenticate, requirePermission('profile_manage', 1), mentorController.createMentor);
router.put('/:id', authenticate, requirePermission('profile_manage', 2), mentorController.updateMentor);
router.delete('/:id', authenticate, requirePermission('profile_manage', 3), mentorController.deleteMentor);
router.post('/assign', authenticate, requirePermission('profile_manage', 2), mentorController.assignMentor);

module.exports = router;
