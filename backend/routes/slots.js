const express = require('express');
const router = express.Router();
const {
  getSlotsByFacility,
  getSlot,
  createSlot,
  createBulkSlots,
  updateSlot,
  updateSlotStatus,
  deleteSlot
} = require('../controllers/slotController');
const { demoAuth, requireRole } = require('../middleware/demoAuth');

router.get('/facility/:facilityId', getSlotsByFacility);
router.get('/:id', getSlot);

// Single slot creation: either /api/slots or /api/slots/facility/:facilityId
router.post('/', demoAuth, requireRole('operator', 'admin'), createSlot);
router.post('/facility/:facilityId', demoAuth, requireRole('operator', 'admin'), createSlot);
router.post('/facility/:facilityId/bulk', demoAuth, requireRole('operator', 'admin'), createBulkSlots);

router.put('/:id/status', demoAuth, requireRole('operator', 'admin'), updateSlotStatus);
router.put('/:id', demoAuth, requireRole('operator', 'admin'), updateSlot);
router.delete('/:id', demoAuth, requireRole('operator', 'admin'), deleteSlot);

module.exports = router;
