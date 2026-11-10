const express = require('express');
const router = express.Router();
const {
  createReservation,
  getMyReservations,
  getAllReservations,
  getReservation,
  checkIn,
  checkOut,
  cancelReservation,
  extendReservation,
  deleteReservation
} = require('../controllers/reservationController');
const { demoAuth, requireRole } = require('../middleware/demoAuth');

router.post('/', demoAuth, createReservation);
router.get('/my', demoAuth, getMyReservations);
router.get('/', demoAuth, requireRole('operator', 'admin'), getAllReservations);
router.get('/:id', demoAuth, getReservation);
router.put('/:id/checkin', demoAuth, checkIn);
router.put('/:id/checkout', demoAuth, checkOut);
router.put('/:id/cancel', demoAuth, cancelReservation);
router.put('/:id/extend', demoAuth, extendReservation);
router.delete('/:id', demoAuth, requireRole('admin'), deleteReservation);

module.exports = router;
