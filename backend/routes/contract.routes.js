const express = require('express');
const router = express.Router();
const contractController = require('../controllers/contract.controller');

router.get('/', contractController.getContracts);
router.post('/', contractController.createContract);
router.patch('/:id/confirm', contractController.confirmContract);

module.exports = router;
