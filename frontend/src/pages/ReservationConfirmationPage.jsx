import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { reservationApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import {
  CheckCircle2,
  Calendar,
  Clock,
  Car,
  MapPin,
  QrCode,
  ShieldAlert,
  ArrowRight,
  Download,
  Share2,
  ParkingSquare,
  XCircle,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';

export default function ReservationConfirmationPage() {
  const { id } = useParams();
  const { addToast } = useToast();
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);

  // Unreserve / Cancel State
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('Change of plans');
  const [cancelling, setCancelling] = useState(false);

  const fetchRes = async () => {
    try {
      setLoading(true);
      const res = await reservationApi.getById(id);
      if (res.data.success) {
        setReservation(res.data.reservation);
      }
    } catch (err) {
      console.error('Failed to load reservation confirmation', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRes();
  }, [id]);

  const handleCancelBooking = async () => {
    try {
      setCancelling(true);
      const res = await reservationApi.cancel(reservation._id, cancelReason);
      if (res.data.success) {
        addToast(`Slot ${reservation.slot?.slotNumber || ''} unreserved! Spot is now available.`, 'success');
        setReservation(res.data.reservation);
        setCancelModalOpen(false);
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Cancellation failed', 'error');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="py-32 text-center space-y-3">
        <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-slate-400 text-xs">Generating your digital demo parking pass...</p>
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="max-w-md mx-auto py-32 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Reservation Not Found</h2>
        <Link to="/find" className="inline-block px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold">
          Find Another Facility
        </Link>
      </div>
    );
  }

  const startDate = new Date(reservation.startTime);
  const endDate = new Date(reservation.expectedEndTime);
  const isCancelled = reservation.status === 'cancelled';

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      {/* Success or Cancelled Badge */}
      <div className="text-center space-y-2">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-xl ${
          isCancelled
            ? 'bg-rose-500/10 border border-rose-500/30 text-rose-400 shadow-rose-500/20'
            : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-emerald-500/20'
        }`}>
          {isCancelled ? <XCircle className="w-8 h-8" /> : <CheckCircle2 className="w-8 h-8" />}
        </div>
        <h1 className="text-3xl font-black text-white">
          {isCancelled ? 'Reservation Unreserved / Cancelled' : 'Parking Space Confirmed!'}
        </h1>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          {isCancelled
            ? `Your booking was cancelled (${reservation.cancellationReason || 'User request'}). The assigned slot has been immediately released back to available.`
            : 'Your reservation reference is active in the database. Present this digital pass at the barrier kiosk.'}
        </p>
      </div>

      {/* Digital Demo Parking Pass Card */}
      <div className={`bg-navy-900 border-2 rounded-3xl overflow-hidden shadow-2xl relative ${
        isCancelled ? 'border-rose-500/40 opacity-80' : 'border-emerald-500/40'
      }`}>
        {/* Pass Top Banner */}
        <div className={`p-6 text-white flex items-center justify-between ${
          isCancelled
            ? 'bg-gradient-to-r from-rose-700 via-rose-600 to-rose-700'
            : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-lg">
              {isCancelled ? '✕' : 'P'}
            </div>
            <div>
              <div className="text-[10px] tracking-wider uppercase font-semibold opacity-90">
                {isCancelled ? 'Cancelled Pass Record' : 'Official Digital Demo Pass'}
              </div>
              <div className="text-lg font-black tracking-tight">
                {reservation.facility?.name}
              </div>
            </div>
          </div>

          <div className="text-right font-mono">
            <div className="text-[10px] uppercase opacity-80">Reference</div>
            <div className="text-base font-black tracking-wider bg-black/30 px-3 py-1 rounded-lg">
              {reservation.reservationRef}
            </div>
          </div>
        </div>

        {/* Pass Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Status Alert if cancelled */}
          {isCancelled && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
              <span className="font-semibold">Status: UNRESERVED & FREED</span>
              <span className="font-mono text-[10px]">Cancelled on {new Date(reservation.cancelledAt || Date.now()).toLocaleTimeString()}</span>
            </div>
          )}

          {/* Key Information Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-6 border-b border-navy-800">
            <div>
              <span className="text-[10px] uppercase text-slate-500 font-bold block">Assigned Space</span>
              <span className="text-xl font-black text-white font-mono">
                {reservation.slot?.slotNumber || 'A01'}
              </span>
              <span className="text-[10px] text-slate-400 block">
                {reservation.slot?.section ? `Sec ${reservation.slot.section} • Fl ${reservation.slot.floor || 1}` : 'Level 1'}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase text-slate-500 font-bold block">Vehicle</span>
              <span className="text-sm font-bold text-white font-mono block">
                {reservation.vehicleSnapshot?.registrationNumber || 'KA-01-DEMO'}
              </span>
              <span className="text-[10px] text-slate-400 block capitalize">
                {reservation.vehicleSnapshot?.make || 'Car'} {reservation.vehicleSnapshot?.model || ''}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase text-slate-500 font-bold block">Arrival Window</span>
              <span className="text-xs font-bold text-white block">
                {startDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </span>
              <span className="text-[10px] text-slate-400 font-mono block">
                {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase text-slate-500 font-bold block">Duration</span>
              <span className="text-xs font-bold text-white block">
                {reservation.durationHours} Hours
              </span>
              <span className="text-[10px] text-slate-400 font-mono block">
                Till {endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>

          {/* Location & Instructions */}
          <div className="space-y-3 pb-6 border-b border-navy-800 text-xs">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-white block">Facility Address:</span>
                <span className="text-slate-400">
                  {reservation.facility?.address?.street}, {reservation.facility?.address?.city}, {reservation.facility?.address?.state} {reservation.facility?.address?.zipCode}
                </span>
              </div>
            </div>

            {reservation.facility?.entryInstructions && (
              <div className="p-3 rounded-xl bg-navy-850 border border-navy-800 text-slate-300">
                <span className="text-slate-400 uppercase text-[10px] font-bold block mb-0.5">Barrier Entry Instructions:</span>
                {reservation.facility.entryInstructions}
              </div>
            )}
          </div>

          {/* QR Pass Code Simulation */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-navy-850 border border-navy-800">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-white rounded-xl p-2 flex items-center justify-center shrink-0 shadow-lg">
                <div className="w-full h-full border-2 border-slate-900 border-dashed rounded flex flex-col justify-between p-1">
                  <div className="flex justify-between">
                    <div className="w-3 h-3 bg-slate-950" />
                    <div className="w-3 h-3 bg-slate-950" />
                  </div>
                  <div className="text-[8px] font-black text-center text-slate-950 font-mono">
                    {reservation.reservationRef.slice(0, 7)}
                  </div>
                  <div className="flex justify-between">
                    <div className="w-3 h-3 bg-slate-950" />
                    <div className="w-1.5 h-1.5 bg-slate-950 ml-auto" />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm">Automated Gate QR Pass</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Hold this code up to the barrier reader upon arrival at Gate 1.
                </p>
                <div className="text-[11px] font-mono text-emerald-400 mt-1 font-bold">
                  PASS CODE: {reservation.reservationRef}
                </div>
              </div>
            </div>

            {/* Price Total */}
            <div className="text-right shrink-0 border-t sm:border-t-0 sm:border-l border-navy-800 pt-3 sm:pt-0 sm:pl-6">
              <div className="text-[10px] text-slate-500 uppercase font-bold">Total Estimated Rate</div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
                ₹{reservation.pricing?.estimatedTotal?.toFixed(2) || '120.00'}
              </div>
              <div className="text-[10px] text-slate-500">Demo Simulation</div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-navy-800">
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="px-3.5 py-2 rounded-xl bg-navy-850 hover:bg-navy-800 text-slate-300 hover:text-white border border-navy-700 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Download className="w-4 h-4" />
                <span>Print Pass</span>
              </button>

              {/* UNRESERVE / CANCEL BUTTON */}
              {!isCancelled && reservation.status === 'confirmed' && (
                <button
                  onClick={() => setCancelModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Unreserve / Cancel Spot</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/driver/reservations"
                className="px-4 py-2 rounded-xl bg-navy-850 hover:bg-navy-800 text-slate-300 hover:text-white border border-navy-700 text-xs font-semibold transition"
              >
                My Reservations
              </Link>

              {isCancelled ? (
                <Link
                  to="/find"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition flex items-center gap-1.5"
                >
                  <span>Book Another Spot</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <Link
                  to="/driver/active-session"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition flex items-center gap-1.5"
                >
                  <span>Go to Active Session</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-navy-900 border border-navy-700 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <XCircle className="w-6 h-6" />
              <h3 className="text-base font-bold text-white">Unreserve Parking Slot</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Do you want to unreserve spot <strong>{reservation.slot?.slotNumber}</strong> at <strong>{reservation.facility?.name}</strong>?
              This reservation will be marked as cancelled and the slot will immediately become available for others to book.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                Reason
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
                Keep Reservation
              </button>
              <button
                type="button"
                onClick={handleCancelBooking}
                disabled={cancelling}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition flex items-center gap-1.5"
              >
                {cancelling ? 'Releasing Spot...' : 'Confirm Unreserve'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
