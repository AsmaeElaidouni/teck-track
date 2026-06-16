const express = require('express');
const { getNotifications, markAsRead } = require('../controllers/notificationController');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

router.use(authMiddleware);

router.get('/', getNotifications);
router.put('/mark-as-read', markAsRead);

module.exports = router;
