const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  facility: { type: mongoose.Schema.Types.ObjectId, ref: 'Facility', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reservation: { type: mongoose.Schema.Types.ObjectId, ref: 'Reservation' },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String, trim: true },
  comment: { type: String, trim: true },
  aspects: {
    cleanliness: { type: Number, min: 1, max: 5 },
    security: { type: Number, min: 1, max: 5 },
    accessibility: { type: Number, min: 1, max: 5 },
    valueForMoney: { type: Number, min: 1, max: 5 }
  },
  isVerified: { type: Boolean, default: false }
}, { timestamps: true });

reviewSchema.index({ facility: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
