const express = require('express');
const {
    createTicket,
    getTickets,
    getTicketById,
    assignTechnician,
    updateTicketStatus,
    addConsumption,
    addComment
} = require('../controllers/ticketController');
const { authMiddleware, adminMiddleware, techMiddleware } = require('../middleware/auth');
const router = express.Router();

router.use(authMiddleware);

router.post('/', createTicket);                          // any auth
router.get('/', getTickets);                             // any auth (role-scoped)
router.get('/:id', getTicketById);                      // any auth (role-scoped)
router.patch('/:id/assign', adminMiddleware, assignTechnician);   // admin only
router.patch('/:id/status', updateTicketStatus);        // tech (verified inside)
router.post('/:id/consume', addConsumption);            // tech (verified inside)
router.post('/:id/comment', addComment);                // employee (verified inside)

module.exports = router;
