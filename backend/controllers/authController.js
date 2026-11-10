const asyncHandler = require('../middleware/asyncHandler');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Demo login / register
// @route   POST /api/auth/demo-login
// @access  Public
// NOTE: This is a demonstration-only identity system. Not secure for production.
// Production deployment would require JWT, bcrypt, and server-side RBAC.
exports.demoLogin = asyncHandler(async (req, res) => {
  const { email, name, role } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }
  const validRoles = ['driver', 'operator', 'admin'];
  const userRole = validRoles.includes(role) ? role : 'driver';

  let user = await User.findOne({ email: email.toLowerCase() });
  let isNew = false;

  if (!user) {
    isNew = true;
    user = await User.create({
      email: email.toLowerCase(),
      name: name || email.split('@')[0],
      role: userRole
    });
    await Notification.create({
      user: user._id,
      type: 'system',
      title: 'Welcome to ParkEase!',
      message: `Welcome ${user.name}! Your demo account is ready. Start by searching for parking or exploring the dashboard.`
    });
  } else {
    if (role && validRoles.includes(role) && user.role !== role) {
      user.role = role;
    }
    user.lastLogin = new Date();
    await user.save();
  }

  res.json({
    success: true,
    message: isNew ? 'Demo account created' : 'Demo login successful',
    user: {
      _id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin
    },
    demoNote: 'DEMO ONLY — not a secure token. Production use requires proper auth.'
  });
});

// @desc    Switch demo role
// @route   PUT /api/auth/switch-role
exports.switchRole = asyncHandler(async (req, res) => {
  const { email, role } = req.body;
  const validRoles = ['driver', 'operator', 'admin'];
  if (!email || !role || !validRoles.includes(role)) {
    return res.status(400).json({ success: false, message: 'Valid email and role required' });
  }
  const user = await User.findOneAndUpdate(
    { email: email.toLowerCase() },
    { role },
    { new: true }
  );
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, user: { _id: user._id, email: user.email, name: user.name, role: user.role } });
});

// @desc    Get current demo user
// @route   GET /api/auth/me
exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('favoritesFacilities', 'name address coverImage availableSlots');
  res.json({ success: true, user });
});
