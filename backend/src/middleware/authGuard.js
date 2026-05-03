const jwt = require('jsonwebtoken');
const Account = require('../models/Account');

const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Access denied. No token.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.currentUser = await Account.findById(decoded.id).select('-passwordHash');
    if (!req.currentUser) {
      return res.status(401).json({ success: false, message: 'Account no longer exists.' });
    }
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token invalid or expired.' });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.currentUser?.accountRole !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access only.' });
  }
  next();
};

module.exports = { requireAuth, requireAdmin };
