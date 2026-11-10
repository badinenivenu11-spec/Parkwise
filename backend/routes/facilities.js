const express = require('express');
const router = express.Router();
const { getFacilities, getFacility, createFacility, updateFacility, deleteFacility, getMyFacilities, toggleFavorite, getRecommendations } = require('../controllers/facilityController');
const { demoAuth, requireRole } = require('../middleware/demoAuth');

router.get('/recommendations', getRecommendations);
router.get('/operator/mine', demoAuth, requireRole('operator', 'admin'), getMyFacilities);
router.get('/', getFacilities);
router.get('/:id', getFacility);
router.post('/', demoAuth, requireRole('operator', 'admin'), createFacility);
router.put('/:id/favorite', demoAuth, toggleFavorite);
router.put('/:id', demoAuth, requireRole('operator', 'admin'), updateFacility);
router.delete('/:id', demoAuth, requireRole('admin'), deleteFacility);

module.exports = router;
