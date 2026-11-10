const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  reservationRef: {
    type: String,
    unique: true,
    default: () => 'PK' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 4).toUpperCase()
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  facility: { type: mongoose.Schema.Types.ObjectId, ref: 'Facility', required: true },
  slot: { type: mongoose.Schema.Types.ObjectId, ref: 'Slot' },
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
  vehicleSnapshot: {
    registrationNumber: String,
    vehicleType: String,
    make: String,
    model: String,
    color: String
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'checked_in', 'completed', 'cancelled', 'expired', 'no_show'],
    default: 'confirmed'
  },
  startTime: { type: Date, required: true },
  expectedEndTime: { type: Date, required: true },
  actualCheckInTime: { type: Date },
  actualCheckOutTime: { type: Date },
  durationHours: { type: Number, required: true },
  pricing: {
    baseRate: { type: Number, required: true },
    rateType: { type: String, default: 'hourly' },
    estimatedTotal: { type: Number, required: true },
    finalTotal: { type: Number },
    currency: { type: String, default: 'INR' },
    breakdown: [{ label: String, amount: Number }]
  },
  notes: { type: String },
  cancellationReason: { type: String },
  cancelledAt: { type: Date },
  isDemo: { type: Boolean, default: true }
}, { timestamps: true });

reservationSchema.index({ user: 1, status: 1 });
reservationSchema.index({ facility: 1, status: 1 });
reservationSchema.index({ slot: 1, startTime: 1, expectedEndTime: 1 });
reservationSchema.index({ reservationRef: 1 });

module.exports = mongoose.model('Reservation', reservationSchema);
