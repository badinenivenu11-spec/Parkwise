const express = require('express');
const router = express.Router();
const asyncHandler = require('../middleware/asyncHandler');
const User = require('../models/User');
const { demoAuth, requireRole } = require('../middleware/demoAuth');

router.get('/', demoAuth, requireRole('admin'), asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const total = await User.countDocuments();
  const users = await User.find().select('-__v').sort({ createdAt: -1 })
    .skip((parseInt(page)-1)*parseInt(limit)).limit(parseInt(limit));
  res.json({ success: true, total, users });
}));

router.put('/profile', demoAuth, asyncHandler(async (req, res) => {
  const { name, phone, avatar, notificationPrefs } = req.body;
  const user = await User.findByIdAndUpdate(req.user._id, { name, phone, avatar, notificationPrefs }, { new: true });
  res.json({ success: true, user });
}));

router.get('/favorites', demoAuth, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('favoritesFacilities', 'name address coverImage availableSlots pricingRules amenities rating reviewCount');
  res.json({ success: true, favorites: user.favoritesFacilities });
}));

router.put('/:id/toggle', demoAuth, requireRole('admin'), asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  user.isActive = !user.isActive;
  await user.save();
  res.json({ success: true, user });
}));

router.put('/:id/role', demoAuth, requireRole('admin'), asyncHandler(async (req, res) => {
  const { role } = req.body;
  const valid = ['driver', 'operator', 'admin'];
  if (!valid.includes(role)) return res.status(400).json({ success: false, message: 'Invalid role' });
  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, user });
}));

// Admin Delete User Account
router.delete('/:id', demoAuth, requireRole('admin'), asyncHandler(async (req, res) => {
  if (req.user._id.toString() === req.params.id) {
    return res.status(400).json({ success: false, message: 'You cannot delete your own active administrator account' });
  }
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  await User.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: `User account ${user.email} permanently deleted` });
}));

module.exports = router;
