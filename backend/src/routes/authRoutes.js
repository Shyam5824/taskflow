// authRoutes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/authController');
const { requireAuth } = require('../middleware/authGuard');

router.post('/register', ctrl.register);
router.post('/login', ctrl.login);
router.get('/me', requireAuth, ctrl.getMe);
router.post('/forgot-password', ctrl.forgotPassword);
router.patch('/reset-password/:token', ctrl.resetPassword);

module.exports = router;
