const asyncHandler = require('../middleware/asyncHandler');
const Reservation = require('../models/Reservation');
const Facility = require('../models/Facility');
const Slot = require('../models/Slot');
const User = require('../models/User');

exports.getAdminStats = asyncHandler(async (req, res) => {
  const [totalUsers, totalFacilities, totalSlots, reservationStats, slotStats] = await Promise.all([
    User.countDocuments(),
    Facility.countDocuments({ isActive: true }),
    Slot.countDocuments(),
    Reservation.aggregate([{ $group: { _id: '$status', count: { $sum: 1 }, totalValue: { $sum: '$pricing.estimatedTotal' } } }]),
    Slot.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }])
  ]);
  const resMap = {}; let totalValue = 0;
  reservationStats.forEach(r => { resMap[r._id] = r.count; totalValue += r.totalValue || 0; });
  const slotMap = {};
  slotStats.forEach(s => { slotMap[s._id] = s.count; });
  const totalReservations = Object.values(resMap).reduce((a, b) => a + b, 0);
  const occupancyRate = totalSlots > 0 ? Math.round(((slotMap.occupied || 0) / totalSlots) * 100) : 0;
  res.json({ success: true, stats: {
    totalUsers, totalFacilities, totalSlots, totalReservations,
    activeReservations: resMap.checked_in || 0,
    completedReservations: resMap.completed || 0,
    cancelledReservations: resMap.cancelled || 0,
    confirmedReservations: resMap.confirmed || 0,
    estimatedDemoValue: Math.round(totalValue),
    occupancyRate, slotBreakdown: slotMap
  }});
});

exports.getReservationsOverTime = asyncHandler(async (req, res) => {
  const { days = 30 } = req.query;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(days));
  const data = await Reservation.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 }, value: { $sum: '$pricing.estimatedTotal' } } },
    { $sort: { _id: 1 } }
  ]);
  res.json({ success: true, data });
});

exports.getOccupancyByFacility = asyncHandler(async (req, res) => {
  const data = await Facility.find({ isActive: true }, 'name totalSlots availableSlots occupiedSlots reservedSlots').limit(20);
  res.json({ success: true, data });
});

exports.getPeakHours = asyncHandler(async (req, res) => {
  const data = await Reservation.aggregate([
    { $match: { actualCheckInTime: { $exists: true } } },
    { $group: { _id: { $hour: '$actualCheckInTime' }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);
  res.json({ success: true, data });
});

exports.getPopularFacilities = asyncHandler(async (req, res) => {
  const data = await Reservation.aggregate([
    { $group: { _id: '$facility', count: { $sum: 1 }, value: { $sum: '$pricing.estimatedTotal' } } },
    { $sort: { count: -1 } }, { $limit: 10 },
    { $lookup: { from: 'facilities', localField: '_id', foreignField: '_id', as: 'facility' } },
    { $unwind: '$facility' },
    { $project: { _id: 1, count: 1, value: 1, 'facility.name': 1, 'facility.address.city': 1 } }
  ]);
  res.json({ success: true, data });
});

exports.getDurationDistribution = asyncHandler(async (req, res) => {
  const data = await Reservation.aggregate([
    { $bucket: { groupBy: '$durationHours', boundaries: [0,1,2,4,8,12,24,48,72], default: '72+', output: { count: { $sum: 1 } } } }
  ]);
  res.json({ success: true, data });
});

exports.getOperatorStats = asyncHandler(async (req, res) => {
  const myFacilities = await Facility.find({ operator: req.user._id }, '_id');
  const facilityIds = myFacilities.map(f => f._id);
  const [slotStats, reservationStats, todayCount] = await Promise.all([
    Slot.aggregate([{ $match: { facility: { $in: facilityIds } } }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
    Reservation.aggregate([{ $match: { facility: { $in: facilityIds } } }, { $group: { _id: '$status', count: { $sum: 1 }, value: { $sum: '$pricing.estimatedTotal' } } }]),
    Reservation.countDocuments({ facility: { $in: facilityIds }, createdAt: { $gte: new Date(new Date().setHours(0,0,0,0)) } })
  ]);
  const slotMap = {}; slotStats.forEach(s => { slotMap[s._id] = s.count; });
  const totalSlots = Object.values(slotMap).reduce((a,b)=>a+b,0);
  const resMap = {}; let totalValue = 0;
  reservationStats.forEach(r => { resMap[r._id] = r.count; totalValue += r.value || 0; });
  res.json({ success: true, stats: {
    totalFacilities: myFacilities.length, totalSlots,
    availableSlots: slotMap.available || 0, occupiedSlots: slotMap.occupied || 0,
    reservedSlots: slotMap.reserved || 0, outOfServiceSlots: slotMap.out_of_service || 0,
    todayReservations: todayCount, activeSessions: resMap.checked_in || 0,
    completedSessions: resMap.completed || 0, estimatedDemoValue: Math.round(totalValue)
  }});
});

exports.getDriverStats = asyncHandler(async (req, res) => {
  const [reservationStats, spending] = await Promise.all([
    Reservation.aggregate([{ $match: { user: req.user._id } }, { $group: { _id: '$status', count: { $sum: 1 }, value: { $sum: '$pricing.estimatedTotal' } } }]),
    Reservation.aggregate([
      { $match: { user: req.user._id, status: 'completed' } },
      { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, amount: { $sum: '$pricing.finalTotal' } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } }, { $limit: 12 }
    ])
  ]);
  const resMap = {}; let totalSpending = 0;
  reservationStats.forEach(r => { resMap[r._id] = r.count; if (r._id === 'completed') totalSpending = r.value || 0; });
  res.json({ success: true, stats: {
    upcoming: resMap.confirmed || 0, active: resMap.checked_in || 0,
    completed: resMap.completed || 0, cancelled: resMap.cancelled || 0,
    totalSpending: Math.round(totalSpending), spendingByMonth: spending
  }});
});
