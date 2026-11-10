const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  registrationNumber: { type: String, required: true, trim: true, uppercase: true },
  vehicleType: { type: String, enum: ['motorcycle', 'car', 'suv', 'van', 'other'], required: true },
  make: { type: String, trim: true },
  model: { type: String, trim: true },
  color: { type: String, trim: true },
  isEV: { type: Boolean, default: false },
  isDefault: { type: Boolean, default: false },
  notes: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

vehicleSchema.index({ owner: 1, registrationNumber: 1 });

module.exports = mongoose.model('Vehicle', vehicleSchema);
