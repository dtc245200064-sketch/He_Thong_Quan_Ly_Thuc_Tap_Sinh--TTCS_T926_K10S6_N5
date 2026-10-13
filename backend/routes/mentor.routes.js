const express = require('express');
const router = express.Router();
const mentorController = require('../controllers/mentor.controller');

router.get('/available-users', mentorController.getAvailableMentorUsers);
router.get('/', mentorController.getMentors);
router.post('/', mentorController.createMentor);
router.put('/:id', mentorController.updateMentor);
router.delete('/:id', mentorController.deleteMentor);
router.post('/assign', mentorController.assignMentor);

module.exports = router;
