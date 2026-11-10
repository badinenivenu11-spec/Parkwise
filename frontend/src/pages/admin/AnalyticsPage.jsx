import React, { useEffect, useState } from 'react';
import { analyticsApi } from '../../services/api';
import {
  BarChart3,
  TrendingUp,
  Clock,
  Layers,
  Building2,
  Calendar,
  Sparkles,
  PieChart as PieIcon
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend
} from 'recharts';

export default function AnalyticsPage() {
  const [stats, setStats] = useState(null);
  const [overTime, setOverTime] = useState([]);
  const [occupancy, setOccupancy] = useState([]);
  const [peakHours, setPeakHours] = useState([]);
  const [popular, setPopular] = useState([]);
  const [durationDist, setDurationDist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const [statsRes, timeRes, occRes, peakRes, popRes, durRes] = await Promise.allSettled([
          analyticsApi.getAdminStats(),
          analyticsApi.getReservationsOverTime(30),
          analyticsApi.getOccupancy(),
          analyticsApi.getPeakHours(),
          analyticsApi.getPopularFacilities(),
          analyticsApi.getDurationDistribution()
        ]);

        if (statsRes.status === 'fulfilled') setStats(statsRes.value.data.stats);
        if (timeRes.status === 'fulfilled') setOverTime(timeRes.value.data.data || []);
        if (occRes.status === 'fulfilled') setOccupancy(occRes.value.data.data || []);
        if (peakRes.status === 'fulfilled') setPeakHours(peakRes.value.data.data || []);
        if (popRes.status === 'fulfilled') setPopular(popRes.value.data.data || []);
        if (durRes.status === 'fulfilled') setDurationDist(durRes.value.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="py-32 text-center space-y-3">
        <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-slate-400 text-xs">Computing MongoDB aggregation pipeline reports...</p>
      </div>
    );
  }

  // Format peak hours data (0-23 hours)
  const formattedPeakHours = Array.from({ length: 24 }, (_, i) => {
    const match = peakHours.find((p) => p._id === i);
    const hourLabel = i === 0 ? '12 AM' : i === 12 ? '12 PM' : i > 12 ? `${i - 12} PM` : `${i} AM`;
    return {
      hour: hourLabel,
      checkIns: match ? match.count : 0,
    };
  });

  // Format occupancy by facility
  const formattedOccupancy = occupancy.map((f) => ({
    name: f.name.length > 15 ? f.name.substring(0, 15) + '...' : f.name,
    available: f.availableSlots,
    occupied: f.occupiedSlots,
    reserved: f.reservedSlots,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-navy-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-purple-400" />
            <span>Platform Usage & Operational Analytics</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Aggregated telemetry across facilities, bookings, peak arrival hours, and slot utilization
          </p>
        </div>

        <span className="text-xs px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 font-mono font-bold self-start sm:self-auto">
          30-DAY AGGREGATION WINDOW
        </span>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-navy-900 border border-navy-800 space-y-2">
          <span className="text-xs text-slate-400">Total Reservations</span>
          <div className="text-3xl font-black text-white font-mono">{stats?.totalReservations || 0}</div>
          <div className="text-[10px] text-emerald-400">Across all facilities</div>
        </div>

        <div className="p-5 rounded-2xl bg-navy-900 border border-navy-800 space-y-2">
          <span className="text-xs text-slate-400">Overall Occupancy Rate</span>
          <div className="text-3xl font-black text-purple-400 font-mono">{stats?.occupancyRate || 0}%</div>
          <div className="text-[10px] text-slate-400">Of total system slots</div>
        </div>

        <div className="p-5 rounded-2xl bg-navy-900 border border-navy-800 space-y-2">
          <span className="text-xs text-slate-400">Active Live Sessions</span>
          <div className="text-3xl font-black text-emerald-400 font-mono">{stats?.activeReservations || 0}</div>
          <div className="text-[10px] text-emerald-400">Currently parked</div>
        </div>

        <div className="p-5 rounded-2xl bg-navy-900 border border-navy-800 space-y-2">
          <span className="text-xs text-slate-400">Simulated Booking Value</span>
          <div className="text-3xl font-black text-amber-400 font-mono">₹{stats?.estimatedDemoValue || 0}</div>
          <div className="text-[10px] text-slate-500">Demo billing calculation</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart 1: Daily Reservations Trend */}
        <div className="bg-navy-900 border border-navy-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-2">
            <div>
              <h3 className="text-base font-bold text-white">Daily Booking Volume</h3>
              <p className="text-xs text-slate-400">Reservations created over time</p>
            </div>
            <Calendar className="w-4 h-4 text-purple-400" />
          </div>

          <div className="h-64 w-full">
            {overTime.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                No timeseries records found.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={overTime}>
                  <defs>
                    <linearGradient id="areaPurple" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#A855F7" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#A855F7" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  <XAxis dataKey="_id" stroke="#64748B" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0B132B', borderColor: '#1E293B', borderRadius: 8, fontSize: 11 }}
                  />
                  <Area type="monotone" dataKey="count" stroke="#A855F7" strokeWidth={2} fillOpacity={1} fill="url(#areaPurple)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 2: Occupancy by Facility */}
        <div className="bg-navy-900 border border-navy-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-2">
            <div>
              <h3 className="text-base font-bold text-white">Capacity & Occupancy by Facility</h3>
              <p className="text-xs text-slate-400">Free vs Busy space distribution</p>
            </div>
            <Building2 className="w-4 h-4 text-emerald-400" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={formattedOccupancy}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="name" stroke="#64748B" fontSize={9} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B132B', borderColor: '#1E293B', borderRadius: 8, fontSize: 11 }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="available" fill="#10B981" name="Available" stackId="a" />
                <Bar dataKey="occupied" fill="#F43F5E" name="Occupied" stackId="a" />
                <Bar dataKey="reserved" fill="#FBBF24" name="Reserved" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Peak Arrival Hours Histogram */}
        <div className="bg-navy-900 border border-navy-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-2">
            <div>
              <h3 className="text-base font-bold text-white">Peak Arrival Hours</h3>
              <p className="text-xs text-slate-400">Check-in volume distribution by hour of day</p>
            </div>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={formattedPeakHours}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="hour" stroke="#64748B" fontSize={9} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B132B', borderColor: '#1E293B', borderRadius: 8, fontSize: 11 }}
                />
                <Bar dataKey="checkIns" fill="#06B6D4" radius={[4, 4, 0, 0]} name="Check-Ins" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Popular Parking Lots & Revenue Ranking */}
        <div className="bg-navy-900 border border-navy-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-2">
            <div>
              <h3 className="text-base font-bold text-white">Top Performing Parking Facilities</h3>
              <p className="text-xs text-slate-400">Ranked by total reservation throughput</p>
            </div>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>

          <div className="space-y-3 pt-2">
            {popular.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No facility rankings yet.</p>
            ) : (
              popular.slice(0, 4).map((p, idx) => (
                <div
                  key={p._id}
                  className="p-3.5 rounded-xl bg-navy-850 border border-navy-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-navy-900 border border-navy-700 font-bold text-white flex items-center justify-center font-mono">
                      #{idx + 1}
                    </span>
                    <div>
                      <div className="font-bold text-white">{p.facility?.name}</div>
                      <div className="text-[10px] text-slate-400">{p.facility?.address?.city}</div>
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <div className="font-bold text-emerald-400">{p.count} Bookings</div>
                    <div className="text-[10px] text-slate-400">₹{p.value?.toFixed(0) || 0}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
