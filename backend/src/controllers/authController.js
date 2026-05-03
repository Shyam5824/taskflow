const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Account = require('../models/Account');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

// POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { displayName, emailAddress, password, accountRole } = req.body;

    const existing = await Account.findOne({ emailAddress });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered.' });
    }

    const account = await Account.create({
      displayName,
      emailAddress,
      passwordHash: password,
      accountRole: accountRole || 'member',
    });

    const token = signToken(account._id);
    res.status(201).json({
      success: true,
      token,
      account: {
        id: account._id,
        displayName: account.displayName,
        emailAddress: account.emailAddress,
        accountRole: account.accountRole,
        avatarInitials: account.avatarInitials,
      },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { emailAddress, password } = req.body;

    const account = await Account.findOne({ emailAddress }).select('+passwordHash');
    if (!account || !(await account.verifyPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    account.lastActiveAt = new Date();
    await account.save({ validateBeforeSave: false });

    const token = signToken(account._id);
    res.json({
      success: true,
      token,
      account: {
        id: account._id,
        displayName: account.displayName,
        emailAddress: account.emailAddress,
        accountRole: account.accountRole,
        avatarInitials: account.avatarInitials,
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  res.json({ success: true, account: req.currentUser });
};

// POST /api/auth/forgot-password
exports.forgotPassword = async (req, res, next) => {
  try {
    const account = await Account.findOne({ emailAddress: req.body.emailAddress });
    if (!account) {
      return res.status(404).json({ success: false, message: 'No account with that email.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    account.resetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    account.resetTokenExpiry = Date.now() + 30 * 60 * 1000; // 30 min
    await account.save({ validateBeforeSave: false });

    // In production, send email here
    res.json({ success: true, message: 'Reset link sent (check console in dev).', devToken: resetToken });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/auth/reset-password/:token
exports.resetPassword = async (req, res, next) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const account = await Account.findOne({
      resetToken: hashedToken,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!account) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token.' });
    }

    account.passwordHash = req.body.password;
    account.resetToken = undefined;
    account.resetTokenExpiry = undefined;
    await account.save();

    res.json({ success: true, message: 'Password updated. Please log in.' });
  } catch (err) {
    next(err);
  }
};
