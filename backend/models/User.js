const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  name: { type: String, required: true, trim: true },
  role: { type: String, enum: ['driver', 'operator', 'admin'], default: 'driver' },
  phone: { type: String, trim: true },
  avatar: { type: String },
  favoritesFacilities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Facility' }],
  notificationPrefs: {
    email: { type: Boolean, default: true },
    reservationReminders: { type: Boolean, default: true },
    promotions: { type: Boolean, default: false }
  },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
