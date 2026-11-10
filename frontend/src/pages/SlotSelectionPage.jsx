import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { facilityApi, slotApi, vehicleApi, reservationApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import InteractiveSlotGrid from '../components/InteractiveSlotGrid';
import {
  Calendar,
  Clock,
  Car,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Zap,
  MapPin,
  Sparkles,
  Plus
} from 'lucide-react';

export default function SlotSelectionPage() {
  const { facilityId } = useParams();
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const { addToast } = useToast();

  const [facility, setFacility] = useState(null);
  const [slots, setSlots] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Reservation configuration state
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [startTime, setStartTime] = useState(() => {
    // Default to nearest next hour
    const d = new Date();
    d.setMinutes(0, 0, 0);
    d.setHours(d.getHours() + 1);
    // Format YYYY-MM-DDTHH:mm for datetime-local
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:00`;
  });
  const [durationHours, setDurationHours] = useState(2);

  // Quick add vehicle modal
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [newReg, setNewReg] = useState('');
  const [newType, setNewType] = useState('car');
  const [newMake, setNewMake] = useState('');
  const [newModel, setNewModel] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [facRes, slotsRes, vehRes] = await Promise.allSettled([
        facilityApi.getById(facilityId),
        slotApi.getByFacility(facilityId),
        vehicleApi.getAll()
      ]);

      if (facRes.status === 'fulfilled' && facRes.value.data.success) {
        setFacility(facRes.value.data.facility);
      }

      if (slotsRes.status === 'fulfilled' && slotsRes.value.data.success) {
        setSlots(slotsRes.value.data.slots);
      }

      if (vehRes.status === 'fulfilled' && vehRes.value.data.success) {
        const vList = vehRes.value.data.vehicles || [];
        setVehicles(vList);
        const def = vList.find((v) => v.isDefault) || vList[0];
        if (def) setSelectedVehicleId(def._id);
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to load parking slot data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [facilityId]);

  const handleQuickAddVehicle = async (e) => {
    e.preventDefault();
    if (!newReg.trim()) {
      addToast('Please enter registration plate number', 'warning');
      return;
    }
    try {
      const res = await vehicleApi.create({
        registrationNumber: newReg.trim().toUpperCase(),
        vehicleType: newType,
        make: newMake || 'Generic',
        model: newModel || 'Vehicle',
        isDefault: vehicles.length === 0,
      });
      if (res.data.success) {
        const created = res.data.vehicle;
        setVehicles([created, ...vehicles]);
        setSelectedVehicleId(created._id);
        setShowAddVehicle(false);
        setNewReg('');
        setNewMake('');
        setNewModel('');
        addToast('Vehicle added successfully!', 'success');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to save vehicle', 'error');
    }
  };

  const handleConfirmReservation = async () => {
    if (!facility) return;

    if (!startTime) {
      addToast('Please select arrival date and time', 'warning');
      return;
    }

    const start = new Date(startTime);
    if (start < new Date(Date.now() - 5 * 60 * 1000)) {
      addToast('Arrival time cannot be in the past', 'warning');
      return;
    }

    try {
      setBookingLoading(true);

      const payload = {
        facilityId: facility._id,
        slotId: selectedSlot?._id || undefined,
        vehicleId: selectedVehicleId || undefined,
        startTime: start.toISOString(),
        durationHours: parseFloat(durationHours),
      };

      const res = await reservationApi.create(payload);

      if (res.data.success) {
        addToast('Reservation successfully created!', 'success');
        const r = res.data.reservation;
        navigate(`/confirmation/${r._id}`);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Reservation booking failed';
      addToast(msg, 'error');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-32 text-center space-y-3">
        <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-slate-400 text-xs">Loading interactive parking layout & slot map...</p>
      </div>
    );
  }

  if (!facility) {
    return (
      <div className="max-w-md mx-auto py-32 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Facility Not Found</h2>
        <Link to="/find" className="inline-block px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold">
          Back to Search
        </Link>
      </div>
    );
  }

  const selectedVehicle = vehicles.find((v) => v._id === selectedVehicleId);
  const vehicleTypeToUse = selectedVehicle?.vehicleType || 'car';
  const pricingRule =
    facility.pricingRules?.find((p) => p.vehicleType === vehicleTypeToUse) ||
    facility.pricingRules?.[0] || { baseRate: 50 };

  const estimatedTotal = (pricingRule.baseRate || 50) * durationHours;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header Card */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <Link to={`/facilities/${facility._id}`} className="hover:text-emerald-400 transition">
              {facility.name}
            </Link>
            <span>•</span>
            <span className="text-slate-300">{facility.address?.city}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Choose Your Parking Spot
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Pick your desired slot from the layout or let the system auto-assign upon arrival.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="p-3 rounded-xl bg-navy-850 border border-navy-700 text-right">
            <div className="text-slate-400 uppercase text-[10px]">Rate Applicable</div>
            <div className="text-lg font-black text-emerald-400">₹{pricingRule.baseRate}/hr</div>
          </div>
          <div className="p-3 rounded-xl bg-navy-850 border border-navy-700 text-right">
            <div className="text-slate-400 uppercase text-[10px]">Available Spots</div>
            <div className="text-lg font-black text-white">{facility.availableSlots}</div>
          </div>
        </div>
      </div>

      {/* Main Reservation Workflow Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Cols: Interactive Slot Grid */}
        <div className="lg:col-span-2 space-y-6">
          <InteractiveSlotGrid
            slots={slots}
            selectedSlot={selectedSlot}
            onSelectSlot={(slot) => setSelectedSlot(slot)}
            pricing={pricingRule}
            durationHours={durationHours}
            vehicleType={vehicleTypeToUse}
          />
        </div>

        {/* Right 1 Col: Reservation Parameters & Summary Box */}
        <div className="bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-2xl space-y-6 sticky top-24">
          <h3 className="text-base font-bold text-white border-b border-navy-800 pb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Booking Parameters</span>
          </h3>

          <div className="space-y-4 text-xs">
            {/* Arrival Time */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                Arrival Date & Time
              </label>
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-navy-850 border border-navy-700 text-white text-xs focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            {/* Duration */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  Parking Duration
                </label>
                <span className="font-bold text-emerald-400 font-mono">{durationHours} Hours</span>
              </div>
              <div className="flex gap-1.5 mb-2">
                {[1, 2, 3, 4, 8, 24].map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setDurationHours(h)}
                    className={`flex-1 py-1 rounded-lg text-xs font-semibold border transition ${
                      durationHours === h
                        ? 'bg-emerald-600 border-emerald-500 text-white'
                        : 'bg-navy-850 border-navy-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    {h}h
                  </button>
                ))}
              </div>
            </div>

            {/* Vehicle Selection */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Car className="w-3.5 h-3.5 text-emerald-400" />
                  Registered Vehicle
                </label>
                <button
                  type="button"
                  onClick={() => setShowAddVehicle(!showAddVehicle)}
                  className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add New</span>
                </button>
              </div>

              {vehicles.length === 0 ? (
                <div className="p-3 rounded-xl bg-navy-850 border border-navy-700/80 text-center space-y-2">
                  <p className="text-slate-400">No vehicles registered yet.</p>
                  <button
                    type="button"
                    onClick={() => setShowAddVehicle(true)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold"
                  >
                    Add Vehicle Plate
                  </button>
                </div>
              ) : (
                <select
                  value={selectedVehicleId}
                  onChange={(e) => setSelectedVehicleId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-navy-850 border border-navy-700 text-white text-xs focus:outline-none focus:border-emerald-500 font-mono"
                >
                  {vehicles.map((v) => (
                    <option key={v._id} value={v._id}>
                      {v.registrationNumber} — {v.make} {v.model} ({v.vehicleType})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Quick Add Vehicle Form Accordion */}
            {showAddVehicle && (
              <form onSubmit={handleQuickAddVehicle} className="p-3 rounded-xl bg-navy-850 border border-emerald-500/30 space-y-2.5">
                <div className="text-[11px] font-bold text-emerald-400 uppercase">New Vehicle Plate</div>
                <input
                  type="text"
                  placeholder="Plate Number (e.g. KA01AB1234)"
                  value={newReg}
                  onChange={(e) => setNewReg(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-navy-900 border border-navy-700 text-xs text-white uppercase font-mono"
                  required
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Make (e.g. Maruti)"
                    value={newMake}
                    onChange={(e) => setNewMake(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-navy-900 border border-navy-700 text-xs text-white"
                  />
                  <input
                    type="text"
                    placeholder="Model (e.g. Swift)"
                    value={newModel}
                    onChange={(e) => setNewModel(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-navy-900 border border-navy-700 text-xs text-white"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddVehicle(false)}
                    className="px-2 py-1 rounded text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 rounded bg-emerald-600 text-white font-bold"
                  >
                    Save Vehicle
                  </button>
                </div>
              </form>
            )}

            {/* Selected Slot Indicator */}
            <div className="p-3.5 rounded-xl bg-navy-850 border border-navy-700/80 flex items-center justify-between">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Space Assignment</span>
                <span className="text-sm font-bold text-white font-mono">
                  {selectedSlot ? `Spot ${selectedSlot.slotNumber} (Sec ${selectedSlot.section})` : 'Auto-Assign Available Spot'}
                </span>
              </div>
              {selectedSlot ? (
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold">
                  SELECTED
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded bg-navy-700 text-slate-300 font-mono text-[10px]">
                  AUTO
                </span>
              )}
            </div>

            {/* Price Breakdown */}
            <div className="p-3.5 rounded-xl bg-navy-950 border border-navy-800 space-y-2">
              <div className="flex justify-between text-slate-300">
                <span>Parking Base Rate:</span>
                <span className="font-mono">₹{pricingRule.baseRate}/hr</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Estimated Duration:</span>
                <span className="font-mono">{durationHours} hr{durationHours > 1 ? 's' : ''}</span>
              </div>
              <div className="border-t border-navy-800 pt-2 flex justify-between font-bold text-sm text-white">
                <span>Estimated Demo Total:</span>
                <span className="text-emerald-400 font-mono text-base">₹{estimatedTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Confirmation CTA */}
            <button
              onClick={handleConfirmReservation}
              disabled={bookingLoading}
              className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm shadow-xl shadow-emerald-600/30 transition flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{bookingLoading ? 'Reserving Spot...' : 'Confirm Demo Reservation'}</span>
            </button>

            <p className="text-[10px] text-slate-500 text-center leading-relaxed">
              * This is an academic demonstration reservation. No real payment is charged. Your slot is held in the MongoDB database.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
