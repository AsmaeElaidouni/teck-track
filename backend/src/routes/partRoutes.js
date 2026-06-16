const express = require('express');
const { getParts, addPart, updatePart, getPredictions } = require('../controllers/partController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const router = express.Router();

router.use(authMiddleware);
router.get('/predictions', getPredictions); // Doit être avant /:id si /:id existe
router.get('/', getParts);
router.post('/', adminMiddleware, addPart);
router.put('/:id', adminMiddleware, updatePart);

module.exports = router;
