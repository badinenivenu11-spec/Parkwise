const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['reservation_confirmed', 'reservation_cancelled', 'check_in_reminder', 'check_out_reminder', 'slot_available', 'system', 'promotion'],
    required: true
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  relatedReservation: { type: mongoose.Schema.Types.ObjectId, ref: 'Reservation' },
  relatedFacility: { type: mongoose.Schema.Types.ObjectId, ref: 'Facility' }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
