const User = require('../models/User');
const Facility = require('../models/Facility');
const Slot = require('../models/Slot');
const Vehicle = require('../models/Vehicle');
const Reservation = require('../models/Reservation');
const Review = require('../models/Review');
const Notification = require('../models/Notification');
const { updateFacilitySlotCounts } = require('../controllers/slotController');

async function seedInitialData() {
  await Promise.all([
    User.deleteMany({}), Facility.deleteMany({}), Slot.deleteMany({}),
    Vehicle.deleteMany({}), Reservation.deleteMany({}), Review.deleteMany({}), Notification.deleteMany({})
  ]);

  const [admin, op1, op2, driver1, driver2] = await User.insertMany([
    { email: 'admin@parkease.demo',    name: 'Alex Admin',   role: 'admin',    phone: '+91-9876543210' },
    { email: 'operator@parkease.demo', name: 'Om Operator',  role: 'operator', phone: '+91-9876543211' },
    { email: 'operator2@parkease.demo',name: 'Priya Ops',    role: 'operator', phone: '+91-9876543212' },
    { email: 'driver@parkease.demo',   name: 'Dev Driver',   role: 'driver',   phone: '+91-9876543213' },
    { email: 'user@parkease.demo',     name: 'Uma User',     role: 'driver',   phone: '+91-9876543214' }
  ]);

  const dayHours = (o, c) => ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'].map(day => ({ day, open: o, close: c }));

  const facilities = await Facility.insertMany([
    {
      name: 'Central Park Parking Complex', operator: op1._id,
      description: 'A premium multi-level parking complex in the heart of Bengaluru with state-of-the-art security and EV charging stations.',
      address: { street: '12 MG Road', city: 'Bengaluru', state: 'Karnataka', zipCode: '560001' },
      coordinates: { latitude: 12.9716, longitude: 77.5946 },
      facilityType: 'garage', totalSlots: 80, availableSlots: 32, occupiedSlots: 36, reservedSlots: 8, outOfServiceSlots: 4,
      pricingRules: [
        { vehicleType: 'motorcycle', rateType: 'hourly', baseRate: 20, minimumCharge: 20 },
        { vehicleType: 'car',        rateType: 'hourly', baseRate: 60, minimumCharge: 60, maximumDailyCharge: 450 },
        { vehicleType: 'suv',        rateType: 'hourly', baseRate: 80, minimumCharge: 80, maximumDailyCharge: 600 },
        { vehicleType: 'van',        rateType: 'hourly', baseRate: 100, minimumCharge: 100 }
      ],
      operatingHours: [
        { day: 'monday', open: '06:00', close: '23:00' }, { day: 'tuesday', open: '06:00', close: '23:00' },
        { day: 'wednesday', open: '06:00', close: '23:00' }, { day: 'thursday', open: '06:00', close: '23:00' },
        { day: 'friday', open: '06:00', close: '23:59' }, { day: 'saturday', open: '07:00', close: '23:59' },
        { day: 'sunday', open: '08:00', close: '22:00' }
      ],
      amenities: { covered: true, evCharging: true, security: true, cctv: true, accessible: true, restroom: true, lighting: true, wifi: true },
      supportedVehicleTypes: ['motorcycle','car','suv','van'], rating: 4.8, reviewCount: 142,
      coverImage: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=800&auto=format&fit=crop&q=80',
      images: [
        'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop&q=80'
      ],
      entryInstructions: 'Enter via MG Road Gate 1. Scan your demo pass barcode or quote reservation reference.',
      exitInstructions: 'Proceed to Exit Gate 2. Confirm exit on the terminal.',
      cancellationPolicy: 'Free cancellation up to 1 hour before arrival.'
    },
    {
      name: 'Koramangala Smart Parking', operator: op1._id,
      description: 'Modern smart parking with automated guidance system and real-time slot tracking in Koramangala.',
      address: { street: '5th Block, 80 Feet Road', city: 'Bengaluru', state: 'Karnataka', zipCode: '560034' },
      coordinates: { latitude: 12.9352, longitude: 77.6245 },
      facilityType: 'surface', totalSlots: 60, availableSlots: 25, occupiedSlots: 25, reservedSlots: 10, outOfServiceSlots: 0,
      pricingRules: [
        { vehicleType: 'motorcycle', rateType: 'hourly', baseRate: 15, minimumCharge: 15 },
        { vehicleType: 'car',        rateType: 'hourly', baseRate: 50, minimumCharge: 50 },
        { vehicleType: 'suv',        rateType: 'hourly', baseRate: 70, minimumCharge: 70 }
      ],
      operatingHours: [
        { day: 'monday', open: '07:00', close: '22:00' }, { day: 'tuesday', open: '07:00', close: '22:00' },
        { day: 'wednesday', open: '07:00', close: '22:00' }, { day: 'thursday', open: '07:00', close: '22:00' },
        { day: 'friday', open: '07:00', close: '23:00' }, { day: 'saturday', open: '08:00', close: '23:00' },
        { day: 'sunday', open: '09:00', close: '21:00' }
      ],
      amenities: { covered: false, evCharging: true, security: true, cctv: true, accessible: false, lighting: true },
      supportedVehicleTypes: ['motorcycle','car','suv'], rating: 4.3, reviewCount: 89,
      coverImage: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800&auto=format&fit=crop&q=80',
      images: ['https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800&auto=format&fit=crop&q=80'],
      entryInstructions: 'Enter from 80 Feet Road. Follow the digital directional boards.',
      cancellationPolicy: 'Free cancellation up to 30 minutes before arrival.'
    },
    {
      name: 'Indiranagar Underground Park', operator: op2._id,
      description: 'Secure underground parking in the posh Indiranagar locality with climate control and 24/7 security.',
      address: { street: '100 Feet Road, Indiranagar', city: 'Bengaluru', state: 'Karnataka', zipCode: '560038' },
      coordinates: { latitude: 12.9784, longitude: 77.6408 },
      facilityType: 'underground', totalSlots: 100, availableSlots: 40, occupiedSlots: 45, reservedSlots: 15, outOfServiceSlots: 0,
      pricingRules: [
        { vehicleType: 'motorcycle', rateType: 'hourly', baseRate: 25, minimumCharge: 25 },
        { vehicleType: 'car',        rateType: 'hourly', baseRate: 70, minimumCharge: 70, maximumDailyCharge: 500 },
        { vehicleType: 'suv',        rateType: 'hourly', baseRate: 90, minimumCharge: 90, maximumDailyCharge: 700 },
        { vehicleType: 'van',        rateType: 'hourly', baseRate: 120, minimumCharge: 120, maximumDailyCharge: 900 }
      ],
      operatingHours: dayHours('00:00', '23:59'),
      amenities: { covered: true, evCharging: false, security: true, cctv: true, accessible: true, restroom: true, lighting: true },
      supportedVehicleTypes: ['motorcycle','car','suv','van'], rating: 4.7, reviewCount: 203,
      coverImage: 'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=800&auto=format&fit=crop&q=80',
      images: ['https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=800&auto=format&fit=crop&q=80'],
      entryInstructions: 'Use basement ramp on 100 Feet Road. Elevator access to street level.',
      cancellationPolicy: 'Free cancellation up to 2 hours before arrival.'
    },
    {
      name: 'HSR Layout Open Parking', operator: op2._id,
      description: 'Affordable open-air parking in HSR Layout. Ideal for quick short-term parking near commercial sectors.',
      address: { street: 'Sector 1, 27th Main Road', city: 'Bengaluru', state: 'Karnataka', zipCode: '560102' },
      coordinates: { latitude: 12.9116, longitude: 77.6388 },
      facilityType: 'surface', totalSlots: 40, availableSlots: 30, occupiedSlots: 8, reservedSlots: 2, outOfServiceSlots: 0,
      pricingRules: [
        { vehicleType: 'motorcycle', rateType: 'hourly', baseRate: 10, minimumCharge: 10 },
        { vehicleType: 'car',        rateType: 'hourly', baseRate: 40, minimumCharge: 40 },
        { vehicleType: 'suv',        rateType: 'hourly', baseRate: 50, minimumCharge: 50 }
      ],
      operatingHours: [
        { day: 'monday', open: '06:00', close: '22:00' }, { day: 'tuesday', open: '06:00', close: '22:00' },
        { day: 'wednesday', open: '06:00', close: '22:00' }, { day: 'thursday', open: '06:00', close: '22:00' },
        { day: 'friday', open: '06:00', close: '22:00' }, { day: 'saturday', open: '06:00', close: '22:00' },
        { day: 'sunday', open: '07:00', close: '20:00' }
      ],
      amenities: { covered: false, evCharging: false, security: false, cctv: true, accessible: false, lighting: true },
      supportedVehicleTypes: ['motorcycle','car','suv'], rating: 3.9, reviewCount: 45,
      coverImage: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&auto=format&fit=crop&q=80',
      images: ['https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&auto=format&fit=crop&q=80'],
      cancellationPolicy: 'Free cancellation anytime before arrival.'
    },
    {
      name: 'Whitefield Tech Park Parking', operator: op1._id,
      description: 'Multi-level parking facility catering to tech parks in Whitefield with rapid EV superchargers and car care service.',
      address: { street: 'EPIP Zone, Whitefield', city: 'Bengaluru', state: 'Karnataka', zipCode: '560066' },
      coordinates: { latitude: 12.9698, longitude: 77.7499 },
      facilityType: 'garage', totalSlots: 120, availableSlots: 50, occupiedSlots: 50, reservedSlots: 20, outOfServiceSlots: 0,
      pricingRules: [
        { vehicleType: 'motorcycle', rateType: 'hourly', baseRate: 20, minimumCharge: 20 },
        { vehicleType: 'car',        rateType: 'hourly', baseRate: 55, minimumCharge: 55, maximumDailyCharge: 400 },
        { vehicleType: 'suv',        rateType: 'hourly', baseRate: 75, minimumCharge: 75, maximumDailyCharge: 600 },
        { vehicleType: 'van',        rateType: 'hourly', baseRate: 100, minimumCharge: 100, maximumDailyCharge: 800 }
      ],
      operatingHours: [
        { day: 'monday', open: '05:00', close: '23:00' }, { day: 'tuesday', open: '05:00', close: '23:00' },
        { day: 'wednesday', open: '05:00', close: '23:00' }, { day: 'thursday', open: '05:00', close: '23:00' },
        { day: 'friday', open: '05:00', close: '23:59' }, { day: 'saturday', open: '06:00', close: '21:00' },
        { day: 'sunday', open: '09:00', close: '18:00' }
      ],
      amenities: { covered: true, evCharging: true, security: true, cctv: true, accessible: true, restroom: true, wifi: true, carWash: true, lighting: true },
      supportedVehicleTypes: ['motorcycle','car','suv','van'], rating: 4.6, reviewCount: 312,
      coverImage: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&auto=format&fit=crop&q=80',
      images: ['https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&auto=format&fit=crop&q=80'],
      entryInstructions: 'Scan QR at entry gate. Levels 1-2 for visitors, Level 3 reserved.',
      cancellationPolicy: 'Free cancellation up to 1 hour before arrival.'
    },
    {
      name: 'Mumbai Bandra Parking Hub', operator: op2._id,
      description: 'Centrally located parking hub near Bandra West linking road with 24/7 access and valet service.',
      address: { street: 'Linking Road, Bandra West', city: 'Mumbai', state: 'Maharashtra', zipCode: '400050' },
      coordinates: { latitude: 19.0596, longitude: 72.8295 },
      facilityType: 'covered', totalSlots: 90, availableSlots: 35, occupiedSlots: 40, reservedSlots: 15, outOfServiceSlots: 0,
      pricingRules: [
        { vehicleType: 'motorcycle', rateType: 'hourly', baseRate: 30, minimumCharge: 30 },
        { vehicleType: 'car',        rateType: 'hourly', baseRate: 80, minimumCharge: 80 },
        { vehicleType: 'suv',        rateType: 'hourly', baseRate: 100, minimumCharge: 100 }
      ],
      operatingHours: dayHours('00:00', '23:59'),
      amenities: { covered: true, evCharging: false, security: true, cctv: true, accessible: false, restroom: true, lighting: true },
      supportedVehicleTypes: ['motorcycle','car','suv'], rating: 4.2, reviewCount: 176,
      coverImage: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&auto=format&fit=crop&q=80',
      images: ['https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&auto=format&fit=crop&q=80'],
      cancellationPolicy: 'Free cancellation up to 30 minutes before arrival.'
    }
  ]);

  // Generate slots for each facility
  const allSlots = [];
  for (const fac of facilities) {
    const sections = ['A','B','C','D'];
    let count = 0;
    let occupied = 0, reserved = 0, oos = 0;
    for (const section of sections) {
      if (count >= fac.totalSlots) break;
      const n = Math.min(Math.ceil(fac.totalSlots / sections.length), fac.totalSlots - count);
      for (let i = 1; i <= n; i++) {
        let status = 'available';
        if (occupied < fac.occupiedSlots) { status = 'occupied'; occupied++; }
        else if (reserved < fac.reservedSlots) { status = 'reserved'; reserved++; }
        else if (count >= fac.totalSlots - fac.outOfServiceSlots) { status = 'out_of_service'; oos++; }
        const isEV = fac.amenities.evCharging && section === 'A' && i <= 3;
        const isAccessible = fac.amenities.accessible && section === 'A' && i === 1;
        allSlots.push({
          facility: fac._id,
          slotNumber: `${section}${String(i).padStart(2,'0')}`,
          section, floor: section === 'A' ? 1 : section === 'B' ? 2 : section === 'C' ? 3 : 4,
          slotType: isEV ? 'ev' : isAccessible ? 'accessible' : 'standard',
          supportedVehicleTypes: fac.supportedVehicleTypes,
          hasEvCharging: isEV, isAccessible, status
        });
        count++;
        if (count >= fac.totalSlots) break;
      }
    }
  }
  await Slot.insertMany(allSlots);

  // Vehicles
  const [car1, moto1, suv2] = await Vehicle.insertMany([
    { owner: driver1._id, registrationNumber: 'KA-01-AB-1234', vehicleType: 'car', make: 'Maruti', model: 'Swift ZXI', color: 'Pearl White', isDefault: true },
    { owner: driver1._id, registrationNumber: 'KA-01-CD-5678', vehicleType: 'motorcycle', make: 'Honda', model: 'Activa 6G', color: 'Matte Blue' },
    { owner: driver2._id, registrationNumber: 'MH-02-EF-9012', vehicleType: 'suv', make: 'Hyundai', model: 'Creta SX', color: 'Titan Grey', isDefault: true }
  ]);

  // Reservations
  const now = new Date();
  const availSlots = allSlots.filter(s => s.status === 'available');
  const reservations = await Reservation.insertMany([
    {
      user: driver1._id, facility: facilities[0]._id, slot: availSlots[0]?._id, vehicle: car1._id,
      vehicleSnapshot: { registrationNumber: 'KA-01-AB-1234', vehicleType: 'car', make: 'Maruti', model: 'Swift ZXI', color: 'Pearl White' },
      status: 'confirmed',
      startTime: new Date(now.getTime() + 2*3600000), expectedEndTime: new Date(now.getTime() + 4*3600000),
      durationHours: 2, pricing: { baseRate: 60, rateType: 'hourly', estimatedTotal: 120, currency: 'INR', breakdown: [{ label: 'Parking (₹60/hr × 2h)', amount: 120 }] }
    },
    {
      user: driver1._id, facility: facilities[1]._id, slot: availSlots[1]?._id, vehicle: moto1._id,
      vehicleSnapshot: { registrationNumber: 'KA-01-CD-5678', vehicleType: 'motorcycle', make: 'Honda', model: 'Activa 6G', color: 'Matte Blue' },
      status: 'checked_in',
      startTime: new Date(now.getTime() - 1*3600000), expectedEndTime: new Date(now.getTime() + 2*3600000),
      actualCheckInTime: new Date(now.getTime() - 1*3600000),
      durationHours: 3, pricing: { baseRate: 15, rateType: 'hourly', estimatedTotal: 45, currency: 'INR', breakdown: [{ label: 'Parking (₹15/hr × 3h)', amount: 45 }] }
    },
    {
      user: driver1._id, facility: facilities[2]._id, vehicle: car1._id,
      vehicleSnapshot: { registrationNumber: 'KA-01-AB-1234', vehicleType: 'car', make: 'Maruti', model: 'Swift ZXI', color: 'Pearl White' },
      status: 'completed',
      startTime: new Date(now.getTime() - 26*3600000), expectedEndTime: new Date(now.getTime() - 23*3600000),
      actualCheckInTime: new Date(now.getTime() - 26*3600000), actualCheckOutTime: new Date(now.getTime() - 23*3600000),
      durationHours: 3, pricing: { baseRate: 70, rateType: 'hourly', estimatedTotal: 210, finalTotal: 210, currency: 'INR', breakdown: [{ label: 'Parking (₹70/hr × 3h)', amount: 210 }] }
    },
    {
      user: driver1._id, facility: facilities[0]._id, vehicle: car1._id,
      vehicleSnapshot: { registrationNumber: 'KA-01-AB-1234', vehicleType: 'car', make: 'Maruti', model: 'Swift ZXI', color: 'Pearl White' },
      status: 'cancelled',
      startTime: new Date(now.getTime() - 48*3600000), expectedEndTime: new Date(now.getTime() - 46*3600000),
      durationHours: 2, pricing: { baseRate: 60, rateType: 'hourly', estimatedTotal: 120, currency: 'INR', breakdown: [{ label: 'Parking (₹60/hr × 2h)', amount: 120 }] },
      cancellationReason: 'Meeting rescheduled', cancelledAt: new Date(now.getTime() - 49*3600000)
    }
  ]);

  // Associate confirmed and checked_in reservation slots with proper statuses
  if (availSlots[0]) {
    await Slot.findByIdAndUpdate(availSlots[0]._id, { status: 'reserved', currentReservation: reservations[0]._id });
  }
  if (availSlots[1]) {
    await Slot.findByIdAndUpdate(availSlots[1]._id, { status: 'occupied', currentReservation: reservations[1]._id });
  }

  // Recalculate real dynamic slot counts for all facilities
  for (const fac of facilities) {
    await updateFacilitySlotCounts(fac._id);
  }

  // Set driver1 favorites
  await User.findByIdAndUpdate(driver1._id, {
    favoritesFacilities: [facilities[0]._id, facilities[2]._id]
  });

  // Sample reviews
  await Review.insertMany([
    { facility: facilities[0]._id, user: driver1._id, rating: 5, title: 'Clean and hassle-free', comment: 'EV fast chargers worked reliably. Clear floor numbering and security personnel were courteous.', aspects: { cleanliness: 5, security: 5, accessibility: 5, valueForMoney: 4 } },
    { facility: facilities[1]._id, user: driver2._id, rating: 4, title: 'Convenient spot', comment: 'Great location right off 80 Feet Road. Easy in-and-out experience.', aspects: { cleanliness: 4, security: 4, accessibility: 3, valueForMoney: 5 } },
    { facility: facilities[2]._id, user: driver1._id, rating: 5, title: 'Secure underground parking', comment: 'Safe and temperature controlled. 24/7 access worked smoothly late night.', aspects: { cleanliness: 5, security: 5, accessibility: 5, valueForMoney: 4 } }
  ]);

  // Notifications
  await Notification.insertMany([
    { user: driver1._id, type: 'system', title: 'Welcome to ParkEase!', message: 'Your demo account is loaded with sample vehicles and active bookings.' },
    { user: driver1._id, type: 'reservation_confirmed', title: 'Upcoming Reservation Confirmed', message: `Your parking at ${facilities[0].name} is confirmed. Ref: ${reservations[0].reservationRef}`, relatedReservation: reservations[0]._id },
    { user: driver1._id, type: 'check_in_reminder', title: 'Active Parking Session', message: `You are currently parked at ${facilities[1].name}. Ref: ${reservations[1].reservationRef}`, relatedReservation: reservations[1]._id }
  ]);

  return { users: 5, facilities: facilities.length, slots: allSlots.length, reservations: reservations.length };
}

module.exports = { seedInitialData };
