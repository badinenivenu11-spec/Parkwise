import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  MapPin,
  Star,
  Zap,
  ShieldCheck,
  Umbrella,
  Accessibility,
  Heart,
  ChevronRight,
  Car,
  Clock
} from 'lucide-react';

export default function FacilityCard({ facility, onCompare, isComparing }) {
  const { favorites, toggleFavorite } = useAuth();
  const isFav = favorites.includes(facility._id);

  const carRate = facility.pricingRules?.find(p => p.vehicleType === 'car') || facility.pricingRules?.[0];
  const availRatio = facility.availableSlots / (facility.totalSlots || 1);

  const availColor =
    facility.availableSlots === 0
      ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
      : availRatio < 0.2
      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';

  return (
    <div className="bg-navy-900 border border-navy-800 hover:border-navy-700 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col group">
      {/* Image & overlay badges */}
      <div className="relative h-48 overflow-hidden bg-navy-950">
        <img
          src={facility.coverImage || 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=800'}
          alt={facility.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-transparent to-black/30" />

        {/* Favorite button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleFavorite(facility._id);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition ${
            isFav
              ? 'bg-rose-500 text-white shadow-lg'
              : 'bg-black/50 text-white hover:bg-black/80'
          }`}
          title={isFav ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
        </button>

        {/* Facility Type Badge */}
        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-black/60 text-white backdrop-blur-md border border-white/10 uppercase tracking-wider">
          {facility.facilityType}
        </span>

        {/* Rating */}
        {facility.rating > 0 && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2 py-0.5 rounded-md bg-navy-900/90 border border-navy-700 text-xs font-semibold text-amber-300">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{facility.rating.toFixed(1)}</span>
            <span className="text-[10px] text-slate-400">({facility.reviewCount})</span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Facility name & City */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <Link
              to={`/facilities/${facility._id}`}
              className="text-base font-bold text-white hover:text-emerald-400 transition line-clamp-1"
            >
              {facility.name}
            </Link>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-3">
            <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="truncate">
              {facility.address?.street ? `${facility.address.street}, ` : ''}
              {facility.address?.city}
            </span>
          </div>

          {/* Availability Bar & Badge */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-400">Availability:</span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${availColor}`}>
                {facility.availableSlots} / {facility.totalSlots} Slots Free
              </span>
            </div>
            <div className="w-full h-1.5 bg-navy-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  facility.availableSlots === 0
                    ? 'bg-rose-500'
                    : availRatio < 0.2
                    ? 'bg-amber-400'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, Math.max(5, (facility.availableSlots / facility.totalSlots) * 100))}%` }}
              />
            </div>
          </div>

          {/* Amenities Pills */}
          <div className="flex flex-wrap items-center gap-1.5 mb-4">
            {facility.amenities?.evCharging && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-medium border border-emerald-500/20">
                <Zap className="w-3 h-3" /> EV Charging
              </span>
            )}
            {facility.amenities?.covered && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[10px] font-medium border border-blue-500/20">
                <Umbrella className="w-3 h-3" /> Covered
              </span>
            )}
            {facility.amenities?.security && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 text-[10px] font-medium border border-purple-500/20">
                <ShieldCheck className="w-3 h-3" /> Guarded
              </span>
            )}
            {facility.amenities?.accessible && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-medium border border-slate-700">
                <Accessibility className="w-3 h-3" /> Accessible
              </span>
            )}
          </div>
        </div>

        {/* Footer info & CTA */}
        <div className="pt-4 border-t border-navy-800/80 flex items-center justify-between gap-2">
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Starts From</div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-black text-white">
                ₹{carRate ? carRate.baseRate : 50}
              </span>
              <span className="text-xs text-slate-400">/{carRate?.rateType === 'daily' ? 'day' : 'hr'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onCompare && (
              <button
                onClick={() => onCompare(facility)}
                className={`p-2 rounded-lg text-xs font-medium border transition ${
                  isComparing
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                    : 'bg-navy-800 border-navy-700 text-slate-300 hover:text-white'
                }`}
                title="Add to comparison"
              >
                vs
              </button>
            )}

            <Link
              to={`/facilities/${facility._id}`}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1 shadow-lg shadow-emerald-600/20"
            >
              <span>Book Slot</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
