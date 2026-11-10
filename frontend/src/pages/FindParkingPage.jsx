import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { facilityApi } from '../services/api';
import FacilityCard from '../components/FacilityCard';
import ParkingMap from '../components/ParkingMap';
import {
  Search,
  Filter,
  SlidersHorizontal,
  MapPin,
  Car,
  Zap,
  Umbrella,
  ShieldCheck,
  Accessibility,
  ArrowUpDown,
  RotateCcw,
  LayoutGrid,
  Map,
  ChevronRight,
  Layers
} from 'lucide-react';

export default function FindParkingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Search & Filter State
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [name, setName] = useState(searchParams.get('name') || '');
  const [vehicleType, setVehicleType] = useState(searchParams.get('vehicleType') || '');
  const [facilityType, setFacilityType] = useState(searchParams.get('facilityType') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [covered, setCovered] = useState(searchParams.get('covered') === 'true');
  const [evCharging, setEvCharging] = useState(searchParams.get('evCharging') === 'true');
  const [accessible, setAccessible] = useState(searchParams.get('accessible') === 'true');
  const [security, setSecurity] = useState(searchParams.get('security') === 'true');
  const [availableOnly, setAvailableOnly] = useState(searchParams.get('available') === 'true');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'rating');

  // UI state
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'map'
  const [facilities, setFacilities] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedMapFacility, setSelectedMapFacility] = useState(null);
  const [comparingList, setComparingList] = useState([]);

  // Fetch facilities from backend
  const fetchFacilities = async () => {
    try {
      setLoading(true);
      const params = {
        city: city || undefined,
        name: name || undefined,
        vehicleType: vehicleType || undefined,
        facilityType: facilityType || undefined,
        minPrice: minPrice || undefined,
        maxPrice: maxPrice || undefined,
        covered: covered ? 'true' : undefined,
        evCharging: evCharging ? 'true' : undefined,
        accessible: accessible ? 'true' : undefined,
        security: security ? 'true' : undefined,
        available: availableOnly ? 'true' : undefined,
        sortBy,
        limit: 30,
      };

      const res = await facilityApi.getAll(params);
      if (res.data.success) {
        setFacilities(res.data.facilities);
        setTotalCount(res.data.total);
      }
    } catch (err) {
      console.error('Failed to load facilities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, [city, name, vehicleType, facilityType, minPrice, maxPrice, covered, evCharging, accessible, security, availableOnly, sortBy]);

  const handleResetFilters = () => {
    setCity('');
    setName('');
    setVehicleType('');
    setFacilityType('');
    setMinPrice('');
    setMaxPrice('');
    setCovered(false);
    setEvCharging(false);
    setAccessible(false);
    setSecurity(false);
    setAvailableOnly(false);
    setSortBy('rating');
    setSearchParams({});
  };

  const handleToggleCompare = (facility) => {
    if (comparingList.find((f) => f._id === facility._id)) {
      setComparingList(comparingList.filter((f) => f._id !== facility._id));
    } else {
      if (comparingList.length >= 3) {
        alert('You can compare a maximum of 3 facilities simultaneously.');
        return;
      }
      setComparingList([...comparingList, facility]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Title & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-navy-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Find Parking Facilities
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time slot availability, smart filters, and interactive mapping
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Compare Pill Banner */}
          {comparingList.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400">
              <span className="font-semibold">{comparingList.length}/3 Selected</span>
              <button
                onClick={() =>
                  navigate(`/compare?ids=${comparingList.map((f) => f._id).join(',')}`)
                }
                className="underline font-bold text-white hover:text-emerald-300"
              >
                Compare Now
              </button>
            </div>
          )}

          {/* View Mode Toggle */}
          <div className="flex items-center bg-navy-900 border border-navy-700/80 p-1 rounded-xl text-xs">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition ${
                viewMode === 'grid'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Grid</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition ${
                viewMode === 'map'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Map className="w-4 h-4" />
              <span>Map View</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Toolbar Box */}
      <div className="bg-navy-900/90 border border-navy-800 rounded-2xl p-5 shadow-xl space-y-4">
        {/* Row 1: Search Inputs & Sorting */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Facility name search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="Search facility name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-navy-850 border border-navy-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          {/* City search */}
          <div className="relative">
            <MapPin className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="Filter by city (e.g. Bengaluru)..."
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-navy-850 border border-navy-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          {/* Vehicle category */}
          <select
            value={vehicleType}
            onChange={(e) => setVehicleType(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-navy-850 border border-navy-700 text-xs text-white focus:outline-none focus:border-emerald-500 transition"
          >
            <option value="">All Vehicle Types</option>
            <option value="car">Car / Sedan</option>
            <option value="suv">SUV</option>
            <option value="motorcycle">Motorcycle</option>
            <option value="van">Van</option>
          </select>

          {/* Sort By */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-navy-850 border border-navy-700 text-xs text-white focus:outline-none focus:border-emerald-500 transition"
            >
              <option value="rating">Sort: Highest Rated</option>
              <option value="availability">Sort: Most Slots Free</option>
              <option value="price_asc">Sort: Price (Low to High)</option>
              <option value="price_desc">Sort: Price (High to Low)</option>
              <option value="name">Sort: Name (A to Z)</option>
            </select>
          </div>
        </div>

        {/* Row 2: Checkboxes, Price Range & Reset */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-navy-800 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={availableOnly}
                onChange={(e) => setAvailableOnly(e.target.checked)}
                className="rounded bg-navy-850 border-navy-700 text-emerald-500 focus:ring-emerald-500"
              />
              <span className="font-semibold text-emerald-400">Available Slots Only</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={evCharging}
                onChange={(e) => setEvCharging(e.target.checked)}
                className="rounded bg-navy-850 border-navy-700 text-emerald-500 focus:ring-emerald-500"
              />
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>EV Charging</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={covered}
                onChange={(e) => setCovered(e.target.checked)}
                className="rounded bg-navy-850 border-navy-700 text-emerald-500 focus:ring-emerald-500"
              />
              <Umbrella className="w-3.5 h-3.5 text-blue-400" />
              <span>Covered</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={security}
                onChange={(e) => setSecurity(e.target.checked)}
                className="rounded bg-navy-850 border-navy-700 text-emerald-500 focus:ring-emerald-500"
              />
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              <span>Security</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={accessible}
                onChange={(e) => setAccessible(e.target.checked)}
                className="rounded bg-navy-850 border-navy-700 text-emerald-500 focus:ring-emerald-500"
              />
              <Accessibility className="w-3.5 h-3.5 text-slate-400" />
              <span>Accessible</span>
            </label>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-400 text-xs">
              Found <strong>{totalCount}</strong> facilities
            </span>
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1 text-slate-400 hover:text-rose-400 text-xs transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="py-24 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 text-xs">Querying MongoDB facilities...</p>
        </div>
      ) : facilities.length === 0 ? (
        <div className="bg-navy-900 border border-navy-800 rounded-3xl p-16 text-center max-w-lg mx-auto space-y-4">
          <MapPin className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No parking facilities match your search</h3>
          <p className="text-xs text-slate-400">
            Try broadening your locality filters, adjusting pricing parameters, or clearing EV/covered filters.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition"
          >
            Clear All Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {facilities.map((fac) => (
            <FacilityCard
              key={fac._id}
              facility={fac}
              onCompare={handleToggleCompare}
              isComparing={!!comparingList.find((f) => f._id === fac._id)}
            />
          ))}
        </div>
      ) : (
        /* Map View with Side List */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[650px]">
          {/* Side facility cards list */}
          <div className="lg:col-span-1 overflow-y-auto space-y-3 pr-2">
            {facilities.map((fac) => {
              const isSelected = selectedMapFacility?._id === fac._id;
              const carRate =
                fac.pricingRules?.find((p) => p.vehicleType === 'car') || fac.pricingRules?.[0];
              return (
                <div
                  key={fac._id}
                  onClick={() => setSelectedMapFacility(fac)}
                  className={`p-4 rounded-xl border cursor-pointer transition ${
                    isSelected
                      ? 'bg-navy-850 border-emerald-500 shadow-lg shadow-emerald-500/10'
                      : 'bg-navy-900 border-navy-800 hover:border-navy-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-sm text-white line-clamp-1">{fac.name}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{fac.address?.city}</p>
                    </div>
                    <span className="font-black text-sm text-white font-mono">
                      ₹{carRate ? carRate.baseRate : 50}/hr
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs mt-3 pt-2 border-t border-navy-800">
                    <span className="text-emerald-400 font-semibold">
                      {fac.availableSlots} slots available
                    </span>
                    <Link
                      to={`/facilities/${fac._id}`}
                      className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                    >
                      <span>Book</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Leaflet OpenStreetMap View */}
          <div className="lg:col-span-2 h-full">
            <ParkingMap
              facilities={facilities}
              selectedId={selectedMapFacility?._id}
              onSelectFacility={(fac) => setSelectedMapFacility(fac)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
