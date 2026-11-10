import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { analyticsApi, reservationApi, userApi, facilityApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  Shield,
  Users,
  Building2,
  Layers,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  Percent,
  BarChart3,
  ChevronRight,
  Sparkles,
  ArrowRight,
  QrCode,
  Settings,
  XCircle,
  Plus,
  Trash2
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [stats, setStats] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, resRes, facRes, trendRes] = await Promise.allSettled([
        analyticsApi.getAdminStats(),
        reservationApi.getAll({ limit: 12 }),
        facilityApi.getAll({ limit: 8 }),
        analyticsApi.getReservationsOverTime(14)
      ]);

      if (statsRes.status === 'fulfilled' && statsRes.value.data.success) {
        setStats(statsRes.value.data.stats);
      }

      if (resRes.status === 'fulfilled' && resRes.value.data.success) {
        setReservations(resRes.value.data.reservations || []);
      }

      if (facRes.status === 'fulfilled' && facRes.value.data.success) {
        setFacilities(facRes.value.data.facilities || []);
      }

      if (trendRes.status === 'fulfilled' && trendRes.value.data.success) {
        setTrendData(trendRes.value.data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleAdminCancelReservation = async (reservationId, refNum) => {
    if (!window.confirm(`Admin Action: Cancel reservation ${refNum} and immediately free the assigned parking slot?`)) return;
    try {
      setCancellingId(reservationId);
      const res = await reservationApi.cancel(reservationId, 'Cancelled by Platform Administrator');
      if (res.data.success) {
        addToast(`Reservation ${refNum} cancelled and spot freed!`, 'success');
        setReservations(prev => prev.map(r => r._id === reservationId ? { ...r, status: 'cancelled' } : r));
        loadAdminData();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Admin cancellation failed', 'error');
    } finally {
      setCancellingId(null);
    }
  };

  const handleAdminDeleteReservation = async (reservationId, refNum) => {
    if (!window.confirm(`Permanently delete reservation ${refNum} from MongoDB audit log? This will also release any held parking slots.`)) return;
    try {
      const res = await reservationApi.delete(reservationId);
      if (res.data.success) {
        addToast(`Reservation ${refNum} permanently deleted`, 'info');
        setReservations(prev => prev.filter(r => r._id !== reservationId));
        loadAdminData();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Delete reservation failed', 'error');
    }
  };

  if (loading) {
    return (
      <div className="py-32 text-center space-y-3">
        <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-slate-400 text-xs">Querying platform-wide MongoDB collections...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-navy-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 font-bold border border-purple-500/20">
              Admin Platform Control
            </span>
            <span className="text-xs text-slate-400">• Full System God-Mode Access</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            System Administrator Overview
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Complete platform governance: Slots, facilities, barrier gates, telemetry, and user records
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/slots"
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition flex items-center gap-1.5"
          >
            <Layers className="w-4 h-4" />
            <span>Manage Slots</span>
          </Link>

          <Link
            to="/admin/analytics"
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition flex items-center gap-1.5"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Analytics</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Demo Users', value: stats?.totalUsers || 0, color: 'text-purple-400', icon: Users },
          { label: 'Parking Lots', value: stats?.totalFacilities || 0, color: 'text-blue-400', icon: Building2 },
          { label: 'Total Spaces', value: stats?.totalSlots || 0, color: 'text-white', icon: Layers },
          { label: 'Total Bookings', value: stats?.totalReservations || 0, color: 'text-cyan-400', icon: Calendar },
          { label: 'Occupancy Rate', value: `${stats?.occupancyRate || 0}%`, color: 'text-emerald-400', icon: Percent },
          { label: 'Est. Demo Value', value: `₹${stats?.estimatedDemoValue || 0}`, color: 'text-amber-400', icon: TrendingUp },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="p-4 rounded-2xl bg-navy-900 border border-navy-800 space-y-1.5 shadow-lg">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>{item.label}</span>
                <Icon className={`w-4 h-4 ${item.color}`} />
              </div>
              <div className={`text-xl sm:text-2xl font-black font-mono ${item.color}`}>
                {item.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Admin God-Mode Feature Access Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            Administrative Management Modules
          </h3>
          <span className="text-[10px] text-purple-400 font-mono">100% System Access</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/admin/slots"
            className="p-5 rounded-2xl bg-navy-900 hover:bg-navy-850 border border-navy-800 hover:border-emerald-500/50 shadow-xl transition group space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition">
                <Layers className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm group-hover:text-emerald-300 transition">
                Slot Management
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Add, edit, delete parking spaces, toggle status & bulk create bays
              </p>
            </div>
          </Link>

          <Link
            to="/admin/facilities"
            className="p-5 rounded-2xl bg-navy-900 hover:bg-navy-850 border border-navy-800 hover:border-blue-500/50 shadow-xl transition group space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-105 transition">
                <Building2 className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm group-hover:text-blue-300 transition">
                Facility Management
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Create & configure parking complexes, pricing tiers & amenities
              </p>
            </div>
          </Link>

          <Link
            to="/admin/gate"
            className="p-5 rounded-2xl bg-navy-900 hover:bg-navy-850 border border-navy-800 hover:border-amber-500/50 shadow-xl transition group space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition">
                <QrCode className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm group-hover:text-amber-300 transition">
                Barrier Gate Terminal
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Automated gate check-in, pass scanner & live vehicle barrier entry
              </p>
            </div>
          </Link>

          <Link
            to="/settings"
            className="p-5 rounded-2xl bg-navy-900 hover:bg-navy-850 border border-navy-800 hover:border-purple-500/50 shadow-xl transition group space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-105 transition">
                <Settings className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 transition" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm group-hover:text-purple-300 transition">
                System Settings & Reseed
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Platform parameters, rate configurations & database reset
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* Main Row: Activity Trend Chart & Quick Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Trend Area Chart (2 Cols) */}
        <div className="lg:col-span-2 bg-navy-900 border border-navy-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-2">
            <div>
              <h3 className="text-base font-bold text-white">Reservation Activity Trend</h3>
              <p className="text-xs text-slate-400">Daily reservation bookings volume from MongoDB</p>
            </div>
            <Link
              to="/admin/analytics"
              className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1"
            >
              <span>Full Analytics</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="h-64 w-full">
            {trendData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                Aggregating reservation timeseries...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#A855F7" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#A855F7" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  <XAxis dataKey="_id" stroke="#64748B" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0B132B', borderColor: '#1E293B', borderRadius: 8, fontSize: 11 }}
                  />
                  <Area type="monotone" dataKey="count" stroke="#A855F7" strokeWidth={2} fillOpacity={1} fill="url(#purpleGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* System Health / Status Breakdown (1 Col) */}
        <div className="bg-navy-900 border border-navy-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white pb-2 border-b border-navy-800">
            Slot Capacity Distribution
          </h3>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 rounded-xl bg-navy-850 flex items-center justify-between">
              <span className="text-slate-300 font-sans">Available Spaces:</span>
              <span className="text-emerald-400 font-bold">{stats?.slotBreakdown?.available || 0}</span>
            </div>
            <div className="p-3 rounded-xl bg-navy-850 flex items-center justify-between">
              <span className="text-slate-300 font-sans">Occupied Spaces:</span>
              <span className="text-rose-400 font-bold">{stats?.slotBreakdown?.occupied || 0}</span>
            </div>
            <div className="p-3 rounded-xl bg-navy-850 flex items-center justify-between">
              <span className="text-slate-300 font-sans">Reserved Spaces:</span>
              <span className="text-amber-400 font-bold">{stats?.slotBreakdown?.reserved || 0}</span>
            </div>
            <div className="p-3 rounded-xl bg-navy-850 flex items-center justify-between">
              <span className="text-slate-300 font-sans">Maintenance / OOS:</span>
              <span className="text-slate-400 font-bold">{stats?.slotBreakdown?.out_of_service || 0}</span>
            </div>
          </div>

          <div className="pt-2">
            <Link
              to="/admin/users"
              className="w-full py-2.5 rounded-xl bg-navy-850 hover:bg-navy-800 border border-navy-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
            >
              <Users className="w-3.5 h-3.5 text-purple-400" />
              <span>Manage User Roles & Access</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Global Reservations Table with Admin Actions */}
      <div className="bg-navy-900 border border-navy-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-navy-800">
          <div>
            <h3 className="text-base font-bold text-white">Platform-Wide Reservations Audit</h3>
            <p className="text-xs text-slate-400">Live MongoDB reservation records with administrative override</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">
              <tr>
                <th className="py-2.5 px-2">Reference</th>
                <th className="py-2.5 px-2">User</th>
                <th className="py-2.5 px-2">Facility</th>
                <th className="py-2.5 px-2">Space</th>
                <th className="py-2.5 px-2">Vehicle</th>
                <th className="py-2.5 px-2">Duration</th>
                <th className="py-2.5 px-2">Total Fee</th>
                <th className="py-2.5 px-2">Status</th>
                <th className="py-2.5 px-2 text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800/60 font-mono">
              {reservations.map((r) => (
                <tr key={r._id} className="hover:bg-navy-850/40 transition">
                  <td className="py-3 px-2 font-bold text-purple-400">
                    <Link to={`/confirmation/${r._id}`} className="hover:underline">
                      {r.reservationRef}
                    </Link>
                  </td>
                  <td className="py-3 px-2 font-sans text-slate-200">{r.user?.name || r.user?.email}</td>
                  <td className="py-3 px-2 font-sans text-white truncate max-w-[140px]">{r.facility?.name}</td>
                  <td className="py-3 px-2 font-bold text-emerald-400">{r.slot?.slotNumber || 'AUTO'}</td>
                  <td className="py-3 px-2 text-white font-bold">{r.vehicleSnapshot?.registrationNumber}</td>
                  <td className="py-3 px-2 text-slate-400">{r.durationHours}h</td>
                  <td className="py-3 px-2 text-white font-bold">
                    ₹{r.pricing?.finalTotal || r.pricing?.estimatedTotal || 0}
                  </td>
                  <td className="py-3 px-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                      r.status === 'confirmed'
                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                        : r.status === 'checked_in'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : r.status === 'completed'
                        ? 'bg-slate-800 text-slate-300 border-slate-700'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-right">
                    <div className="flex items-center justify-end gap-1.5 font-sans">
                      <Link
                        to={`/confirmation/${r._id}`}
                        className="px-2 py-1 rounded bg-navy-850 hover:bg-navy-800 border border-navy-700 text-slate-300 text-[11px]"
                      >
                        Pass
                      </Link>
                      {['confirmed', 'checked_in'].includes(r.status) && (
                        <button
                          onClick={() => handleAdminCancelReservation(r._id, r.reservationRef)}
                          disabled={cancellingId === r._id}
                          className="px-2 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[11px] font-semibold"
                        >
                          {cancellingId === r._id ? 'Releasing...' : 'Unreserve'}
                        </button>
                      )}
                      <button
                        onClick={() => handleAdminDeleteReservation(r._id, r.reservationRef)}
                        className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-navy-850 transition"
                        title="Delete Reservation Record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
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
