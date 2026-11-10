import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { analyticsApi, reservationApi, vehicleApi, userApi } from '../../services/api';
import {
  Calendar,
  Clock,
  Car,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  MapPin,
  ChevronRight,
  Heart,
  Plus,
  ArrowRight,
  Zap,
  Sparkles,
  QrCode
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';

export default function DriverDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        const [statsRes, resRes, vehRes, favRes] = await Promise.allSettled([
          analyticsApi.getDriverStats(),
          reservationApi.getMy({ limit: 5 }),
          vehicleApi.getAll(),
          userApi.getFavorites()
        ]);

        if (statsRes.status === 'fulfilled' && statsRes.value.data.success) {
          setStats(statsRes.value.data.stats);
        }

        if (resRes.status === 'fulfilled' && resRes.value.data.success) {
          setReservations(resRes.value.data.reservations);
        }

        if (vehRes.status === 'fulfilled' && vehRes.value.data.success) {
          setVehicles(vehRes.value.data.vehicles);
        }

        if (favRes.status === 'fulfilled' && favRes.value.data.success) {
          setFavorites(favRes.value.data.favorites || []);
        }
      } catch (err) {
        console.error('Failed to load driver dashboard', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="py-32 text-center space-y-3">
        <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-slate-400 text-xs">Loading driver analytics & booking status...</p>
      </div>
    );
  }

  // Active session (checked_in)
  const activeSession = reservations.find((r) => r.status === 'checked_in');
  // Next upcoming confirmed reservation
  const upcomingReservation = reservations.find((r) => r.status === 'confirmed');

  // Chart data for spending
  const chartData = (stats?.spendingByMonth || []).map((m) => {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return {
      month: months[(m._id.month || 1) - 1],
      amount: m.amount || 0,
    };
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-navy-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
              Driver Portal
            </span>
            <span className="text-xs text-slate-400">• Demo Identity</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Welcome back, {user?.name || 'Dev Driver'}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage your booked slots, vehicles, and real-time active sessions.
          </p>
        </div>

        <Link
          to="/find"
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Book Parking</span>
        </Link>
      </div>

      {/* Active Session Alert Banner (if checked in) */}
      {activeSession && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950 via-navy-900 to-navy-850 border-2 border-emerald-500/50 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0">
              <span className="w-4 h-4 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono">
                  Live Active Parking Session
                </span>
                <span className="text-[10px] px-2 py-0.2 rounded bg-emerald-500 text-slate-950 font-black">
                  IN PROGRESS
                </span>
              </div>
              <h3 className="text-lg font-black text-white mt-0.5">
                Parked at {activeSession.facility?.name}
              </h3>
              <p className="text-xs text-slate-300 flex items-center gap-2 mt-1">
                <span>Slot: <strong className="text-white font-mono">{activeSession.slot?.slotNumber || 'A01'}</strong></span>
                <span>•</span>
                <span>Vehicle: <strong className="text-white font-mono">{activeSession.vehicleSnapshot?.registrationNumber}</strong></span>
              </p>
            </div>
          </div>

          <Link
            to="/driver/active-session"
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-xl transition flex items-center gap-1.5 shrink-0"
          >
            <span>View Active Session & Timer</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Upcoming Bookings', value: stats?.upcoming || 0, color: 'text-emerald-400', icon: Calendar },
          { label: 'Active Sessions', value: stats?.active || 0, color: 'text-blue-400', icon: Clock },
          { label: 'Completed Visits', value: stats?.completed || 0, color: 'text-purple-400', icon: CheckCircle2 },
          { label: 'Cancelled Slots', value: stats?.cancelled || 0, color: 'text-slate-400', icon: AlertCircle },
          { label: 'Total Demo Spending', value: `₹${stats?.totalSpending || 0}`, color: 'text-amber-400', icon: TrendingUp },
        ].map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-navy-900 border border-navy-800 space-y-2 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">{card.label}</span>
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
              <div className={`text-2xl font-black font-mono ${card.color}`}>
                {card.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Left 2 Cols (Upcoming Booking + History), Right 1 Col (Spending Chart & Vehicles) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Next Upcoming Reservation */}
          {upcomingReservation ? (
            <div className="bg-navy-900 border border-navy-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-navy-800">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-bold text-white text-sm">Next Upcoming Reservation</h3>
                </div>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  {upcomingReservation.reservationRef}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <div className="text-slate-500 uppercase text-[10px] font-bold">Facility</div>
                  <div className="font-bold text-white text-sm mt-0.5">
                    {upcomingReservation.facility?.name}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {upcomingReservation.facility?.address?.city}
                  </p>
                </div>

                <div>
                  <div className="text-slate-500 uppercase text-[10px] font-bold">Arrival Time</div>
                  <div className="font-mono text-white text-sm mt-0.5">
                    {new Date(upcomingReservation.startTime).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                  <div className="text-[11px] text-slate-400">{upcomingReservation.durationHours} hours booked</div>
                </div>

                <div>
                  <div className="text-slate-500 uppercase text-[10px] font-bold">Allocated Space</div>
                  <div className="font-mono font-bold text-emerald-400 text-sm mt-0.5">
                    {upcomingReservation.slot?.slotNumber || 'Pending At Gate'}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {upcomingReservation.vehicleSnapshot?.registrationNumber}
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <Link
                  to={`/confirmation/${upcomingReservation._id}`}
                  className="px-4 py-2 rounded-xl bg-navy-850 hover:bg-navy-800 border border-navy-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>View Pass Code</span>
                </Link>
                <Link
                  to="/driver/reservations"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition"
                >
                  Manage Booking
                </Link>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-3xl bg-navy-900 border border-navy-800 text-center space-y-3">
              <Calendar className="w-8 h-8 text-slate-600 mx-auto" />
              <h4 className="text-sm font-bold text-white">No Upcoming Reservations</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                You don't have any pending parking bookings. Need a space today?
              </p>
              <Link
                to="/find"
                className="inline-block px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs"
              >
                Find Parking Now
              </Link>
            </div>
          )}

          {/* Recent Parking History Table */}
          <div className="bg-navy-900 border border-navy-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-navy-800">
              <h3 className="font-bold text-white text-sm">Recent Booking History</h3>
              <Link
                to="/driver/reservations"
                className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">
                  <tr>
                    <th className="py-2.5">Reference</th>
                    <th className="py-2.5">Facility</th>
                    <th className="py-2.5">Space</th>
                    <th className="py-2.5">Date</th>
                    <th className="py-2.5">Cost</th>
                    <th className="py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-800/60 font-mono">
                  {reservations.slice(0, 4).map((r) => {
                    const statusColors = {
                      confirmed: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
                      checked_in: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
                      completed: 'bg-slate-800 text-slate-300 border-slate-700',
                      cancelled: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
                    };

                    return (
                      <tr key={r._id} className="hover:bg-navy-850/40 transition">
                        <td className="py-3 font-bold text-slate-200">
                          <Link to={`/confirmation/${r._id}`} className="hover:text-emerald-400">
                            {r.reservationRef}
                          </Link>
                        </td>
                        <td className="py-3 font-sans font-medium text-white line-clamp-1 max-w-[140px]">
                          {r.facility?.name}
                        </td>
                        <td className="py-3 text-emerald-400 font-bold">
                          {r.slot?.slotNumber || 'AUTO'}
                        </td>
                        <td className="py-3 text-slate-400 font-sans">
                          {new Date(r.startTime).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </td>
                        <td className="py-3 text-white font-bold">
                          ₹{r.pricing?.finalTotal || r.pricing?.estimatedTotal || 0}
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${statusColors[r.status] || ''}`}>
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col: Spending Graph, Quick Vehicles, Favorites) */}
        <div className="space-y-8">
          {/* Monthly Spending Chart */}
          <div className="bg-navy-900 border border-navy-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2">
              <div>
                <h3 className="font-bold text-white text-sm">Monthly Parking Spend</h3>
                <p className="text-[11px] text-slate-400">Demo charges history</p>
              </div>
              <span className="text-xs font-mono font-black text-emerald-400">
                ₹{stats?.totalSpending || 0}
              </span>
            </div>

            <div className="h-44 w-full">
              {chartData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-500">
                  No completed parking sessions yet.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                    <XAxis dataKey="month" stroke="#64748B" fontSize={10} tickLine={false} />
                    <YAxis stroke="#64748B" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0B132B', borderColor: '#1E293B', borderRadius: 8, fontSize: 11 }}
                    />
                    <Bar dataKey="amount" fill="#10B981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Quick Vehicle Shortcuts */}
          <div className="bg-navy-900 border border-navy-800 rounded-3xl p-6 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-navy-800">
              <h3 className="font-bold text-white text-sm">Your Vehicles</h3>
              <Link to="/driver/vehicles" className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold">
                Manage
              </Link>
            </div>

            <div className="space-y-2">
              {vehicles.length === 0 ? (
                <p className="text-xs text-slate-500 py-3 text-center">No vehicles added yet.</p>
              ) : (
                vehicles.map((v) => (
                  <div key={v._id} className="p-3 rounded-xl bg-navy-850 border border-navy-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <Car className="w-4 h-4 text-emerald-400" />
                      <div>
                        <span className="font-mono font-bold text-white">{v.registrationNumber}</span>
                        <div className="text-[10px] text-slate-400">{v.make} {v.model} ({v.vehicleType})</div>
                      </div>
                    </div>
                    {v.isDefault && (
                      <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold uppercase">
                        Default
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Favorite Facilities */}
          {favorites.length > 0 && (
            <div className="bg-navy-900 border border-navy-800 rounded-3xl p-6 shadow-xl space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-navy-800">
                <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-rose-400 fill-current" />
                  <span>Favorite Facilities</span>
                </h3>
                <Link to="/driver/favorites" className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold">
                  View All
                </Link>
              </div>

              <div className="space-y-2">
                {favorites.slice(0, 3).map((f) => (
                  <Link
                    key={f._id}
                    to={`/facilities/${f._id}`}
                    className="p-3 rounded-xl bg-navy-850 hover:bg-navy-800 border border-navy-800 flex items-center justify-between text-xs transition"
                  >
                    <div>
                      <div className="font-bold text-white">{f.name}</div>
                      <div className="text-[10px] text-slate-400">{f.address?.city}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
