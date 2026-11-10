const express = require('express');
const router = express.Router();
const { getFacilityReviews, createReview, updateReview, deleteReview, getMyReviews } = require('../controllers/reviewController');
const { demoAuth } = require('../middleware/demoAuth');

router.get('/facility/:facilityId', getFacilityReviews);
router.get('/my', demoAuth, getMyReviews);
router.post('/facility/:facilityId', demoAuth, (req, res, next) => {
  req.body.facilityId = req.params.facilityId;
  createReview(req, res, next);
});
router.post('/', demoAuth, createReview);
router.put('/:id', demoAuth, updateReview);
router.delete('/:id', demoAuth, deleteReview);

module.exports = router;
