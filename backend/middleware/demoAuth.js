// Demo authentication middleware — NOT production-secure.
// In production, replace with JWT verification and server-side RBAC.
const asyncHandler = require('./asyncHandler');
const User = require('../models/User');

const demoAuth = asyncHandler(async (req, res, next) => {
  const email = req.headers['x-demo-email'];
  if (!email) {
    return res.status(401).json({ success: false, message: 'Demo email header required' });
  }
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return res.status(401).json({ success: false, message: 'Demo user not found. Please login first.' });
  }
  req.user = user;
  next();
});

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: `Role '${req.user.role}' is not authorized for this action` });
  }
  next();
};

module.exports = { demoAuth, requireRole };
