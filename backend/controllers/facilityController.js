const mongoose = require('mongoose');
const asyncHandler = require('../middleware/asyncHandler');
const Facility = require('../models/Facility');
const Slot = require('../models/Slot');
const Review = require('../models/Review');
const User = require('../models/User');
const Reservation = require('../models/Reservation');

exports.getFacilities = asyncHandler(async (req, res) => {
  const {
    city, name, vehicleType, covered, evCharging, accessible, security,
    minPrice, maxPrice, facilityType, available, sortBy, page = 1, limit = 12
  } = req.query;

  let query = { isActive: true };
  if (city) query['address.city'] = { $regex: city, $options: 'i' };
  if (name) query.name = { $regex: name, $options: 'i' };
  if (facilityType) query.facilityType = facilityType;
  if (vehicleType) query.supportedVehicleTypes = vehicleType;
  if (covered === 'true') query['amenities.covered'] = true;
  if (evCharging === 'true') query['amenities.evCharging'] = true;
  if (accessible === 'true') query['amenities.accessible'] = true;
  if (security === 'true') query['amenities.security'] = true;
  if (available === 'true') query.availableSlots = { $gt: 0 };
  if (minPrice || maxPrice) {
    const pf = {};
    if (minPrice) pf.$gte = parseFloat(minPrice);
    if (maxPrice) pf.$lte = parseFloat(maxPrice);
    query['pricingRules.baseRate'] = pf;
  }

  let sort = {};
  switch (sortBy) {
    case 'price_asc':    sort = { 'pricingRules.0.baseRate': 1 }; break;
    case 'price_desc':   sort = { 'pricingRules.0.baseRate': -1 }; break;
    case 'availability': sort = { availableSlots: -1 }; break;
    case 'rating':       sort = { rating: -1 }; break;
    case 'name':         sort = { name: 1 }; break;
    default:             sort = { rating: -1, createdAt: -1 };
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Facility.countDocuments(query);
  const facilities = await Facility.find(query)
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit))
    .populate('operator', 'name email');

  res.json({ success: true, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)), facilities });
});

exports.getFacility = asyncHandler(async (req, res) => {
  const facility = await Facility.findById(req.params.id).populate('operator', 'name email phone');
  if (!facility) return res.status(404).json({ success: false, message: 'Facility not found' });

  const objId = new mongoose.Types.ObjectId(facility._id.toString());
  const slotSummary = await Slot.aggregate([
    { $match: { facility: objId } },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);
  const reviews = await Review.find({ facility: facility._id })
    .populate('user', 'name avatar')
    .sort({ createdAt: -1 })
    .limit(10);

  res.json({ success: true, facility, slotSummary, reviews });
});

exports.createFacility = asyncHandler(async (req, res) => {
  const facility = await Facility.create({ ...req.body, operator: req.user._id });
  if (req.body.generateSlots && facility.totalSlots > 0) {
    const sections = ['A', 'B', 'C', 'D'];
    const slots = [];
    let count = 0;
    for (const section of sections) {
      if (count >= facility.totalSlots) break;
      const n = Math.min(Math.ceil(facility.totalSlots / sections.length), facility.totalSlots - count);
      for (let i = 1; i <= n; i++) {
        slots.push({
          facility: facility._id,
          slotNumber: `${section}${String(i).padStart(2,'0')}`,
          section,
          supportedVehicleTypes: facility.supportedVehicleTypes || ['car'],
          status: 'available'
        });
        count++;
        if (count >= facility.totalSlots) break;
      }
    }
    await Slot.insertMany(slots);
    await Facility.findByIdAndUpdate(facility._id, { availableSlots: facility.totalSlots });
  }
  res.status(201).json({ success: true, facility });
});

exports.updateFacility = asyncHandler(async (req, res) => {
  let facility = await Facility.findById(req.params.id);
  if (!facility) return res.status(404).json({ success: false, message: 'Facility not found' });

  // Admin has god-mode; operator can only edit their own
  if (req.user.role !== 'admin' && facility.operator.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Not authorized to edit this facility' });
  }

  facility = await Facility.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  res.json({ success: true, facility });
});

exports.deleteFacility = asyncHandler(async (req, res) => {
  const facility = await Facility.findById(req.params.id);
  if (!facility) return res.status(404).json({ success: false, message: 'Facility not found' });

  // Admin or assigned operator
  if (req.user.role !== 'admin' && facility.operator.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Not authorized to delete this facility' });
  }

  const { permanent } = req.query;
  // If permanent delete is requested or user is admin
  if (permanent === 'true' || req.user.role === 'admin') {
    // Delete all slots in this facility
    await Slot.deleteMany({ facility: facility._id });
    // Cancel any active reservations in this facility
    await Reservation.updateMany(
      { facility: facility._id, status: { $in: ['confirmed', 'checked_in'] } },
      { status: 'cancelled', cancellationReason: 'Facility permanently removed by administrator' }
    );
    await Facility.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: `Facility "${facility.name}" and all associated slots permanently deleted` });
  }

  await Facility.findByIdAndUpdate(req.params.id, { isActive: false });
  res.json({ success: true, message: 'Facility deactivated' });
});

// @desc    Get facilities for current user (Operators see assigned, Admins see all)
// @route   GET /api/facilities/my
exports.getMyFacilities = asyncHandler(async (req, res) => {
  let query = {};
  if (req.user && req.user.role === 'operator') {
    query = { operator: req.user._id };
  }
  const facilities = await Facility.find(query).sort({ name: 1 });
  res.json({ success: true, facilities });
});

exports.toggleFavorite = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const fid = req.params.id;
  const idx = user.favoritesFacilities.findIndex(id => id.toString() === fid);
  let isFavorite;
  if (idx === -1) { user.favoritesFacilities.push(fid); isFavorite = true; }
  else { user.favoritesFacilities.splice(idx, 1); isFavorite = false; }
  await user.save();
  res.json({ success: true, isFavorite, favorites: user.favoritesFacilities });
});

exports.getRecommendations = asyncHandler(async (req, res) => {
  const { vehicleType, city, duration = 2, covered, evCharging } = req.query;
  let query = { isActive: true, availableSlots: { $gt: 0 } };
  if (city) query['address.city'] = { $regex: city, $options: 'i' };
  if (vehicleType) query.supportedVehicleTypes = vehicleType;
  if (covered === 'true') query['amenities.covered'] = true;
  if (evCharging === 'true') query['amenities.evCharging'] = true;

  const facilities = await Facility.find(query).limit(20);
  const scored = facilities.map(f => {
    let score = 0; const reasons = [];
    const r = f.availableSlots / (f.totalSlots || 1);
    if (r > 0.5) { score += 30; reasons.push('Good slot availability'); }
    else if (r > 0.2) { score += 15; reasons.push('Limited slots'); }
    const p = f.pricingRules.find(x => !vehicleType || x.vehicleType === vehicleType) || f.pricingRules[0];
    if (p) { const est = p.baseRate * parseFloat(duration); score += Math.max(0, 50 - est * 0.5); reasons.push(`Est. ₹${est.toFixed(0)} for ${duration}h`); }
    if (f.amenities.covered)    { score += 10; reasons.push('Covered parking'); }
    if (f.amenities.evCharging) { score += 8;  reasons.push('EV charging available'); }
    if (f.amenities.security)   { score += 8;  reasons.push('Security on-site'); }
    if (f.rating >= 4)  { score += 15; reasons.push(`Rated ${f.rating}/5`); }
    else if (f.rating >= 3) { score += 8; }
    return { facility: f, score, reasons: reasons.slice(0, 3) };
  });
  scored.sort((a, b) => b.score - a.score);
  res.json({ success: true, recommendations: scored.slice(0, 6) });
});
