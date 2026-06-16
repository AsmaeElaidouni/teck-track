const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Public
router.post('/', requestController.createRequest);

// Admin Only
router.get('/', authMiddleware, adminMiddleware, requestController.getRequests);
router.patch('/:id/approve', authMiddleware, adminMiddleware, requestController.approveRequest);
router.delete('/:id', authMiddleware, adminMiddleware, requestController.rejectRequest);

module.exports = router;
