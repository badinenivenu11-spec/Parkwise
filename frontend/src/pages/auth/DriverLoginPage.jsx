import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  Car,
  Sparkles,
  ArrowRight,
  UserCheck,
  MapPin,
  Clock,
  ShieldCheck,
  Zap,
  Building2,
  Shield,
  Layers
} from 'lucide-react';

export default function DriverLoginPage() {
  const { user, login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const driverPresets = [
    {
      name: 'Dev Driver',
      email: 'driver@parkease.demo',
      vehicle: 'KA-01-AB-1234 (Swift ZXI)',
      tagline: 'Primary demo driver with active sessions and vehicles',
    },
    {
      name: 'Uma User',
      email: 'user@parkease.demo',
      vehicle: 'MH-02-EF-9012 (Creta SX)',
      tagline: 'Secondary driver profile with confirmed bookings',
    },
  ];

  const handlePresetSelect = async (preset) => {
    setLoading(true);
    const res = await login(preset.email, 'driver', preset.name);
    setLoading(false);
    if (res.success) {
      addToast(`Signed in as ${preset.name}! Welcome back.`, 'success');
      navigate('/driver');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      addToast('Please enter your email', 'warning');
      return;
    }
    setLoading(true);
    const res = await login(email.trim().toLowerCase(), 'driver', name.trim() || 'Driver User');
    setLoading(false);
    if (res.success) {
      addToast('Welcome to ParkEase Driver Portal!', 'success');
      navigate('/driver');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-10">
      {/* Top Breadcrumb & Role Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-navy-800 text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <Link to="/" className="hover:text-emerald-400 transition">Home</Link>
          <span>/</span>
          <span className="text-white font-semibold">Driver Portal Sign-In</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500 hidden sm:inline">Other Portals:</span>
          <Link
            to="/login/operator"
            className="px-3 py-1.5 rounded-xl bg-navy-850 hover:bg-navy-800 border border-navy-700 text-blue-400 font-semibold flex items-center gap-1.5 transition"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Operator Kiosk</span>
          </Link>
          <Link
            to="/login/admin"
            className="px-3 py-1.5 rounded-xl bg-navy-850 hover:bg-navy-800 border border-navy-700 text-purple-400 font-semibold flex items-center gap-1.5 transition"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Admin Console</span>
          </Link>
        </div>
      </div>

      {/* Hero Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
          <Car className="w-3.5 h-3.5" />
          <span>Driver & Commuter Access Gateway</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Find, Reserve & Park <span className="text-emerald-400">Smarter</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
          Sign in to access your digital parking passes, active bay timers, vehicle garage, and quick slot reservations.
        </p>
      </div>

      {/* Preset Driver Persona Cards */}
      <div className="space-y-3">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center">
          1-Click Demonstration Driver Profiles
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
          {driverPresets.map((preset) => {
            const isCurrent = user?.email === preset.email;
            return (
              <button
                key={preset.email}
                onClick={() => handlePresetSelect(preset)}
                className={`p-5 rounded-3xl border text-left flex flex-col justify-between transition-all duration-200 group ${
                  isCurrent
                    ? 'bg-emerald-950/40 border-emerald-500 shadow-xl shadow-emerald-500/20 scale-102'
                    : 'bg-navy-900 border-navy-800 hover:border-emerald-500/50 hover:bg-navy-850'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-black">
                      <Car className="w-5 h-5" />
                    </div>
                    {isCurrent && (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/40">
                        ACTIVE DRIVER
                      </span>
                    )}
                  </div>
                  <h4 className="font-extrabold text-white text-base">{preset.name}</h4>
                  <div className="text-xs font-mono text-emerald-400 mt-0.5">{preset.email}</div>
                  <div className="text-[11px] font-mono text-slate-300 mt-2 bg-navy-950 px-2.5 py-1 rounded-lg border border-navy-800">
                    🚗 {preset.vehicle}
                  </div>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">{preset.tagline}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-navy-800 flex items-center justify-between text-xs text-emerald-400 font-bold group-hover:translate-x-1 transition-transform">
                  <span>Sign In as {preset.name}</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Manual Driver Sign In Form */}
      <div className="bg-navy-900 border border-navy-800 rounded-3xl p-6 sm:p-8 max-w-xl mx-auto shadow-2xl space-y-5">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Custom Driver Identity Sign In</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Enter any email. A new driver profile will be registered in MongoDB if not existing.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold uppercase mb-1.5">
              Driver Email Address
            </label>
            <input
              type="email"
              placeholder="e.g. driver@parkease.demo"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-navy-850 border border-navy-700 text-white text-xs focus:outline-none focus:border-emerald-500 font-mono"
              required
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold uppercase mb-1.5">
              Driver Name (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Dev Driver"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-navy-850 border border-navy-700 text-white text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-xl shadow-emerald-600/30 transition flex items-center justify-center gap-2"
          >
            <UserCheck className="w-4 h-4" />
            <span>{loading ? 'Entering Portal...' : 'Access Driver Dashboard'}</span>
          </button>
        </form>
      </div>

      {/* Value Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto text-xs text-slate-300">
        <div className="p-4 rounded-2xl bg-navy-900 border border-navy-800 flex items-center gap-3">
          <Zap className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>Real-time floor plan slot reservations</span>
        </div>
        <div className="p-4 rounded-2xl bg-navy-900 border border-navy-800 flex items-center gap-3">
          <Clock className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>Live telemetry duration timer & exit receipt</span>
        </div>
        <div className="p-4 rounded-2xl bg-navy-900 border border-navy-800 flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>Zero penalty unreserve & slot release</span>
        </div>
      </div>
    </div>
  );
}
