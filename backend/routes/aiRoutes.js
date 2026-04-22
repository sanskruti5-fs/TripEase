const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

router.post('/generate', aiController.generateItinerary);
router.post('/transport', aiController.generateTransport);

module.exports = router;
