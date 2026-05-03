// ticketRoutes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/ticketController');
const { requireAuth, requireAdmin } = require('../middleware/authGuard');

router.use(requireAuth);

router.get('/', ctrl.listTickets);
router.post('/', requireAdmin, ctrl.createTicket);
router.get('/:id', ctrl.getTicket);
router.patch('/:id', ctrl.updateTicket);
router.post('/:id/comment', ctrl.addComment);
router.delete('/:id', requireAdmin, ctrl.deleteTicket);

module.exports = router;
