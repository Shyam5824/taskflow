const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/analyticsController');
const { requireAuth } = require('../middleware/authGuard');

router.get('/overview', requireAuth, ctrl.getOverview);

module.exports = router;
