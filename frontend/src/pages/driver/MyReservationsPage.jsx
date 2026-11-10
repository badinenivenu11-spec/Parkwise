import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { reservationApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  Calendar,
  Clock,
  Car,
  MapPin,
  CheckCircle2,
  AlertCircle,
  XCircle,
  QrCode,
  Sparkles,
  ChevronRight,
  Filter,
  Plus
} from 'lucide-react';

export default function MyReservationsPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Cancel Modal
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedToCancel, setSelectedToCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState('Change of plans');
  const [cancelling, setCancelling] = useState(false);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'ALL') params.status = statusFilter;

      const res = await reservationApi.getMy(params);
      if (res.data.success) {
        setReservations(res.data.reservations || []);
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to load reservations', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [statusFilter]);

  const handleCancelReservation = async () => {
    if (!selectedToCancel) return;
    try {
      setCancelling(true);
      const res = await reservationApi.cancel(selectedToCancel._id, cancelReason);
      if (res.data.success) {
        addToast('Reservation cancelled and spot freed', 'success');
        setCancelModalOpen(false);
        fetchReservations();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Cancellation failed', 'error');
    } finally {
      setCancelling(false);
    }
  };

  const handleCheckIn = async (resId) => {
    try {
      const res = await reservationApi.checkIn(resId);
      if (res.data.success) {
        addToast('Checked in successfully! Slot is now marked occupied.', 'success');
        navigate('/driver/active-session');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Check-in failed', 'error');
    }
  };

  const statusBadges = {
    confirmed: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    checked_in: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    completed: 'bg-slate-800 text-slate-300 border-slate-700',
    cancelled: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-navy-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            My Parking Reservations
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track confirmed, active, and past parking sessions
          </p>
        </div>

        <Link
          to="/find"
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Reservation</span>
        </Link>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {['ALL', 'confirmed', 'checked_in', 'completed', 'cancelled'].map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition ${
              statusFilter === tab
                ? 'bg-emerald-600 border-emerald-500 text-white shadow-md'
                : 'bg-navy-900 border-navy-800 text-slate-400 hover:text-white'
            }`}
          >
            {tab === 'ALL'
              ? 'All Reservations'
              : tab === 'checked_in'
              ? 'Active / Checked In'
              : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Reservation List */}
      {loading ? (
        <div className="py-24 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 text-xs">Loading reservations...</p>
        </div>
      ) : reservations.length === 0 ? (
        <div className="bg-navy-900 border border-navy-800 rounded-3xl p-16 text-center max-w-md mx-auto space-y-3">
          <Calendar className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Reservations Found</h3>
          <p className="text-xs text-slate-400">
            {statusFilter === 'ALL'
              ? "You haven't booked any parking sessions yet."
              : `No reservations with status "${statusFilter}".`}
          </p>
          <Link
            to="/find"
            className="inline-block px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs"
          >
            Find a Parking Spot
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {reservations.map((r) => {
            const startDate = new Date(r.startTime);
            const endDate = new Date(r.expectedEndTime);

            return (
              <div
                key={r._id}
                className="bg-navy-900 border border-navy-800 hover:border-navy-700/80 rounded-2xl p-6 shadow-xl transition-all duration-200 flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                {/* Details Left */}
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-emerald-400 bg-navy-850 px-2 py-0.5 rounded border border-navy-700">
                      {r.reservationRef}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border font-mono ${statusBadges[r.status] || ''}`}>
                      {r.status.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-slate-500">
                      Booked {new Date(r.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white">
                      {r.facility?.name}
                    </h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{r.facility?.address?.street ? `${r.facility.address.street}, ` : ''}{r.facility?.address?.city}</span>
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono pt-1">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block font-sans">Space</span>
                      <span className="font-bold text-white text-sm">
                        {r.slot?.slotNumber || 'Auto-Allocated'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block font-sans">Vehicle</span>
                      <span className="font-bold text-white text-sm">
                        {r.vehicleSnapshot?.registrationNumber || 'KA-01-DEMO'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block font-sans">Duration</span>
                      <span className="font-bold text-white text-sm">{r.durationHours} Hours</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block font-sans">Total Fee</span>
                      <span className="font-bold text-emerald-400 text-sm">
                        ₹{r.pricing?.finalTotal || r.pricing?.estimatedTotal || 0}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions Right */}
                <div className="flex flex-wrap lg:flex-col items-end justify-end gap-2 shrink-0 border-t lg:border-t-0 lg:border-l border-navy-800 pt-4 lg:pt-0 lg:pl-6">
                  <Link
                    to={`/confirmation/${r._id}`}
                    className="px-3.5 py-1.5 rounded-xl bg-navy-850 hover:bg-navy-800 border border-navy-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                    <span>View Pass Code</span>
                  </Link>

                  {r.status === 'confirmed' && (
                    <>
                      <button
                        onClick={() => handleCheckIn(r._id)}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Check In</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedToCancel(r);
                          setCancelModalOpen(true);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold transition"
                      >
                        Cancel Booking
                      </button>
                    </>
                  )}

                  {r.status === 'checked_in' && (
                    <Link
                      to="/driver/active-session"
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs transition flex items-center gap-1.5"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Live Session</span>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancel Modal */}
      {cancelModalOpen && selectedToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-navy-900 border border-navy-700 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <XCircle className="w-6 h-6" />
              <h3 className="text-base font-bold text-white">Cancel Parking Reservation</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to cancel reservation <strong>{selectedToCancel.reservationRef}</strong> at <strong>{selectedToCancel.facility?.name}</strong>?
              The reserved spot will be released immediately.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                Reason for Cancellation
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-navy-850 border border-navy-700 text-white text-xs"
              >
                <option value="Change of plans">Change of plans</option>
                <option value="Found alternative parking">Found alternative parking</option>
                <option value="Vehicle issue">Vehicle issue</option>
                <option value="Trip cancelled">Trip cancelled</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCancelModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-navy-800 text-slate-300 text-xs font-semibold"
              >
                Keep Booking
              </button>
              <button
                type="button"
                onClick={handleCancelReservation}
                disabled={cancelling}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition"
              >
                {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
