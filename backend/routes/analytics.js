const express = require('express');
const router = express.Router();
const { getAdminStats, getReservationsOverTime, getOccupancyByFacility, getPeakHours, getPopularFacilities, getDurationDistribution, getOperatorStats, getDriverStats } = require('../controllers/analyticsController');
const { demoAuth, requireRole } = require('../middleware/demoAuth');

router.use(demoAuth);
router.get('/admin',                        requireRole('admin'), getAdminStats);
router.get('/admin/reservations-over-time', requireRole('admin'), getReservationsOverTime);
router.get('/admin/occupancy',              requireRole('admin'), getOccupancyByFacility);
router.get('/admin/peak-hours',             requireRole('admin'), getPeakHours);
router.get('/admin/popular-facilities',     requireRole('admin'), getPopularFacilities);
router.get('/admin/duration-distribution',  requireRole('admin'), getDurationDistribution);
router.get('/operator',                     requireRole('operator', 'admin'), getOperatorStats);
router.get('/driver',                       getDriverStats);

module.exports = router;
