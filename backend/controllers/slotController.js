const mongoose = require('mongoose');
const asyncHandler = require('../middleware/asyncHandler');
const Slot = require('../models/Slot');
const Facility = require('../models/Facility');
const Reservation = require('../models/Reservation');

/**
 * Recalculates and persists slot counts for a given facility.
 */
const updateFacilitySlotCounts = async (facilityId) => {
  if (!facilityId) return;
  try {
    const idStr = facilityId._id ? facilityId._id.toString() : facilityId.toString();
    if (!mongoose.Types.ObjectId.isValid(idStr)) return;
    const objId = new mongoose.Types.ObjectId(idStr);

    const counts = await Slot.aggregate([
      { $match: { facility: objId } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const update = { availableSlots: 0, occupiedSlots: 0, reservedSlots: 0, outOfServiceSlots: 0 };
    let total = 0;
    counts.forEach(c => {
      total += c.count;
      if (c._id === 'available')      update.availableSlots = c.count;
      if (c._id === 'occupied')       update.occupiedSlots = c.count;
      if (c._id === 'reserved')       update.reservedSlots = c.count;
      if (c._id === 'out_of_service') update.outOfServiceSlots = c.count;
    });

    if (total > 0) {
      update.totalSlots = total;
    }
    await Facility.findByIdAndUpdate(objId, update);
  } catch (err) {
    console.error('[ParkEase] Failed to update facility slot counts:', err.message);
  }
};

// @desc    Get all slots for a facility
// @route   GET /api/slots/facility/:facilityId
exports.getSlotsByFacility = asyncHandler(async (req, res) => {
  const slots = await Slot.find({ facility: req.params.facilityId })
    .sort({ section: 1, slotNumber: 1 });
  res.json({ success: true, slots });
});

// @desc    Get single slot
// @route   GET /api/slots/:id
exports.getSlot = asyncHandler(async (req, res) => {
  const slot = await Slot.findById(req.params.id).populate('currentReservation');
  if (!slot) return res.status(404).json({ success: false, message: 'Slot not found' });
  res.json({ success: true, slot });
});

// @desc    Create single slot
// @route   POST /api/slots OR POST /api/slots/facility/:facilityId
exports.createSlot = asyncHandler(async (req, res) => {
  const facilityId = req.params.facilityId || req.body.facility || req.body.facilityId;
  if (!facilityId) {
    return res.status(400).json({ success: false, message: 'facility ID is required' });
  }

  const {
    slotNumber,
    section = 'A',
    floor = 1,
    slotType = 'standard',
    supportedVehicleTypes = ['car', 'suv'],
    status = 'available',
    hasEvCharging = false,
    isAccessible = false,
    notes = ''
  } = req.body;

  if (!slotNumber) {
    return res.status(400).json({ success: false, message: 'Slot number is required' });
  }

  // Check duplicate slot number within facility
  const existing = await Slot.findOne({ facility: facilityId, slotNumber: slotNumber.trim().toUpperCase() });
  if (existing) {
    return res.status(400).json({ success: false, message: `Slot ${slotNumber} already exists in this facility` });
  }

  const slot = await Slot.create({
    facility: facilityId,
    slotNumber: slotNumber.trim().toUpperCase(),
    section: section.trim().toUpperCase(),
    floor: parseInt(floor) || 1,
    slotType,
    supportedVehicleTypes,
    status,
    hasEvCharging: Boolean(hasEvCharging),
    isAccessible: Boolean(isAccessible),
    notes
  });

  await updateFacilitySlotCounts(facilityId);
  res.status(201).json({ success: true, slot });
});

// @desc    Create bulk slots for a facility section
// @route   POST /api/slots/facility/:facilityId/bulk
exports.createBulkSlots = asyncHandler(async (req, res) => {
  const { facilityId } = req.params;
  const { section, count, startNumber, slotType, supportedVehicleTypes, hasEvCharging, isAccessible } = req.body;

  if (!section || !count || !startNumber) {
    return res.status(400).json({ success: false, message: 'section, count, and startNumber are required' });
  }

  const existingSlots = await Slot.find({ facility: facilityId }, 'slotNumber');
  const existingSet = new Set(existingSlots.map(s => s.slotNumber));

  const slots = [];
  const sec = section.trim().toUpperCase();
  const start = parseInt(startNumber);
  const n = parseInt(count);

  for (let i = 0; i < n; i++) {
    const sNum = `${sec}${String(start + i).padStart(2, '0')}`;
    if (!existingSet.has(sNum)) {
      slots.push({
        facility: facilityId,
        slotNumber: sNum,
        section: sec,
        slotType: slotType || 'standard',
        supportedVehicleTypes: supportedVehicleTypes || ['car', 'suv'],
        hasEvCharging: Boolean(hasEvCharging),
        isAccessible: Boolean(isAccessible),
        status: 'available'
      });
    }
  }

  if (slots.length === 0) {
    return res.status(400).json({ success: false, message: 'All specified slots already exist' });
  }

  const created = await Slot.insertMany(slots);
  await updateFacilitySlotCounts(facilityId);
  res.status(201).json({ success: true, slots: created, count: created.length });
});

// @desc    Update slot details
// @route   PUT /api/slots/:id
exports.updateSlot = asyncHandler(async (req, res) => {
  const slot = await Slot.findById(req.params.id);
  if (!slot) return res.status(404).json({ success: false, message: 'Slot not found' });

  // If status is changed to available, release currentReservation
  const updateData = { ...req.body, lastUpdated: new Date() };
  if (req.body.status === 'available') {
    updateData.currentReservation = null;
  }
  if (req.body.slotNumber) {
    updateData.slotNumber = req.body.slotNumber.trim().toUpperCase();
  }
  if (req.body.section) {
    updateData.section = req.body.section.trim().toUpperCase();
  }

  const updatedSlot = await Slot.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  );

  await updateFacilitySlotCounts(updatedSlot.facility);
  res.json({ success: true, slot: updatedSlot });
});

// @desc    Update slot status only
// @route   PATCH /api/slots/:id/status
exports.updateSlotStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['available', 'occupied', 'reserved', 'out_of_service'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid slot status' });
  }

  const update = { status, lastUpdated: new Date() };
  if (status === 'available') {
    update.currentReservation = null;
  }

  const slot = await Slot.findByIdAndUpdate(
    req.params.id,
    update,
    { new: true }
  );
  if (!slot) return res.status(404).json({ success: false, message: 'Slot not found' });
  await updateFacilitySlotCounts(slot.facility);
  res.json({ success: true, slot });
});

// @desc    Delete slot
// @route   DELETE /api/slots/:id
exports.deleteSlot = asyncHandler(async (req, res) => {
  const slot = await Slot.findById(req.params.id);
  if (!slot) return res.status(404).json({ success: false, message: 'Slot not found' });

  // If reserved/occupied, only allow admin with override or reject
  if (['occupied', 'reserved'].includes(slot.status)) {
    if (req.user && req.user.role === 'admin') {
      // If reserved and deleting, also cancel that reservation
      if (slot.currentReservation) {
        await Reservation.findByIdAndUpdate(slot.currentReservation, {
          status: 'cancelled',
          cancellationReason: 'Slot removed by administrator'
        });
      }
    } else {
      return res.status(400).json({ success: false, message: 'Cannot delete an occupied or reserved slot without admin authorization' });
    }
  }

  await Slot.findByIdAndDelete(req.params.id);
  await updateFacilitySlotCounts(slot.facility);
  res.json({ success: true, message: `Slot ${slot.slotNumber} deleted successfully` });
});

exports.updateFacilitySlotCounts = updateFacilitySlotCounts;
