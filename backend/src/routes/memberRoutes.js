// memberRoutes.js
const express = require('express');
const router = express.Router();
const Account = require('../models/Account');
const { requireAuth, requireAdmin } = require('../middleware/authGuard');

router.use(requireAuth, requireAdmin);

router.get('/', async (req, res) => {
  const members = await Account.find().select('-passwordHash').sort({ createdAt: -1 });
  res.json({ success: true, members });
});

router.patch('/:id/role', async (req, res) => {
  const account = await Account.findByIdAndUpdate(
    req.params.id,
    { accountRole: req.body.accountRole },
    { new: true }
  ).select('-passwordHash');
  res.json({ success: true, account });
});

module.exports = router;
