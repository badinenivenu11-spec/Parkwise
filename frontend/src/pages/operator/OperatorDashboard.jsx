import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { analyticsApi, reservationApi, facilityApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  Building2,
  QrCode,
  Search,
  CheckCircle2,
  Clock,
  Car,
  Layers,
  ChevronRight,
  TrendingUp,
  ArrowRight,
  LogOut,
  Sparkles
} from 'lucide-react';

export default function OperatorDashboard() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [facilities, setFacilities] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lookupQuery, setLookupQuery] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsRes, facRes, resRes] = await Promise.allSettled([
        analyticsApi.getOperatorStats(),
        facilityApi.getMyFacilities(),
        reservationApi.getAll({ limit: 10 })
      ]);

      if (statsRes.status === 'fulfilled' && statsRes.value.data.success) {
        setStats(statsRes.value.data.stats);
      }

      if (facRes.status === 'fulfilled' && facRes.value.data.success) {
        setFacilities(facRes.value.data.facilities || []);
      }

      if (resRes.status === 'fulfilled' && resRes.value.data.success) {
        setReservations(resRes.value.data.reservations || []);
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to load operator metrics', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleGateLookup = (e) => {
    e.preventDefault();
    if (!lookupQuery.trim()) return;
    navigate(`/operator/gate?q=${encodeURIComponent(lookupQuery.trim())}`);
  };

  const handleDirectCheckIn = async (id) => {
    try {
      const res = await reservationApi.checkIn(id);
      if (res.data.success) {
        addToast('Vehicle verified! Gate barrier opened & slot marked occupied.', 'success');
        loadData();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Check-in failed', 'error');
    }
  };

  const handleDirectCheckOut = async (id) => {
    try {
      const res = await reservationApi.checkOut(id);
      if (res.data.success) {
        addToast('Vehicle checked out! Gate barrier opened & slot freed.', 'success');
        loadData();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Checkout failed', 'error');
    }
  };

  if (loading) {
    return (
      <div className="py-32 text-center space-y-3">
        <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-slate-400 text-xs">Connecting to facility telemetry & gate feed...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Sleek Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-navy-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-bold border border-blue-500/20">
              Operator Station
            </span>
            <span className="text-xs text-slate-400">• Barrier Control & Bay Status</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Parking Operations Center
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Minimal, fast interface for gate barrier processing and live space oversight.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/operator/gate"
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition flex items-center gap-1.5"
          >
            <QrCode className="w-4 h-4" />
            <span>Gate Kiosk Terminal</span>
          </Link>
          <Link
            to="/operator/slots"
            className="px-4 py-2 rounded-xl bg-navy-850 hover:bg-navy-800 border border-navy-700 text-slate-200 font-bold text-xs transition flex items-center gap-1.5"
          >
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>Manage Slots</span>
          </Link>
        </div>
      </div>

      {/* Instant Gate Barrier Search & Verify Banner */}
      <div className="bg-gradient-to-r from-navy-900 via-navy-850 to-navy-900 border border-blue-500/30 rounded-3xl p-5 shadow-2xl">
        <form onSubmit={handleGateLookup} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-blue-400" />
            <input
              type="text"
              placeholder="Scan QR pass code or enter vehicle license plate (e.g. KA-01-AB-1234)..."
              value={lookupQuery}
              onChange={(e) => setLookupQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-navy-950/80 border border-navy-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-400 font-mono"
            />
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition flex items-center justify-center gap-2 shrink-0 shadow-lg shadow-blue-600/30"
          >
            <QrCode className="w-4 h-4" />
            <span>Verify Barrier Pass</span>
          </button>
        </form>
      </div>

      {/* 4 Focused Core KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Capacity', value: stats?.totalSlots || 0, color: 'text-white', icon: Layers },
          { label: 'Available Now', value: stats?.availableSlots || 0, color: 'text-emerald-400', icon: CheckCircle2 },
          { label: 'Currently Occupied', value: stats?.occupiedSlots || 0, color: 'text-rose-400', icon: Car },
          { label: 'Pending Reservations', value: stats?.reservedSlots || 0, color: 'text-amber-400', icon: Clock },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="p-5 rounded-2xl bg-navy-900 border border-navy-800 space-y-1 shadow-lg">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>{item.label}</span>
                <Icon className={`w-4 h-4 ${item.color}`} />
              </div>
              <div className={`text-2xl sm:text-3xl font-black font-mono ${item.color}`}>
                {item.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Facility Live Status Overview */}
      <div className="bg-navy-900 border border-navy-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-navy-800">
          <div>
            <h3 className="text-base font-bold text-white">Facility Bay Occupancy</h3>
            <p className="text-xs text-slate-400">Live space telemetry across your parking complexes</p>
          </div>
          <Link
            to="/operator/slots"
            className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
          >
            <span>Floor Bay Control</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {facilities.map((fac) => {
            const availRatio = Math.round((fac.availableSlots / (fac.totalSlots || 1)) * 100);
            return (
              <div key={fac._id} className="p-4 rounded-2xl bg-navy-850 border border-navy-800 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-white text-sm line-clamp-1">{fac.name}</h4>
                    <p className="text-xs text-slate-400">{fac.address?.city}</p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded font-mono uppercase font-bold bg-navy-900 border border-navy-700 text-slate-300">
                    {fac.facilityType}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400 font-sans">Available Spaces:</span>
                    <span className="text-emerald-400 font-bold">{fac.availableSlots} of {fac.totalSlots}</span>
                  </div>
                  <div className="w-full h-2 bg-navy-950 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full transition-all duration-300"
                      style={{ width: `${Math.min(100, Math.max(5, availRatio))}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-navy-800 text-xs">
                  <Link
                    to={`/operator/slots?facilityId=${fac._id}`}
                    className="text-emerald-400 hover:text-emerald-300 font-semibold"
                  >
                    Edit Slots ({fac.totalSlots})
                  </Link>
                  <Link
                    to={`/operator/gate?q=${encodeURIComponent(fac.name)}`}
                    className="text-blue-400 hover:text-blue-300 font-semibold"
                  >
                    Gate Barrier
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Barrier Arrivals / Departures Stream */}
      <div className="bg-navy-900 border border-navy-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-navy-800">
          <div>
            <h3 className="text-base font-bold text-white">Live Gate Barrier Processing Stream</h3>
            <p className="text-xs text-slate-400">1-click check-in on vehicle arrival and check-out on exit</p>
          </div>
          <Link
            to="/operator/gate"
            className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
          >
            <span>Full Kiosk Mode</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Pass Ref</th>
                <th className="py-2.5 px-3">Facility</th>
                <th className="py-2.5 px-3">Assigned Space</th>
                <th className="py-2.5 px-3">Vehicle Plate</th>
                <th className="py-2.5 px-3">Duration</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Barrier Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800/60 font-mono">
              {reservations.map((r) => (
                <tr key={r._id} className="hover:bg-navy-850/50 transition">
                  <td className="py-3 px-3 font-bold text-blue-400">{r.reservationRef}</td>
                  <td className="py-3 px-3 font-sans text-white truncate max-w-[140px]">{r.facility?.name}</td>
                  <td className="py-3 px-3 font-bold text-emerald-400">{r.slot?.slotNumber || 'AUTO'}</td>
                  <td className="py-3 px-3 text-white font-bold">{r.vehicleSnapshot?.registrationNumber}</td>
                  <td className="py-3 px-3 text-slate-400 font-sans">{r.durationHours}h</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                      r.status === 'confirmed'
                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                        : r.status === 'checked_in'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-sans">
                    {r.status === 'confirmed' && (
                      <button
                        onClick={() => handleDirectCheckIn(r._id)}
                        className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-md shadow-emerald-600/20"
                      >
                        Open Barrier (Check-In)
                      </button>
                    )}
                    {r.status === 'checked_in' && (
                      <button
                        onClick={() => handleDirectCheckOut(r._id)}
                        className="px-3 py-1 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition shadow-md shadow-rose-600/20"
                      >
                        Exit & Free Slot
                      </button>
                    )}
                    {['completed', 'cancelled'].includes(r.status) && (
                      <span className="text-slate-500 text-[11px] font-mono">Closed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
