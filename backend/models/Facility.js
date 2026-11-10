const mongoose = require('mongoose');

const pricingRuleSchema = new mongoose.Schema({
  vehicleType: { type: String, enum: ['motorcycle', 'car', 'suv', 'van', 'other'], required: true },
  rateType: { type: String, enum: ['hourly', 'daily', 'fixed'], default: 'hourly' },
  baseRate: { type: Number, required: true },
  minimumCharge: { type: Number, default: 0 },
  maximumDailyCharge: { type: Number },
  additionalHourRate: { type: Number }
}, { _id: false });

const operatingHoursSchema = new mongoose.Schema({
  day: { type: String, enum: ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'], required: true },
  open: { type: String, default: '00:00' },
  close: { type: String, default: '23:59' },
  isClosed: { type: Boolean, default: false }
}, { _id: false });

const facilitySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String },
  address: {
    street: { type: String },
    city: { type: String, required: true },
    state: { type: String },
    zipCode: { type: String },
    country: { type: String, default: 'India' }
  },
  coordinates: {
    latitude: { type: Number },
    longitude: { type: Number }
  },
  images: [{ type: String }],
  coverImage: { type: String },
  facilityType: { type: String, enum: ['surface', 'garage', 'underground', 'covered', 'rooftop', 'valet'], default: 'surface' },
  totalSlots: { type: Number, required: true, min: 1 },
  availableSlots: { type: Number, default: 0 },
  occupiedSlots: { type: Number, default: 0 },
  reservedSlots: { type: Number, default: 0 },
  outOfServiceSlots: { type: Number, default: 0 },
  pricingRules: [pricingRuleSchema],
  operatingHours: [operatingHoursSchema],
  amenities: {
    covered: { type: Boolean, default: false },
    evCharging: { type: Boolean, default: false },
    security: { type: Boolean, default: false },
    cctv: { type: Boolean, default: false },
    accessible: { type: Boolean, default: false },
    valetService: { type: Boolean, default: false },
    carWash: { type: Boolean, default: false },
    restroom: { type: Boolean, default: false },
    wifi: { type: Boolean, default: false },
    lighting: { type: Boolean, default: true }
  },
  supportedVehicleTypes: [{ type: String, enum: ['motorcycle', 'car', 'suv', 'van', 'other'] }],
  operator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  cancellationPolicy: { type: String, default: 'Free cancellation up to 1 hour before arrival.' },
  entryInstructions: { type: String },
  exitInstructions: { type: String }
}, { timestamps: true });

facilitySchema.index({ 'address.city': 1 });
facilitySchema.index({ name: 'text', 'address.city': 'text', 'address.street': 'text' });

module.exports = mongoose.model('Facility', facilitySchema);
