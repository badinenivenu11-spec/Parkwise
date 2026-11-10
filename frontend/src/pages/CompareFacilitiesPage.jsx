import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { facilityApi } from '../services/api';
import {
  SlidersHorizontal,
  X,
  Plus,
  Check,
  Zap,
  Umbrella,
  ShieldCheck,
  Accessibility,
  Star,
  MapPin,
  ChevronRight,
  Clock,
  Car
} from 'lucide-react';

export default function CompareFacilitiesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [allFacilities, setAllFacilities] = useState([]);
  const [selectedIds, setSelectedIds] = useState(() => {
    const raw = searchParams.get('ids');
    return raw ? raw.split(',').filter(Boolean) : [];
  });
  const [duration, setDuration] = useState(2);
  const [vehicleType, setVehicleType] = useState('car');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    facilityApi.getAll({ limit: 50 }).then((res) => {
      if (res.data.success) {
        setAllFacilities(res.data.facilities);
        // Default to first 2 if none specified
        if (selectedIds.length === 0 && res.data.facilities.length >= 2) {
          const defaults = [res.data.facilities[0]._id, res.data.facilities[1]._id];
          setSelectedIds(defaults);
          setSearchParams({ ids: defaults.join(',') });
        }
      }
      setLoading(false);
    });
  }, []);

  const handleRemove = (id) => {
    const next = selectedIds.filter((i) => i !== id);
    setSelectedIds(next);
    setSearchParams(next.length ? { ids: next.join(',') } : {});
  };

  const handleAdd = (id) => {
    if (selectedIds.length >= 3) {
      alert('You can compare a maximum of 3 facilities at once.');
      return;
    }
    const next = [...selectedIds, id];
    setSelectedIds(next);
    setSearchParams({ ids: next.join(',') });
  };

  const selectedFacilities = allFacilities.filter((f) => selectedIds.includes(f._id));
  const availableToAdd = allFacilities.filter((f) => !selectedIds.includes(f._id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-navy-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <SlidersHorizontal className="w-6 h-6 text-emerald-400" />
            <span>Compare Parking Facilities</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Side-by-side comparison of pricing, live availability, EV stations, and amenities
          </p>
        </div>

        {/* Duration & Vehicle Selector for Normalized Price Comparison */}
        <div className="flex items-center gap-3 bg-navy-900 border border-navy-700/80 p-2 rounded-2xl text-xs">
          <div className="flex items-center gap-1.5 pl-2">
            <span className="text-slate-400">Duration:</span>
            <select
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              className="bg-navy-850 border border-navy-700 rounded-lg px-2 py-1 text-white font-mono"
            >
              <option value="1">1 Hour</option>
              <option value="2">2 Hours</option>
              <option value="4">4 Hours</option>
              <option value="8">8 Hours</option>
              <option value="24">24 Hours</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 pl-2 border-l border-navy-800">
            <span className="text-slate-400">Vehicle:</span>
            <select
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
              className="bg-navy-850 border border-navy-700 rounded-lg px-2 py-1 text-white capitalize"
            >
              <option value="car">Car</option>
              <option value="suv">SUV</option>
              <option value="motorcycle">Motorcycle</option>
              <option value="van">Van</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center text-slate-400 text-xs">Loading comparison matrix...</div>
      ) : selectedFacilities.length === 0 ? (
        <div className="p-12 text-center bg-navy-900 border border-navy-800 rounded-3xl space-y-3">
          <p className="text-slate-400 text-sm">No facilities selected for comparison.</p>
          <div className="flex justify-center gap-2">
            {allFacilities.slice(0, 3).map((f) => (
              <button
                key={f._id}
                onClick={() => handleAdd(f._id)}
                className="px-3 py-1.5 rounded-xl bg-navy-850 hover:bg-navy-800 border border-navy-700 text-xs font-semibold text-white"
              >
                + Add {f.name}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Comparison Matrix Table */}
          <div className="bg-navy-900 border border-navy-800 rounded-3xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead>
                  <tr className="bg-navy-950 border-b border-navy-800">
                    <th className="p-4 w-1/4 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                      Metric / Specification
                    </th>
                    {selectedFacilities.map((f) => (
                      <th key={f._id} className="p-4 w-1/4 text-white align-top">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <Link to={`/facilities/${f._id}`} className="font-bold text-sm text-white hover:text-emerald-400 transition line-clamp-1">
                              {f.name}
                            </Link>
                            <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-emerald-400" />
                              <span>{f.address?.city}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemove(f._id)}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-navy-800 transition"
                            title="Remove from comparison"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </th>
                    ))}
                    {selectedFacilities.length < 3 && (
                      <th className="p-4 text-slate-400 align-middle text-center bg-navy-950/40">
                        <span className="text-[11px] block mb-2">Slot Open</span>
                        <select
                          onChange={(e) => {
                            if (e.target.value) handleAdd(e.target.value);
                          }}
                          value=""
                          className="bg-navy-850 border border-navy-700 text-xs text-white rounded-lg px-2.5 py-1.5 focus:outline-none"
                        >
                          <option value="">+ Add Facility</option>
                          {availableToAdd.map((a) => (
                            <option key={a._id} value={a._id}>
                              {a.name}
                            </option>
                          ))}
                        </select>
                      </th>
                    )}
                  </tr>
                </thead>

                <tbody className="divide-y divide-navy-800/80">
                  {/* Photo row */}
                  <tr>
                    <td className="p-4 font-semibold text-slate-400 bg-navy-950/20">Preview Photo</td>
                    {selectedFacilities.map((f) => (
                      <td key={f._id} className="p-4">
                        <div className="h-28 rounded-xl overflow-hidden bg-navy-950 border border-navy-800">
                          <img src={f.coverImage} alt={f.name} className="w-full h-full object-cover" />
                        </div>
                      </td>
                    ))}
                    {selectedFacilities.length < 3 && <td />}
                  </tr>

                  {/* Estimated Cost */}
                  <tr className="bg-emerald-950/10">
                    <td className="p-4 font-bold text-emerald-400">
                      Estimated Cost ({duration}h, {vehicleType})
                    </td>
                    {selectedFacilities.map((f) => {
                      const pricing = f.pricingRules?.find((p) => p.vehicleType === vehicleType) || f.pricingRules?.[0] || { baseRate: 50 };
                      const cost = (pricing.baseRate || 50) * duration;
                      return (
                        <td key={f._id} className="p-4 font-mono font-bold text-lg text-emerald-400">
                          ₹{cost.toFixed(2)}
                          <span className="text-xs font-normal text-slate-400 block font-sans">
                            (₹{pricing.baseRate}/hr base rate)
                          </span>
                        </td>
                      );
                    })}
                    {selectedFacilities.length < 3 && <td />}
                  </tr>

                  {/* Live Slot Availability */}
                  <tr>
                    <td className="p-4 font-semibold text-slate-400 bg-navy-950/20">Live Slot Availability</td>
                    {selectedFacilities.map((f) => (
                      <td key={f._id} className="p-4">
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${f.availableSlots > 0 ? 'bg-emerald-400' : 'bg-rose-500'}`} />
                          <span className="font-bold text-white font-mono">{f.availableSlots}</span>
                          <span className="text-slate-400">/ {f.totalSlots} Slots Free</span>
                        </div>
                      </td>
                    ))}
                    {selectedFacilities.length < 3 && <td />}
                  </tr>

                  {/* Facility Parking Type */}
                  <tr>
                    <td className="p-4 font-semibold text-slate-400 bg-navy-950/20">Structure Type</td>
                    {selectedFacilities.map((f) => (
                      <td key={f._id} className="p-4 uppercase font-semibold text-white text-xs">
                        {f.facilityType}
                      </td>
                    ))}
                    {selectedFacilities.length < 3 && <td />}
                  </tr>

                  {/* EV Fast Charging */}
                  <tr>
                    <td className="p-4 font-semibold text-slate-400 bg-navy-950/20">EV Fast Charging</td>
                    {selectedFacilities.map((f) => (
                      <td key={f._id} className="p-4">
                        {f.amenities?.evCharging ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                            <Zap className="w-4 h-4" /> Available
                          </span>
                        ) : (
                          <span className="text-slate-500">Not Available</span>
                        )}
                      </td>
                    ))}
                    {selectedFacilities.length < 3 && <td />}
                  </tr>

                  {/* Covered / Weather Protection */}
                  <tr>
                    <td className="p-4 font-semibold text-slate-400 bg-navy-950/20">Weather Protection</td>
                    {selectedFacilities.map((f) => (
                      <td key={f._id} className="p-4">
                        {f.amenities?.covered ? (
                          <span className="inline-flex items-center gap-1 text-blue-400 font-semibold">
                            <Umbrella className="w-4 h-4" /> Covered Garage
                          </span>
                        ) : (
                          <span className="text-slate-400">Open-Air Surface</span>
                        )}
                      </td>
                    ))}
                    {selectedFacilities.length < 3 && <td />}
                  </tr>

                  {/* Security & CCTV */}
                  <tr>
                    <td className="p-4 font-semibold text-slate-400 bg-navy-950/20">Security Standard</td>
                    {selectedFacilities.map((f) => (
                      <td key={f._id} className="p-4">
                        {f.amenities?.security || f.amenities?.cctv ? (
                          <span className="inline-flex items-center gap-1 text-purple-400 font-semibold">
                            <ShieldCheck className="w-4 h-4" /> Guarded + CCTV
                          </span>
                        ) : (
                          <span className="text-slate-500">Standard</span>
                        )}
                      </td>
                    ))}
                    {selectedFacilities.length < 3 && <td />}
                  </tr>

                  {/* Wheelchair Accessibility */}
                  <tr>
                    <td className="p-4 font-semibold text-slate-400 bg-navy-950/20">Accessibility</td>
                    {selectedFacilities.map((f) => (
                      <td key={f._id} className="p-4">
                        {f.amenities?.accessible ? (
                          <span className="inline-flex items-center gap-1 text-slate-200">
                            <Accessibility className="w-4 h-4 text-blue-400" /> Supported
                          </span>
                        ) : (
                          <span className="text-slate-500">Standard access</span>
                        )}
                      </td>
                    ))}
                    {selectedFacilities.length < 3 && <td />}
                  </tr>

                  {/* Rating */}
                  <tr>
                    <td className="p-4 font-semibold text-slate-400 bg-navy-950/20">Customer Rating</td>
                    {selectedFacilities.map((f) => (
                      <td key={f._id} className="p-4">
                        <div className="flex items-center gap-1 font-bold text-amber-300">
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          <span>{f.rating?.toFixed(1) || '4.0'}</span>
                          <span className="text-slate-500 text-[10px]">({f.reviewCount} reviews)</span>
                        </div>
                      </td>
                    ))}
                    {selectedFacilities.length < 3 && <td />}
                  </tr>

                  {/* Direct Action Row */}
                  <tr className="bg-navy-950/50">
                    <td className="p-4 font-bold text-white">Direct Booking</td>
                    {selectedFacilities.map((f) => (
                      <td key={f._id} className="p-4">
                        <Link
                          to={`/slots/${f._id}`}
                          className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-1.5"
                        >
                          <span>Reserve Spot</span>
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </td>
                    ))}
                    {selectedFacilities.length < 3 && <td />}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
