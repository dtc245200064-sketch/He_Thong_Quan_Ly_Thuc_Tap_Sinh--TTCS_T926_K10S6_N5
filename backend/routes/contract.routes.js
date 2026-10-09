const express = require('express');
const router = express.Router();
const contractController = require('../controllers/contract.controller');
const upload = require('../middleware/upload');

router.get('/', contractController.getContracts);
router.post('/', upload.single('file'), contractController.createContract);
router.patch('/:id/confirm', contractController.confirmContract);
router.delete('/:id', contractController.deleteContract);

module.exports = router;

