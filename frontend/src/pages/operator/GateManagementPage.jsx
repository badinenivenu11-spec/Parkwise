import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { reservationApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  QrCode,
  Search,
  CheckCircle2,
  LogOut,
  Car,
  Clock,
  MapPin,
  AlertTriangle,
  Receipt,
  RotateCcw,
  Sparkles,
  ShieldAlert
} from 'lucide-react';

export default function GateManagementPage() {
  const [searchParams] = useSearchParams();
  const { addToast } = useToast();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [searching, setSearching] = useState(false);
  const [foundReservation, setFoundReservation] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [checkoutResult, setCheckoutResult] = useState(null);

  // If query in URL, trigger search immediately
  useEffect(() => {
    if (searchParams.get('q')) {
      handleSearch(searchParams.get('q'));
    }
  }, [searchParams]);

  const handleSearch = async (overrideQuery) => {
    const q = (overrideQuery || query).trim();
    if (!q) {
      addToast('Please enter a reservation reference or vehicle plate', 'warning');
      return;
    }
    try {
      setSearching(true);
      setFoundReservation(null);
      setCheckoutResult(null);

      // Search by reservation reference or ID
      const res = await reservationApi.getById(q);
      if (res.data.success) {
        setFoundReservation(res.data.reservation);
      }
    } catch (err) {
      // Fallback: search all reservations matching plate number
      try {
        const allRes = await reservationApi.getAll({ limit: 50 });
        if (allRes.data.success) {
          const matched = allRes.data.reservations.find(
            (r) =>
              r.vehicleSnapshot?.registrationNumber?.toLowerCase() === q.toLowerCase() ||
              r.reservationRef?.toLowerCase() === q.toLowerCase()
          );
          if (matched) {
            setFoundReservation(matched);
            return;
          }
        }
        addToast('No active reservation found matching query', 'error');
      } catch (e2) {
        addToast('Reservation search failed', 'error');
      }
    } finally {
      setSearching(false);
    }
  };

  const handleCheckIn = async () => {
    if (!foundReservation) return;
    try {
      setActionLoading(true);
      const res = await reservationApi.checkIn(foundReservation._id);
      if (res.data.success) {
        addToast(`Vehicle ${foundReservation.vehicleSnapshot?.registrationNumber || ''} verified and barrier opened!`, 'success');
        setFoundReservation(res.data.reservation);
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Check-in failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!foundReservation) return;
    try {
      setActionLoading(true);
      const res = await reservationApi.checkOut(foundReservation._id);
      if (res.data.success) {
        setCheckoutResult(res.data.reservation);
        setFoundReservation(res.data.reservation);
        addToast('Departure verified and barrier opened! Spot marked available.', 'success');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Checkout failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-navy-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
            <QrCode className="w-6 h-6 text-emerald-400" />
            <span>Gate Entry & Departure Terminal</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Scan demo QR passes or enter license plate numbers to trigger automated barrier control
          </p>
        </div>

        <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-bold self-start sm:self-auto">
          GATE 1: OPERATIONAL
        </span>
      </div>

      {/* Search / Scan Input Box */}
      <div className="bg-navy-900 border border-navy-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="space-y-4"
        >
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
            Scan Barcode or Enter Reference / License Plate
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="e.g. PK..., or KA01AB1234"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-navy-850 border border-navy-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={searching}
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2 shrink-0"
            >
              <QrCode className="w-4 h-4" />
              <span>{searching ? 'Scanning...' : 'Verify Gate Pass'}</span>
            </button>
          </div>
        </form>

        {/* Quick Test Codes */}
        <div className="flex flex-wrap items-center gap-2 pt-2 text-[11px] text-slate-400">
          <span>Quick test:</span>
          {['KA-01-AB-1234', 'KA-01-CD-5678', 'MH-02-EF-9012'].map((plate) => (
            <button
              key={plate}
              type="button"
              onClick={() => {
                setQuery(plate);
                handleSearch(plate);
              }}
              className="px-2 py-0.5 rounded bg-navy-850 border border-navy-700 text-slate-300 hover:text-white font-mono"
            >
              {plate}
            </button>
          ))}
        </div>
      </div>

      {/* Result Verification Card */}
      {foundReservation && (
        <div className="bg-navy-900 border-2 border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-navy-800 gap-2">
            <div>
              <span className="text-[10px] font-bold text-emerald-400 uppercase font-mono">
                Verified Booking Record
              </span>
              <h3 className="text-xl font-black text-white font-mono">
                {foundReservation.reservationRef}
              </h3>
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase border bg-navy-850 text-slate-200 border-navy-700 self-start sm:self-auto">
              Status: {foundReservation.status.replace('_', ' ')}
            </span>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-navy-850 border border-navy-800 space-y-1">
              <span className="text-slate-500 uppercase text-[10px] font-bold">Driver Name</span>
              <div className="font-bold text-white text-sm">{foundReservation.user?.name || 'Dev Driver'}</div>
              <div className="text-[11px] text-slate-400">{foundReservation.user?.phone || 'No phone'}</div>
            </div>

            <div className="p-3.5 rounded-xl bg-navy-850 border border-navy-800 space-y-1">
              <span className="text-slate-500 uppercase text-[10px] font-bold">Vehicle Plate</span>
              <div className="font-mono font-bold text-white text-sm">
                {foundReservation.vehicleSnapshot?.registrationNumber || 'KA-01-DEMO'}
              </div>
              <div className="text-[11px] text-slate-400 capitalize">
                {foundReservation.vehicleSnapshot?.vehicleType || 'Car'}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-navy-850 border border-navy-800 space-y-1">
              <span className="text-slate-500 uppercase text-[10px] font-bold">Allocated Slot</span>
              <div className="font-mono font-black text-emerald-400 text-lg">
                {foundReservation.slot?.slotNumber || 'A01'}
              </div>
              <div className="text-[11px] text-slate-400">
                {foundReservation.slot?.section ? `Section ${foundReservation.slot.section}` : 'General Bay'}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-navy-850 border border-navy-800 space-y-1">
              <span className="text-slate-500 uppercase text-[10px] font-bold">Scheduled Arrival</span>
              <div className="font-mono text-white text-xs">
                {new Date(foundReservation.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="text-[10px] text-slate-400">
                For {foundReservation.durationHours} hours
              </div>
            </div>
          </div>

          {/* Gate Verification Actions */}
          <div className="p-5 rounded-2xl bg-navy-950 border border-navy-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-white text-sm">Barrier Gate Actions</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                {foundReservation.status === 'confirmed'
                  ? 'Confirm vehicle arrival to mark parking space occupied.'
                  : foundReservation.status === 'checked_in'
                  ? 'Confirm vehicle exit to release parking space.'
                  : `This reservation is already ${foundReservation.status}.`}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {foundReservation.status === 'confirmed' && (
                <button
                  onClick={handleCheckIn}
                  disabled={actionLoading}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{actionLoading ? 'Processing...' : 'Open Barrier & Check In'}</span>
                </button>
              )}

              {foundReservation.status === 'checked_in' && (
                <button
                  onClick={handleCheckOut}
                  disabled={actionLoading}
                  className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{actionLoading ? 'Processing...' : 'Confirm Departure & Free Slot'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Checkout Receipt Summary */}
      {checkoutResult && (
        <div className="p-6 rounded-3xl bg-emerald-950/20 border border-emerald-500/40 text-xs space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-bold">
            <CheckCircle2 className="w-5 h-5" />
            <span>Vehicle Exit Successfully Processed</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono pt-2">
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-sans block">Final Duration</span>
              <span className="text-white font-bold text-sm">{checkoutResult.durationHours} hours</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-sans block">Total Demo Charge</span>
              <span className="text-emerald-400 font-bold text-sm">
                ₹{checkoutResult.pricing?.finalTotal || checkoutResult.pricing?.estimatedTotal || 0}
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-sans block">Slot Status</span>
              <span className="text-emerald-400 font-bold text-sm">FREED (Available)</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-sans block">Completed At</span>
              <span className="text-white text-xs">{new Date(checkoutResult.actualCheckOutTime).toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
