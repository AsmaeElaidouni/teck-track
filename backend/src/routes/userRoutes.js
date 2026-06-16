const express = require('express');
const { getUsers, getTechnicians, createUser, deleteUser, updatePassword } = require('../controllers/userController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const router = express.Router();

router.use(authMiddleware);

// Publicly available to any logged-in user
router.put('/update-password', updatePassword);

// Rest below is admin-only
router.use(adminMiddleware);

router.get('/', getUsers);
router.get('/technicians', getTechnicians);
router.post('/', createUser);
router.delete('/:id', deleteUser);

module.exports = router;
