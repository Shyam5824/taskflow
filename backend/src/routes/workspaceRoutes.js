const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/workspaceController');
const { requireAuth, requireAdmin } = require('../middleware/authGuard');

router.use(requireAuth);

router.get('/', ctrl.listWorkspaces);
router.post('/', requireAdmin, ctrl.createWorkspace);
router.get('/:id', ctrl.getWorkspace);
router.patch('/:id', requireAdmin, ctrl.updateWorkspace);
router.delete('/:id', requireAdmin, ctrl.deleteWorkspace);
router.post('/:id/invite', requireAdmin, ctrl.inviteMember);

module.exports = router;
