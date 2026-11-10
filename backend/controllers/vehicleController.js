const asyncHandler = require('../middleware/asyncHandler');
const Vehicle = require('../models/Vehicle');
const Reservation = require('../models/Reservation');

// @desc    Get all vehicles for authenticated user
// @route   GET /api/vehicles
exports.getVehicles = asyncHandler(async (req, res) => {
  const vehicles = await Vehicle.find({ owner: req.user._id, isActive: true })
    .sort({ isDefault: -1, createdAt: -1 });
  res.json({ success: true, vehicles });
});

// @desc    Get single vehicle
// @route   GET /api/vehicles/:id
exports.getVehicle = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findOne({ _id: req.params.id, owner: req.user._id });
  if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });
  res.json({ success: true, vehicle });
});

// @desc    Add vehicle
// @route   POST /api/vehicles
exports.createVehicle = asyncHandler(async (req, res) => {
  const existingCount = await Vehicle.countDocuments({ owner: req.user._id, isActive: true });

  // First vehicle or explicitly set as default → clear all other defaults first
  if (existingCount === 0 || req.body.isDefault) {
    await Vehicle.updateMany({ owner: req.user._id }, { isDefault: false });
    req.body.isDefault = true;
  }

  const vehicle = await Vehicle.create({ ...req.body, owner: req.user._id });
  res.status(201).json({ success: true, vehicle });
});

// @desc    Update vehicle
// @route   PUT /api/vehicles/:id
exports.updateVehicle = asyncHandler(async (req, res) => {
  let vehicle = await Vehicle.findOne({ _id: req.params.id, owner: req.user._id });
  if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });

  if (req.body.isDefault) {
    await Vehicle.updateMany({ owner: req.user._id }, { isDefault: false });
  }

  vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  res.json({ success: true, vehicle });
});

// @desc    Soft-delete vehicle
// @route   DELETE /api/vehicles/:id
exports.deleteVehicle = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findOne({ _id: req.params.id, owner: req.user._id });
  if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });

  const activeReservation = await Reservation.findOne({
    vehicle: vehicle._id,
    status: { $in: ['confirmed', 'checked_in'] }
  });
  if (activeReservation) {
    return res.status(400).json({
      success: false,
      message: `This vehicle is used in an active reservation (${activeReservation.reservationRef}). Resolve it before deleting.`
    });
  }

  await Vehicle.findByIdAndUpdate(vehicle._id, { isActive: false });
  res.json({ success: true, message: 'Vehicle removed' });
});

// @desc    Set vehicle as default
// @route   PATCH /api/vehicles/:id/default
exports.setDefaultVehicle = asyncHandler(async (req, res) => {
  await Vehicle.updateMany({ owner: req.user._id }, { isDefault: false });
  const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, { isDefault: true }, { new: true });
  if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });
  res.json({ success: true, vehicle });
});
