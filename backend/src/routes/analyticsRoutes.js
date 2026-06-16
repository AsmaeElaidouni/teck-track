const express = require('express');
const { getStats, getAiPrediction } = require('../controllers/analyticsController');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

router.get('/stats', authMiddleware, getStats);
router.get('/ai-predict', authMiddleware, getAiPrediction);

module.exports = router;
