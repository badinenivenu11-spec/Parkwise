const asyncHandler = require('../middleware/asyncHandler');
const Review = require('../models/Review');
const Facility = require('../models/Facility');

const recalculateFacilityRating = async (facilityId) => {
  const result = await Review.aggregate([
    { $match: { facility: facilityId } },
    { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
  ]);
  if (result.length > 0) {
    await Facility.findByIdAndUpdate(facilityId, {
      rating: Math.round(result[0].avgRating * 10) / 10,
      reviewCount: result[0].count
    });
  }
};

// @desc    Get reviews for a facility
// @route   GET /api/reviews/facility/:facilityId
exports.getFacilityReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const total = await Review.countDocuments({ facility: req.params.facilityId });
  const reviews = await Review.find({ facility: req.params.facilityId })
    .populate('user', 'name avatar')
    .sort({ createdAt: -1 })
    .skip((parseInt(page) - 1) * parseInt(limit))
    .limit(parseInt(limit));

  res.json({ success: true, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)), reviews });
});

// @desc    Create review
// @route   POST /api/reviews
exports.createReview = asyncHandler(async (req, res) => {
  const { facilityId, reservationId, rating, title, comment, aspects } = req.body;

  if (!facilityId || !rating) {
    return res.status(400).json({ success: false, message: 'facilityId and rating are required' });
  }

  // One review per user per facility
  const existing = await Review.findOne({ facility: facilityId, user: req.user._id });
  if (existing) {
    return res.status(409).json({ success: false, message: 'You have already reviewed this facility. Use update instead.' });
  }

  const review = await Review.create({
    facility: facilityId,
    user: req.user._id,
    reservation: reservationId || null,
    rating,
    title,
    comment,
    aspects,
    isVerified: !!reservationId
  });

  await recalculateFacilityRating(review.facility);

  const populated = await Review.findById(review._id).populate('user', 'name avatar');
  res.status(201).json({ success: true, review: populated });
});

// @desc    Update review
// @route   PUT /api/reviews/:id
exports.updateReview = asyncHandler(async (req, res) => {
  const review = await Review.findOne({ _id: req.params.id, user: req.user._id });
  if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

  const { rating, title, comment, aspects } = req.body;
  if (rating) review.rating = rating;
  if (title !== undefined) review.title = title;
  if (comment !== undefined) review.comment = comment;
  if (aspects) review.aspects = { ...review.aspects, ...aspects };
  await review.save();

  await recalculateFacilityRating(review.facility);
  res.json({ success: true, review });
});

// @desc    Delete review
// @route   DELETE /api/reviews/:id
exports.deleteReview = asyncHandler(async (req, res) => {
  let query = { _id: req.params.id };
  if (req.user?.role !== 'admin') {
    query.user = req.user._id;
  }
  const review = await Review.findOneAndDelete(query);
  if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
  await recalculateFacilityRating(review.facility);
  res.json({ success: true, message: 'Review deleted' });
});

// @desc    Get reviews written by the authenticated user
// @route   GET /api/reviews/my
exports.getMyReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ user: req.user._id })
    .populate('facility', 'name coverImage address')
    .sort({ createdAt: -1 });
  res.json({ success: true, reviews });
});
