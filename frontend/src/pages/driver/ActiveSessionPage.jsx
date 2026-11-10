import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { reservationApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  Clock,
  Car,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Plus,
  LogOut,
  Sparkles,
  Receipt,
  Download,
  ShieldCheck,
  ChevronRight,
  TrendingUp
} from 'lucide-react';

export default function ActiveSessionPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [activeReservation, setActiveReservation] = useState(null);
  const [confirmedReservation, setConfirmedReservation] = useState(null);
  const [loading, setLoading] = useState(true);

  // Live Timer states (derived from stored timestamps)
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Extend Modal
  const [extendModalOpen, setExtendModalOpen] = useState(false);
  const [additionalHours, setAdditionalHours] = useState(1);
  const [extending, setExtending] = useState(false);

  // Checkout Receipt Modal
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [finalReceipt, setFinalReceipt] = useState(null);
  const [checkingOut, setCheckingOut] = useState(false);

  const fetchSession = async () => {
    try {
      setLoading(true);
      // Fetch checked_in reservations
      const [checkedInRes, confirmedRes] = await Promise.all([
        reservationApi.getMy({ status: 'checked_in', limit: 1 }),
        reservationApi.getMy({ status: 'confirmed', limit: 1 }),
      ]);

      if (checkedInRes.data.reservations?.length > 0) {
        setActiveReservation(checkedInRes.data.reservations[0]);
      } else {
        setActiveReservation(null);
        if (confirmedRes.data.reservations?.length > 0) {
          setConfirmedReservation(confirmedRes.data.reservations[0]);
        } else {
          setConfirmedReservation(null);
        }
      }
    } catch (err) {
      console.error('Error fetching session:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  // Real-time elapsed duration derived from stored actualCheckInTime or startTime
  useEffect(() => {
    if (!activeReservation) return;

    const checkInTime = new Date(activeReservation.actualCheckInTime || activeReservation.startTime).getTime();

    const updateTimer = () => {
      const now = Date.now();
      const diffSec = Math.max(0, Math.floor((now - checkInTime) / 1000));
      setElapsedSeconds(diffSec);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [activeReservation]);

  const handleSimulatedCheckIn = async (resId) => {
    try {
      setLoading(true);
      const res = await reservationApi.checkIn(resId);
      if (res.data.success) {
        addToast('Vehicle successfully checked in! Live session activated.', 'success');
        await fetchSession();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Check-in failed', 'error');
      setLoading(false);
    }
  };

  const handleUnreserveConfirmed = async (resId) => {
    if (!window.confirm('Are you sure you want to unreserve this spot and cancel the booking? The spot will be freed immediately.')) return;
    try {
      setLoading(true);
      const res = await reservationApi.cancel(resId, 'User unreserved from active session page');
      if (res.data.success) {
        addToast('Spot unreserved and freed successfully!', 'success');
        await fetchSession();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Unreserve failed', 'error');
      setLoading(false);
    }
  };

  const handleExtend = async () => {
    if (!activeReservation) return;
    try {
      setExtending(true);
      const res = await reservationApi.extend(activeReservation._id, additionalHours);
      if (res.data.success) {
        addToast(`Parking session successfully extended by ${additionalHours} hour(s)!`, 'success');
        setExtendModalOpen(false);
        setActiveReservation(res.data.reservation);
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Extension failed', 'error');
    } finally {
      setExtending(false);
    }
  };

  const handleCheckout = async () => {
    if (!activeReservation) return;
    if (!window.confirm('Confirm vehicle checkout and simulated exit from parking facility?')) return;

    try {
      setCheckingOut(true);
      const res = await reservationApi.checkOut(activeReservation._id);
      if (res.data.success) {
        setFinalReceipt(res.data.reservation);
        setReceiptModalOpen(true);
        setActiveReservation(null);
        addToast('Parking session completed! Spot freed.', 'success');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Checkout failed', 'error');
    } finally {
      setCheckingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="py-32 text-center space-y-3">
        <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-slate-400 text-xs">Connecting to active parking gate telemetry...</p>
      </div>
    );
  }

  // Format Elapsed Time (HH:MM:SS)
  const hours = Math.floor(elapsedSeconds / 3600);
  const minutes = Math.floor((elapsedSeconds % 3600) / 60);
  const seconds = elapsedSeconds % 60;
  const pad = (n) => String(n).padStart(2, '0');

  // Real-time live cost based on elapsed duration
  const baseRate = activeReservation?.pricing?.baseRate || 60;
  const elapsedHoursDecimal = Math.max(1, elapsedSeconds / 3600);
  const currentRunningCost = Math.round(baseRate * elapsedHoursDecimal * 100) / 100;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-navy-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
              Telemetric Active Session
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Active Parking Session
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time timer calculated directly from stored server check-in timestamps.
          </p>
        </div>

        {activeReservation && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setExtendModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-navy-850 hover:bg-navy-800 border border-navy-700 text-xs font-semibold text-white flex items-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>Extend Parking</span>
            </button>

            <button
              onClick={handleCheckout}
              disabled={checkingOut}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 flex items-center gap-1.5 transition"
            >
              <LogOut className="w-4 h-4" />
              <span>{checkingOut ? 'Checking Out...' : 'Simulate Exit & Pay'}</span>
            </button>
          </div>
        )}
      </div>

      {!activeReservation ? (
        /* No checked-in session */
        <div className="bg-navy-900 border border-navy-800 rounded-3xl p-10 text-center space-y-6 max-w-xl mx-auto shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-navy-850 text-slate-500 flex items-center justify-center mx-auto border border-navy-800">
            <Clock className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">No Active Parking Session</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              You are currently not checked in at any parking facility.
            </p>
          </div>

          {confirmedReservation ? (
            <div className="p-5 rounded-2xl bg-navy-850 border border-emerald-500/30 text-left space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                  Upcoming Confirmed Booking Found
                </span>
                <span className="text-xs font-mono font-bold text-white">
                  {confirmedReservation.reservationRef}
                </span>
              </div>
              <div>
                <div className="font-bold text-white text-sm">
                  {confirmedReservation.facility?.name}
                </div>
                <div className="text-xs text-slate-400">
                  Spot {confirmedReservation.slot?.slotNumber || 'A01'} • {confirmedReservation.vehicleSnapshot?.registrationNumber}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <button
                  onClick={() => handleSimulatedCheckIn(confirmedReservation._id)}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Simulate Vehicle Check-In</span>
                </button>
                <button
                  onClick={() => handleUnreserveConfirmed(confirmedReservation._id)}
                  className="px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-semibold text-xs transition"
                >
                  Unreserve / Cancel
                </button>
              </div>
            </div>
          ) : (
            <Link
              to="/find"
              className="inline-block px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition"
            >
              Find & Reserve a Spot
            </Link>
          )}
        </div>
      ) : (
        /* Active Session Display */
        <div className="space-y-6">
          {/* Huge Live Timer Card */}
          <div className="bg-gradient-to-br from-navy-900 via-navy-850 to-navy-900 border-2 border-emerald-500/50 rounded-3xl p-8 shadow-2xl text-center space-y-6 relative overflow-hidden">
            <div className="space-y-1">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest font-mono">
                Elapsed Parking Duration
              </span>
              <div className="text-5xl sm:text-7xl font-black text-white font-mono tracking-wider drop-shadow-md">
                {pad(hours)}:{pad(minutes)}:{pad(seconds)}
              </div>
              <p className="text-[11px] text-slate-400">
                Check-in registered at:{' '}
                <strong className="text-slate-200">
                  {new Date(activeReservation.actualCheckInTime || activeReservation.startTime).toLocaleTimeString()}
                </strong>
              </p>
            </div>

            {/* Running Cost Meter */}
            <div className="inline-flex items-center gap-4 px-6 py-3 rounded-2xl bg-navy-950 border border-emerald-500/30">
              <div className="text-left">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Current Accrued Fee</div>
                <div className="text-2xl font-black text-emerald-400 font-mono">
                  ₹{currentRunningCost.toFixed(2)}
                </div>
              </div>
              <div className="h-8 w-px bg-navy-800" />
              <div className="text-left text-xs font-mono text-slate-400">
                <div>Base: ₹{baseRate}/hr</div>
                <div>Status: <span className="text-emerald-400 font-bold uppercase">Active</span></div>
              </div>
            </div>
          </div>

          {/* Session Overview Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-navy-900 border border-navy-800 space-y-1">
              <div className="text-[10px] text-slate-400 uppercase font-bold">Facility</div>
              <div className="font-bold text-white text-sm truncate">{activeReservation.facility?.name}</div>
              <div className="text-xs text-slate-400 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                <span className="truncate">{activeReservation.facility?.address?.city}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-navy-900 border border-navy-800 space-y-1">
              <div className="text-[10px] text-slate-400 uppercase font-bold">Assigned Space</div>
              <div className="text-xl font-black text-emerald-400 font-mono">
                {activeReservation.slot?.slotNumber || 'A01'}
              </div>
              <div className="text-xs text-slate-400">
                {activeReservation.slot?.section ? `Section ${activeReservation.slot.section}` : 'Standard Space'}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-navy-900 border border-navy-800 space-y-1">
              <div className="text-[10px] text-slate-400 uppercase font-bold">Vehicle Plate</div>
              <div className="text-base font-bold text-white font-mono">
                {activeReservation.vehicleSnapshot?.registrationNumber}
              </div>
              <div className="text-xs text-slate-400 capitalize">
                {activeReservation.vehicleSnapshot?.make} {activeReservation.vehicleSnapshot?.model}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-navy-900 border border-navy-800 space-y-1">
              <div className="text-[10px] text-slate-400 uppercase font-bold">Expected Departure</div>
              <div className="text-sm font-bold text-white font-mono">
                {new Date(activeReservation.expectedEndTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="text-xs text-slate-400">
                Scheduled for {activeReservation.durationHours}h
              </div>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="p-6 rounded-3xl bg-navy-900 border border-navy-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-white text-sm">Need more parking time?</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Extend your reservation before expiration to prevent overstay charges.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setExtendModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-navy-850 hover:bg-navy-800 border border-navy-700 text-white text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>Extend Duration</span>
              </button>

              <button
                onClick={handleCheckout}
                disabled={checkingOut}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5"
              >
                <LogOut className="w-4 h-4" />
                <span>Checkout Now</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Extend Parking Modal */}
      {extendModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-navy-900 border border-navy-700 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5">
            <div>
              <h3 className="text-base font-bold text-white">Extend Parking Session</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                The backend checks real-time slot availability for subsequent reservations.
              </p>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-300 uppercase">
                Additional Hours
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setAdditionalHours(h)}
                    className={`py-2 rounded-xl border text-xs font-bold transition ${
                      additionalHours === h
                        ? 'bg-emerald-600 border-emerald-500 text-white'
                        : 'bg-navy-850 border-navy-700 text-slate-300'
                    }`}
                  >
                    +{h} Hour{h > 1 ? 's' : ''}
                  </button>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-navy-950 border border-navy-800 text-xs space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Additional Fee:</span>
                  <span className="font-mono text-white font-bold">₹{baseRate * additionalHours}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>New End Time:</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    {new Date(
                      new Date(activeReservation?.expectedEndTime).getTime() + additionalHours * 3600000
                    ).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setExtendModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-navy-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExtend}
                disabled={extending}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition"
              >
                {extending ? 'Validating...' : 'Confirm Extension'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Receipt Modal */}
      {receiptModalOpen && finalReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-navy-900 border border-emerald-500/50 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                <Receipt className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-white">Parking Receipt</h3>
              <p className="text-xs text-slate-400 font-mono">
                REF: {finalReceipt.reservationRef}
              </p>
            </div>

            <div className="space-y-2.5 text-xs border-y border-navy-800 py-4">
              <div className="flex justify-between text-slate-400">
                <span>Facility:</span>
                <span className="text-white font-semibold">{finalReceipt.facility?.name}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Vehicle:</span>
                <span className="text-white font-mono">{finalReceipt.vehicleSnapshot?.registrationNumber}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Allocated Slot:</span>
                <span className="text-emerald-400 font-mono font-bold">{finalReceipt.slot?.slotNumber || 'A01'}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Actual Duration:</span>
                <span className="text-white font-mono">{finalReceipt.durationHours} hours</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Check-Out Timestamp:</span>
                <span className="text-white font-mono">{new Date(finalReceipt.actualCheckOutTime).toLocaleTimeString()}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-bold">Total Demo Charge</div>
                <div className="text-xs text-slate-500">No real funds deducted</div>
              </div>
              <div className="text-3xl font-black text-emerald-400 font-mono">
                ₹{finalReceipt.pricing?.finalTotal?.toFixed(2) || '120.00'}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  setReceiptModalOpen(false);
                  navigate('/driver/reservations');
                }}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition"
              >
                Go to Reservation History
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
