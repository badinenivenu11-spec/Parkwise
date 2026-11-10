const express = require('express');
const router = express.Router();
const asyncHandler = require('../middleware/asyncHandler');
const { seedInitialData } = require('../services/seedService');
const Facility = require('../models/Facility');
const Slot = require('../models/Slot');
const Reservation = require('../models/Reservation');

router.post('/run', asyncHandler(async (req, res) => {
  const result = await seedInitialData();
  res.json({
    success: true,
    message: 'Demo database seeded successfully!',
    summary: result,
    demoAccounts: [
      { email: 'admin@parkease.demo',     role: 'admin',    name: 'Alex Admin' },
      { email: 'operator@parkease.demo',  role: 'operator', name: 'Om Operator' },
      { email: 'operator2@parkease.demo', role: 'operator', name: 'Priya Ops' },
      { email: 'driver@parkease.demo',    role: 'driver',   name: 'Dev Driver' },
      { email: 'user@parkease.demo',      role: 'driver',   name: 'Uma User' }
    ]
  });
}));

router.post('/reset-sessions', asyncHandler(async (req, res) => {
  await Reservation.deleteMany({});
  await Slot.updateMany({}, { status: 'available', currentReservation: null });
  const facs = await Facility.find({});
  for (const f of facs) {
    await Facility.findByIdAndUpdate(f._id, {
      availableSlots: f.totalSlots - (f.outOfServiceSlots || 0),
      occupiedSlots: 0,
      reservedSlots: 0
    });
  }
  res.json({ success: true, message: 'All reservations cleared and parking slots freed.' });
}));

module.exports = router;
