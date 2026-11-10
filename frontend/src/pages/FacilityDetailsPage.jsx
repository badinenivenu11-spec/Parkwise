import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { facilityApi, reviewApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ParkingMap from '../components/ParkingMap';
import {
  MapPin,
  Star,
  Zap,
  Umbrella,
  ShieldCheck,
  Accessibility,
  Heart,
  Clock,
  Car,
  ChevronRight,
  Info,
  Calendar,
  Sparkles,
  Wifi,
  Coffee,
  CheckCircle2,
  Navigation,
  MessageSquarePlus,
  Send
} from 'lucide-react';

export default function FacilityDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, favorites, toggleFavorite } = useAuth();
  const { addToast } = useToast();

  const [facility, setFacility] = useState(null);
  const [slotSummary, setSlotSummary] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  // Review Form Modal
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newTitle, setNewTitle] = useState('');
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await facilityApi.getById(id);
      if (res.data.success) {
        setFacility(res.data.facility);
        setSlotSummary(res.data.slotSummary || []);
        setReviews(res.data.reviews || []);
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to load facility details', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newComment.trim()) {
      addToast('Please enter review title and comment', 'warning');
      return;
    }
    try {
      setSubmittingReview(true);
      const res = await reviewApi.create({
        facilityId: id,
        rating: newRating,
        title: newTitle,
        comment: newComment,
        aspects: {
          cleanliness: newRating,
          security: newRating,
          accessibility: newRating,
          valueForMoney: newRating,
        },
      });
      if (res.data.success) {
        addToast('Review submitted successfully!', 'success');
        setReviewModalOpen(false);
        setNewTitle('');
        setNewComment('');
        fetchDetails();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to submit review', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="py-32 text-center space-y-3">
        <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-slate-400 text-xs">Loading facility details & live availability...</p>
      </div>
    );
  }

  if (!facility) {
    return (
      <div className="max-w-md mx-auto py-32 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Facility Not Found</h2>
        <p className="text-xs text-slate-400">The requested facility could not be found or has been deactivated.</p>
        <Link to="/find" className="inline-block px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold">
          Back to Search
        </Link>
      </div>
    );
  }

  const isFav = favorites.includes(facility._id);
  const images = facility.images && facility.images.length > 0 ? facility.images : [facility.coverImage || 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=800'];

  // Slot Breakdown Map
  const slotCountMap = {};
  if (Array.isArray(slotSummary)) {
    slotSummary.forEach(s => { slotCountMap[s._id] = s.count; });
  }

  const availableCount = slotCountMap.available !== undefined ? slotCountMap.available : (facility.availableSlots ?? 0);
  const occupiedCount = slotCountMap.occupied !== undefined ? slotCountMap.occupied : (facility.occupiedSlots ?? 0);
  const reservedCount = slotCountMap.reserved !== undefined ? slotCountMap.reserved : (facility.reservedSlots ?? 0);
  const oosCount = slotCountMap.out_of_service !== undefined ? slotCountMap.out_of_service : (facility.outOfServiceSlots ?? 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link to="/" className="hover:text-emerald-400 transition">Home</Link>
          <span>/</span>
          <Link to="/find" className="hover:text-emerald-400 transition">Facilities</Link>
          <span>/</span>
          <span className="text-slate-200 font-medium truncate max-w-[200px]">{facility.name}</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => toggleFavorite(facility._id)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold transition ${
              isFav
                ? 'bg-rose-500/10 border-rose-500/40 text-rose-400'
                : 'bg-navy-900 border-navy-700 text-slate-300 hover:text-white'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
            <span>{isFav ? 'Saved in Favorites' : 'Add to Favorites'}</span>
          </button>

          <Link
            to={`/slots/${facility._id}`}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition flex items-center gap-1.5"
          >
            <span>Reserve a Spot</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Main Header / Image Gallery Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Images Carousel */}
        <div className="lg:col-span-2 space-y-3">
          <div className="relative h-80 sm:h-96 rounded-2xl overflow-hidden bg-navy-950 border border-navy-800 shadow-2xl">
            <img
              src={images[activeImage]}
              alt={facility.name}
              className="w-full h-full object-cover transition duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-transparent to-black/20" />

            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
              <div>
                <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-black/60 text-white uppercase tracking-wider backdrop-blur-md border border-white/10">
                  {facility.facilityType} Parking
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 text-shadow">
                  {facility.name}
                </h1>
                <p className="text-xs text-slate-300 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>
                    {facility.address?.street ? `${facility.address.street}, ` : ''}
                    {facility.address?.city}, {facility.address?.state} {facility.address?.zipCode}
                  </span>
                </p>
              </div>

              {facility.rating > 0 && (
                <div className="flex items-center gap-1 px-3 py-1 rounded-lg bg-navy-900/90 border border-navy-700 text-amber-300 text-sm font-black shadow-lg">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{facility.rating.toFixed(1)}</span>
                  <span className="text-[10px] text-slate-400">({facility.reviewCount} reviews)</span>
                </div>
              )}
            </div>
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`w-20 h-14 rounded-lg overflow-hidden border-2 transition shrink-0 ${
                    activeImage === idx ? 'border-emerald-500 scale-98' : 'border-navy-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Quick Reserve Card & Live Capacity */}
        <div className="space-y-6">
          <div className="bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-2xl space-y-6">
            <div>
              <div className="text-xs text-slate-400 uppercase tracking-wider">Starting Rate</div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-black text-white font-mono">
                  ₹{facility.pricingRules?.[0]?.baseRate || 50}
                </span>
                <span className="text-xs text-slate-400">/hour</span>
              </div>
            </div>

            {/* Live Capacity Meter */}
            <div className="space-y-3 p-4 rounded-xl bg-navy-950 border border-navy-800/80">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-semibold">Live Space Status:</span>
                <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                  availableCount > 15 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'
                }`}>
                  {availableCount} Available
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-navy-800 rounded-full overflow-hidden flex">
                <div style={{ width: `${(occupiedCount / facility.totalSlots) * 100}%` }} className="bg-rose-500 h-full" title="Occupied" />
                <div style={{ width: `${(reservedCount / facility.totalSlots) * 100}%` }} className="bg-amber-400 h-full" title="Reserved" />
                <div style={{ width: `${(oosCount / facility.totalSlots) * 100}%` }} className="bg-slate-600 h-full" title="Maintenance" />
                <div style={{ width: `${(availableCount / facility.totalSlots) * 100}%` }} className="bg-emerald-500 h-full" title="Available" />
              </div>

              {/* Slot breakdown pill numbers */}
              <div className="grid grid-cols-4 gap-1 text-center text-[10px] pt-1">
                <div className="p-1.5 rounded bg-navy-900">
                  <div className="font-bold text-emerald-400">{availableCount}</div>
                  <div className="text-slate-500">Free</div>
                </div>
                <div className="p-1.5 rounded bg-navy-900">
                  <div className="font-bold text-rose-400">{occupiedCount}</div>
                  <div className="text-slate-500">Busy</div>
                </div>
                <div className="p-1.5 rounded bg-navy-900">
                  <div className="font-bold text-amber-400">{reservedCount}</div>
                  <div className="text-slate-500">Booked</div>
                </div>
                <div className="p-1.5 rounded bg-navy-900">
                  <div className="font-bold text-slate-400">{oosCount}</div>
                  <div className="text-slate-500">OOS</div>
                </div>
              </div>
            </div>

            {/* Action CTA */}
            <div className="space-y-2">
              <Link
                to={`/slots/${facility._id}`}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xl shadow-emerald-600/30 transition flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Select Slot on Floor Plan</span>
              </Link>

              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${facility.coordinates?.latitude || 12.9716},${facility.coordinates?.longitude || 77.5946}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 rounded-xl bg-navy-850 hover:bg-navy-800 border border-navy-700 text-slate-300 font-semibold text-xs transition flex items-center justify-center gap-2"
              >
                <Navigation className="w-3.5 h-3.5 text-blue-400" />
                <span>Get Driving Directions</span>
              </a>
            </div>

            <p className="text-[11px] text-slate-400 text-center leading-relaxed">
              {facility.cancellationPolicy}
            </p>
          </div>
        </div>
      </div>

      {/* Details Grid: Amenities, Pricing Rules, Hours */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 cols): Description, Amenities, Instructions, Pricing Rules */}
        <div className="lg:col-span-2 space-y-8">
          {/* Description */}
          <div className="bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl space-y-3">
            <h3 className="text-base font-bold text-white">About the Facility</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {facility.description || 'Modern parking facility offering safe, clean, and accessible parking spaces with round-the-clock security and digital entry verification.'}
            </p>
          </div>

          {/* Amenities & Features */}
          <div className="bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white">Amenities & Specifications</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: 'Covered Parking', val: facility.amenities?.covered, icon: Umbrella },
                { label: 'EV Fast Charging', val: facility.amenities?.evCharging, icon: Zap },
                { label: 'Security Guard', val: facility.amenities?.security, icon: ShieldCheck },
                { label: 'CCTV Surveillance', val: facility.amenities?.cctv, icon: ShieldCheck },
                { label: 'Wheelchair Access', val: facility.amenities?.accessible, icon: Accessibility },
                { label: 'Restrooms', val: facility.amenities?.restroom, icon: Coffee },
                { label: 'Free Guest Wi-Fi', val: facility.amenities?.wifi, icon: Wifi },
                { label: 'Valet Service', val: facility.amenities?.valetService, icon: Car },
              ].map((item, idx) => {
                const Icon = item.icon;
                const active = item.val;
                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border flex items-center gap-2.5 transition ${
                      active
                        ? 'bg-navy-850/80 border-emerald-500/30 text-white'
                        : 'bg-navy-950/40 border-navy-800/60 text-slate-500 opacity-60'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? 'text-emerald-400' : 'text-slate-600'}`} />
                    <span className="text-xs font-medium">{item.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pricing Rules Table */}
          <div className="bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white">Configured Pricing Schedule</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-navy-850 text-slate-400 uppercase text-[10px] tracking-wider border-b border-navy-800">
                  <tr>
                    <th className="py-3 px-4">Vehicle Category</th>
                    <th className="py-3 px-4">Rate Structure</th>
                    <th className="py-3 px-4">Base Rate</th>
                    <th className="py-3 px-4">Min Charge</th>
                    <th className="py-3 px-4">Daily Cap</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-800/60 font-mono">
                  {facility.pricingRules?.map((rule, idx) => (
                    <tr key={idx} className="hover:bg-navy-850/40 transition">
                      <td className="py-3 px-4 capitalize font-sans font-semibold text-white">
                        {rule.vehicleType}
                      </td>
                      <td className="py-3 px-4 capitalize text-slate-400">
                        {rule.rateType}
                      </td>
                      <td className="py-3 px-4 font-bold text-emerald-400">
                        ₹{rule.baseRate}/{rule.rateType === 'daily' ? 'day' : 'hr'}
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        ₹{rule.minimumCharge || rule.baseRate}
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {rule.maximumDailyCharge ? `₹${rule.maximumDailyCharge}/day` : 'None'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Entry & Exit Guidelines */}
          <div className="bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white">Entry & Departure Protocol</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-navy-850 border border-navy-700/80 space-y-1.5">
                <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Entry Instructions</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  {facility.entryInstructions || 'Arrive at the designated entrance gate. Present your digital QR pass to the optical scanner or barrier attendant for automated validation.'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-navy-850 border border-navy-700/80 space-y-1.5">
                <div className="font-bold text-blue-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Departure Instructions</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  {facility.exitInstructions || 'Proceed to the departure lane. Scan your demo reference code to conclude your parking session and trigger receipt generation.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (1 col): Operating Hours, Location Map, Reviews */}
        <div className="space-y-8">
          {/* Operating Hours */}
          <div className="bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>Operating Hours</span>
            </h3>
            <div className="space-y-1.5 text-xs">
              {facility.operatingHours?.map((oh, idx) => (
                <div key={idx} className="flex justify-between py-1 border-b border-navy-800/40 text-slate-300">
                  <span className="capitalize font-medium">{oh.day}</span>
                  <span className={`font-mono ${oh.isClosed ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {oh.isClosed ? 'Closed' : `${oh.open} - ${oh.close}`}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Mini Map */}
          <div className="bg-navy-900 border border-navy-800 rounded-2xl p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between text-xs">
              <h3 className="font-bold text-white flex items-center gap-1.5">
                <Navigation className="w-4 h-4 text-emerald-400" />
                <span>Facility Map Location</span>
              </h3>
              <span className="text-slate-400 text-[10px]">OpenStreetMap</span>
            </div>
            <div className="h-48 rounded-xl overflow-hidden border border-navy-800">
              <ParkingMap
                facilities={[facility]}
                selectedId={facility._id}
              />
            </div>
          </div>

          {/* Reviews List & Write Review Button */}
          <div className="bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Driver Reviews</h3>
                <p className="text-xs text-slate-400">{reviews.length} feedback entries</p>
              </div>
              <button
                onClick={() => setReviewModalOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-emerald-400 text-xs font-semibold border border-navy-700 flex items-center gap-1 transition"
              >
                <MessageSquarePlus className="w-3.5 h-3.5" />
                <span>Write Review</span>
              </button>
            </div>

            <div className="space-y-3">
              {reviews.length === 0 ? (
                <div className="py-6 text-center text-slate-500 text-xs">
                  No driver reviews yet. Be the first to share your experience!
                </div>
              ) : (
                reviews.map((r) => (
                  <div key={r._id} className="p-3.5 rounded-xl bg-navy-850 border border-navy-800 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-white">{r.user?.name || 'Driver'}</span>
                      <div className="flex items-center gap-0.5 text-amber-400">
                        <Star className="w-3 h-3 fill-current" />
                        <span className="font-mono text-xs">{r.rating}</span>
                      </div>
                    </div>
                    {r.title && <div className="text-xs font-bold text-slate-200">{r.title}</div>}
                    <p className="text-xs text-slate-400 leading-relaxed">{r.comment}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-navy-900 border border-navy-700 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Write Facility Review</h3>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Rating
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setNewRating(s)}
                      className="p-1 hover:scale-110 transition"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          s <= newRating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Review Headline
                </label>
                <input
                  type="text"
                  placeholder="e.g. Great location and smooth EV charging"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-navy-850 border border-navy-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Comments & Feedback
                </label>
                <textarea
                  rows="3"
                  placeholder="Share details on security, cleanliness, or slot accessibility..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-navy-850 border border-navy-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-navy-800 text-slate-300 hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submittingReview ? 'Submitting...' : 'Post Review'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
