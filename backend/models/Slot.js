const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  facility: { type: mongoose.Schema.Types.ObjectId, ref: 'Facility', required: true },
  slotNumber: { type: String, required: true, trim: true }, // e.g. A01, B03
  section: { type: String, default: 'A' },
  floor: { type: Number, default: 1 },
  slotType: { type: String, enum: ['standard', 'compact', 'large', 'accessible', 'ev', 'vip', 'motorcycle'], default: 'standard' },
  supportedVehicleTypes: [{ type: String, enum: ['motorcycle', 'car', 'suv', 'van', 'other'] }],
  status: { type: String, enum: ['available', 'occupied', 'reserved', 'out_of_service'], default: 'available' },
  hasEvCharging: { type: Boolean, default: false },
  isAccessible: { type: Boolean, default: false },
  notes: { type: String },
  currentReservation: { type: mongoose.Schema.Types.ObjectId, ref: 'Reservation' },
  lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

slotSchema.index({ facility: 1, slotNumber: 1 }, { unique: true });
slotSchema.index({ facility: 1, status: 1 });

module.exports = mongoose.model('Slot', slotSchema);
