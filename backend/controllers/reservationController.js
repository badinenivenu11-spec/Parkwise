const asyncHandler = require('../middleware/asyncHandler');
const Reservation = require('../models/Reservation');
const Facility = require('../models/Facility');
const Slot = require('../models/Slot');
const Vehicle = require('../models/Vehicle');
const Notification = require('../models/Notification');
const { updateFacilitySlotCounts } = require('./slotController');

/**
 * Server-side price calculation — never trust the frontend price.
 */
const calculatePrice = (facility, vehicleType, durationHours) => {
  const pricing =
    facility.pricingRules.find(p => p.vehicleType === vehicleType) ||
    facility.pricingRules[0];

  if (!pricing) {
    const fallback = 50 * durationHours;
    return { baseRate: 50, rateType: 'hourly', estimatedTotal: fallback, breakdown: [{ label: 'Parking', amount: fallback }] };
  }

  let total = 0;
  const breakdown = [];

  if (pricing.rateType === 'hourly') {
    const cost = pricing.baseRate * durationHours;
    total = cost;
    breakdown.push({ label: `Parking (₹${pricing.baseRate}/hr × ${durationHours}h)`, amount: cost });
  } else if (pricing.rateType === 'daily') {
    const days = Math.ceil(durationHours / 24);
    total = pricing.baseRate * days;
    breakdown.push({ label: `Daily parking (₹${pricing.baseRate}/day × ${days} day)`, amount: total });
  } else {
    total = pricing.baseRate;
    breakdown.push({ label: 'Fixed rate', amount: total });
  }

  if (pricing.minimumCharge && total < pricing.minimumCharge) {
    breakdown.push({ label: 'Minimum charge adjustment', amount: pricing.minimumCharge - total });
    total = pricing.minimumCharge;
  }
  if (pricing.maximumDailyCharge && total > pricing.maximumDailyCharge) {
    const excess = total - pricing.maximumDailyCharge;
    breakdown.push({ label: 'Maximum daily charge cap', amount: -excess });
    total = pricing.maximumDailyCharge;
  }

  return {
    baseRate: pricing.baseRate,
    rateType: pricing.rateType,
    estimatedTotal: Math.round(total * 100) / 100,
    breakdown
  };
};

// @desc    Create reservation
// @route   POST /api/reservations
exports.createReservation = asyncHandler(async (req, res) => {
  const { facilityId, slotId, vehicleId, startTime, durationHours } = req.body;

  if (!facilityId || !startTime || !durationHours) {
    return res.status(400).json({ success: false, message: 'Facility, start time, and duration are required' });
  }

  const startDate = new Date(startTime);
  if (startDate < new Date(Date.now() - 5 * 60 * 1000)) {
    return res.status(400).json({ success: false, message: 'Start time cannot be in the past' });
  }

  const endDate = new Date(startDate.getTime() + parseFloat(durationHours) * 60 * 60 * 1000);

  const facility = await Facility.findById(facilityId);
  if (!facility || !facility.isActive) {
    return res.status(404).json({ success: false, message: 'Facility not found or inactive' });
  }

  let vehicle = null;
  let vehicleSnapshot = null;
  if (vehicleId) {
    vehicle = await Vehicle.findById(vehicleId);
    if (vehicle) {
      vehicleSnapshot = {
        registrationNumber: vehicle.registrationNumber,
        vehicleType: vehicle.vehicleType,
        make: vehicle.make,
        model: vehicle.model,
        color: vehicle.color
      };
    }
  }

  const vehicleType = vehicleSnapshot?.vehicleType || req.body.vehicleType || 'car';

  let slot = null;
  if (slotId) {
    slot = await Slot.findById(slotId);
    if (!slot || slot.facility.toString() !== facilityId) {
      return res.status(400).json({ success: false, message: 'Invalid slot for this facility' });
    }
    if (slot.status !== 'available') {
      return res.status(400).json({ success: false, message: `Slot ${slot.slotNumber} is not available` });
    }
    // Check for overlapping active reservations on this slot
    const overlap = await Reservation.findOne({
      slot: slotId,
      status: { $in: ['confirmed', 'checked_in'] },
      startTime: { $lt: endDate },
      expectedEndTime: { $gt: startDate }
    });
    if (overlap) {
      return res.status(409).json({ success: false, message: `Slot ${slot.slotNumber} is already reserved for the requested time` });
    }
  } else {
    if (facility.availableSlots <= 0) {
      return res.status(400).json({ success: false, message: 'No available slots in this facility' });
    }
    // Try matching vehicle type first, then any available slot
    slot = await Slot.findOne({ facility: facilityId, status: 'available', supportedVehicleTypes: vehicleType });
    if (!slot) {
      slot = await Slot.findOne({ facility: facilityId, status: 'available' });
    }
    if (!slot) {
      return res.status(400).json({ success: false, message: 'No available slots found' });
    }
  }

  const pricingResult = calculatePrice(facility, vehicleType, parseFloat(durationHours));

  const reservation = await Reservation.create({
    user: req.user._id,
    facility: facilityId,
    slot: slot._id,
    vehicle: vehicleId || null,
    vehicleSnapshot,
    startTime: startDate,
    expectedEndTime: endDate,
    durationHours: parseFloat(durationHours),
    pricing: pricingResult,
    status: 'confirmed'
  });

  await Slot.findByIdAndUpdate(slot._id, {
    status: 'reserved',
    currentReservation: reservation._id,
    lastUpdated: new Date()
  });

  await updateFacilitySlotCounts(facility._id);

  await Notification.create({
    user: req.user._id,
    type: 'reservation_confirmed',
    title: 'Reservation Confirmed!',
    message: `Your parking at ${facility.name} has been confirmed. Reference: ${reservation.reservationRef}`,
    relatedReservation: reservation._id,
    relatedFacility: facility._id
  });

  const populated = await Reservation.findById(reservation._id)
    .populate('facility', 'name address coverImage')
    .populate('slot', 'slotNumber section')
    .populate('vehicle');

  res.status(201).json({ success: true, reservation: populated });
});

// @desc    Get authenticated user's reservations
// @route   GET /api/reservations/my
exports.getMyReservations = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const query = { user: req.user._id };
  if (status) query.status = status;

  const total = await Reservation.countDocuments(query);
  const reservations = await Reservation.find(query)
    .sort({ createdAt: -1 })
    .skip((parseInt(page) - 1) * parseInt(limit))
    .limit(parseInt(limit))
    .populate('facility', 'name address coverImage amenities')
    .populate('slot', 'slotNumber section floor')
    .populate('vehicle');

  res.json({
    success: true,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    reservations
  });
});

// @desc    Get all reservations (operator sees own facilities, admin sees all)
// @route   GET /api/reservations
exports.getAllReservations = asyncHandler(async (req, res) => {
  const { status, facilityId, page = 1, limit = 20 } = req.query;
  let query = {};

  if (req.user.role === 'operator') {
    const myFacilities = await Facility.find({ operator: req.user._id }, '_id');
    query.facility = { $in: myFacilities.map(f => f._id) };
  }

  if (status) query.status = status;
  if (facilityId) query.facility = facilityId;

  const total = await Reservation.countDocuments(query);
  const reservations = await Reservation.find(query)
    .sort({ createdAt: -1 })
    .skip((parseInt(page) - 1) * parseInt(limit))
    .limit(parseInt(limit))
    .populate('facility', 'name address')
    .populate('user', 'name email')
    .populate('slot', 'slotNumber section')
    .populate('vehicle');

  res.json({
    success: true,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    reservations
  });
});

// @desc    Get single reservation by id or reservationRef
// @route   GET /api/reservations/:id
exports.getReservation = asyncHandler(async (req, res) => {
  const idOrRef = req.params.id;
  // If looks like an ObjectId, try both, otherwise treat as ref
  const query = idOrRef.length === 24
    ? { $or: [{ _id: idOrRef }, { reservationRef: idOrRef.toUpperCase() }] }
    : { reservationRef: idOrRef.toUpperCase() };

  const reservation = await Reservation.findOne(query)
    .populate('facility', 'name address coverImage amenities operatingHours entryInstructions cancellationPolicy')
    .populate('slot', 'slotNumber section floor hasEvCharging isAccessible')
    .populate('vehicle')
    .populate('user', 'name email phone');

  if (!reservation) return res.status(404).json({ success: false, message: 'Reservation not found' });
  res.json({ success: true, reservation });
});

// @desc    Check in
// @route   PUT /api/reservations/:id/checkin
exports.checkIn = asyncHandler(async (req, res) => {
  const reservation = await Reservation.findById(req.params.id);
  if (!reservation) return res.status(404).json({ success: false, message: 'Reservation not found' });

  if (reservation.status !== 'confirmed') {
    return res.status(400).json({ success: false, message: `Cannot check in a ${reservation.status} reservation` });
  }

  reservation.status = 'checked_in';
  reservation.actualCheckInTime = new Date();
  await reservation.save();

  await Slot.findByIdAndUpdate(reservation.slot, { status: 'occupied', lastUpdated: new Date() });
  await updateFacilitySlotCounts(reservation.facility);

  await Notification.create({
    user: reservation.user,
    type: 'system',
    title: 'Checked In',
    message: `You have been checked in. Enjoy your parking session! Ref: ${reservation.reservationRef}`,
    relatedReservation: reservation._id
  });

  res.json({ success: true, reservation });
});

// @desc    Check out
// @route   PUT /api/reservations/:id/checkout
exports.checkOut = asyncHandler(async (req, res) => {
  const reservation = await Reservation.findById(req.params.id).populate('facility');
  if (!reservation) return res.status(404).json({ success: false, message: 'Reservation not found' });

  if (reservation.status !== 'checked_in') {
    return res.status(400).json({ success: false, message: `Cannot check out a ${reservation.status} reservation` });
  }

  const checkOutTime = new Date();
  const checkInTime = reservation.actualCheckInTime || reservation.startTime;
  const actualDurationHours = (checkOutTime - checkInTime) / (1000 * 60 * 60);
  const vehicleType = reservation.vehicleSnapshot?.vehicleType || 'car';
  const pricingResult = calculatePrice(reservation.facility, vehicleType, actualDurationHours);

  reservation.status = 'completed';
  reservation.actualCheckOutTime = checkOutTime;
  reservation.durationHours = Math.round(actualDurationHours * 100) / 100;
  reservation.pricing.finalTotal = pricingResult.estimatedTotal;
  await reservation.save();

  await Slot.findByIdAndUpdate(reservation.slot, { status: 'available', currentReservation: null, lastUpdated: new Date() });
  await updateFacilitySlotCounts(reservation.facility._id);

  await Notification.create({
    user: reservation.user,
    type: 'system',
    title: 'Parking Session Complete',
    message: `Your parking session at ${reservation.facility.name} is complete. Total: ₹${pricingResult.estimatedTotal.toFixed(2)}. Ref: ${reservation.reservationRef}`,
    relatedReservation: reservation._id
  });

  const populated = await Reservation.findById(reservation._id)
    .populate('facility', 'name address')
    .populate('slot', 'slotNumber')
    .populate('vehicle');

  res.json({ success: true, reservation: populated, finalCharge: pricingResult.estimatedTotal });
});

// @desc    Cancel reservation
// @route   PUT /api/reservations/:id/cancel
exports.cancelReservation = asyncHandler(async (req, res) => {
  const reservation = await Reservation.findById(req.params.id);
  if (!reservation) return res.status(404).json({ success: false, message: 'Reservation not found' });

  if (['completed', 'cancelled'].includes(reservation.status)) {
    return res.status(400).json({ success: false, message: `Cannot cancel a ${reservation.status} reservation` });
  }

  reservation.status = 'cancelled';
  reservation.cancellationReason = req.body.reason || 'Cancelled by user';
  reservation.cancelledAt = new Date();
  await reservation.save();

  if (reservation.slot) {
    await Slot.findByIdAndUpdate(reservation.slot, { status: 'available', currentReservation: null, lastUpdated: new Date() });
    await updateFacilitySlotCounts(reservation.facility);
  }

  await Notification.create({
    user: reservation.user,
    type: 'reservation_cancelled',
    title: 'Reservation Cancelled',
    message: `Your reservation ${reservation.reservationRef} has been cancelled.`,
    relatedReservation: reservation._id
  });

  res.json({ success: true, reservation });
});

// @desc    Extend reservation duration
// @route   PUT /api/reservations/:id/extend
exports.extendReservation = asyncHandler(async (req, res) => {
  const { additionalHours } = req.body;
  if (!additionalHours || parseFloat(additionalHours) <= 0) {
    return res.status(400).json({ success: false, message: 'additionalHours must be a positive number' });
  }

  const reservation = await Reservation.findById(req.params.id).populate('facility');
  if (!reservation) return res.status(404).json({ success: false, message: 'Reservation not found' });

  if (!['confirmed', 'checked_in'].includes(reservation.status)) {
    return res.status(400).json({ success: false, message: 'Only active reservations can be extended' });
  }

  const newEndTime = new Date(reservation.expectedEndTime.getTime() + parseFloat(additionalHours) * 60 * 60 * 1000);

  // Check for overlapping reservations on same slot after extension
  const overlap = await Reservation.findOne({
    slot: reservation.slot,
    status: { $in: ['confirmed', 'checked_in'] },
    _id: { $ne: reservation._id },
    startTime: { $lt: newEndTime },
    expectedEndTime: { $gt: reservation.expectedEndTime }
  });
  if (overlap) {
    return res.status(409).json({
      success: false,
      message: 'Cannot extend — the slot is reserved by another booking after your current end time'
    });
  }

  const vehicleType = reservation.vehicleSnapshot?.vehicleType || 'car';
  const newDuration = reservation.durationHours + parseFloat(additionalHours);
  const pricingResult = calculatePrice(reservation.facility, vehicleType, newDuration);

  reservation.expectedEndTime = newEndTime;
  reservation.durationHours = newDuration;
  reservation.pricing.estimatedTotal = pricingResult.estimatedTotal;
  reservation.pricing.breakdown = pricingResult.breakdown;
  await reservation.save();

  res.json({ success: true, reservation, newEndTime });
});

// @desc    Permanently delete reservation record (Admin only)
// @route   DELETE /api/reservations/:id
exports.deleteReservation = asyncHandler(async (req, res) => {
  const reservation = await Reservation.findById(req.params.id);
  if (!reservation) return res.status(404).json({ success: false, message: 'Reservation not found' });

  // If slot was held, release it back to available
  if (reservation.slot && ['confirmed', 'checked_in'].includes(reservation.status)) {
    await Slot.findByIdAndUpdate(reservation.slot, {
      status: 'available',
      currentReservation: null,
      lastUpdated: new Date()
    });
    await updateFacilitySlotCounts(reservation.facility);
  }

  await Reservation.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: `Reservation record ${reservation.reservationRef} permanently deleted` });
});
