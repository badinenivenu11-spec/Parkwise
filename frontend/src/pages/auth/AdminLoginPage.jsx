import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  Shield,
  Layers,
  Sparkles,
  ArrowRight,
  UserCheck,
  Building2,
  Car,
  Lock,
  BarChart3,
  Sliders,
  ShieldAlert,
  KeyRound
} from 'lucide-react';

export default function AdminLoginPage() {
  const { user, login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [adminKey, setAdminKey] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdminPreset = async () => {
    setLoading(true);
    const res = await login('admin@parkease.demo', 'admin', 'Alex Admin');
    setLoading(false);
    if (res.success) {
      addToast('Master Admin Session Granted! God-mode active.', 'success');
      navigate('/admin');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      addToast('Please enter administrator email', 'warning');
      return;
    }
    setLoading(true);
    const res = await login(email.trim().toLowerCase(), 'admin', name.trim() || 'System Administrator');
    setLoading(false);
    if (res.success) {
      addToast('Welcome to ParkEase Administrator Console!', 'success');
      navigate('/admin');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-10">
      {/* Top Breadcrumb & Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-navy-800 text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <Link to="/" className="hover:text-purple-400 transition">Home</Link>
          <span>/</span>
          <span className="text-white font-semibold">Master Admin Sign-In</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500 hidden sm:inline">Other Portals:</span>
          <Link
            to="/login/driver"
            className="px-3 py-1.5 rounded-xl bg-navy-850 hover:bg-navy-800 border border-navy-700 text-emerald-400 font-semibold flex items-center gap-1.5 transition"
          >
            <Car className="w-3.5 h-3.5" />
            <span>Driver Portal</span>
          </Link>
          <Link
            to="/login/operator"
            className="px-3 py-1.5 rounded-xl bg-navy-850 hover:bg-navy-800 border border-navy-700 text-blue-400 font-semibold flex items-center gap-1.5 transition"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Operator Station</span>
          </Link>
        </div>
      </div>

      {/* Hero Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-bold">
          <Shield className="w-3.5 h-3.5" />
          <span>Platform Governance & System Administration</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Master Platform <span className="text-purple-400">Administration</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
          Access complete platform god-mode: Add, edit, and delete parking slots, configure facilities, manage user roles, audit bookings, and set platform rules.
        </p>
      </div>

      {/* Preset Admin Card */}
      <div className="space-y-3 max-w-lg mx-auto">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center">
          1-Click Master Administrator Profile
        </div>

        <button
          onClick={handleAdminPreset}
          className="w-full p-6 rounded-3xl border text-left bg-gradient-to-r from-navy-900 via-navy-850 to-purple-950/30 border-purple-500/40 hover:border-purple-500 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-200 group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/40 flex items-center justify-center font-black">
              <KeyRound className="w-6 h-6" />
            </div>
            <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-mono font-bold border border-purple-500/40">
              FULL GOD-MODE
            </span>
          </div>

          <h4 className="font-extrabold text-white text-lg">Alex Admin</h4>
          <div className="text-xs font-mono text-purple-400 mt-0.5">admin@parkease.demo</div>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Unrestricted administrator credentials with complete CRUD over slots, facilities, users, barrier terminals, and system parameters.
          </p>

          <div className="mt-5 pt-3 border-t border-navy-800 flex items-center justify-between text-xs text-purple-400 font-bold group-hover:translate-x-1 transition-transform">
            <span>Instant Administrator Access</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </button>
      </div>

      {/* Manual Admin Sign In Form */}
      <div className="bg-navy-900 border border-navy-800 rounded-3xl p-6 sm:p-8 max-w-xl mx-auto shadow-2xl space-y-5">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-purple-400" />
            <span>Administrator Credentials Verification</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Log in with an administrator email address. Role is securely locked to Platform Admin.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold uppercase mb-1.5">
              Administrator Email
            </label>
            <input
              type="email"
              placeholder="e.g. admin@parkease.demo"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-navy-850 border border-navy-700 text-white text-xs focus:outline-none focus:border-purple-500 font-mono"
              required
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold uppercase mb-1.5">
              Administrator Display Name
            </label>
            <input
              type="text"
              placeholder="e.g. Alex Admin"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-navy-850 border border-navy-700 text-white text-xs focus:outline-none focus:border-purple-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs shadow-xl shadow-purple-600/30 transition flex items-center justify-center gap-2"
          >
            <Shield className="w-4 h-4" />
            <span>{loading ? 'Verifying Admin Authority...' : 'Launch Administrator Console'}</span>
          </button>
        </form>
      </div>

      {/* Admin Capabilities List */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto text-xs text-slate-300">
        <div className="p-4 rounded-2xl bg-navy-900 border border-navy-800 flex items-center gap-3">
          <Layers className="w-5 h-5 text-purple-400 shrink-0" />
          <span>Full Slot CRUD (Add, Edit, Delete, Bulk)</span>
        </div>
        <div className="p-4 rounded-2xl bg-navy-900 border border-navy-800 flex items-center gap-3">
          <Building2 className="w-5 h-5 text-purple-400 shrink-0" />
          <span>Complete Facility & Slot Purge Controls</span>
        </div>
        <div className="p-4 rounded-2xl bg-navy-900 border border-navy-800 flex items-center gap-3">
          <BarChart3 className="w-5 h-5 text-purple-400 shrink-0" />
          <span>Real-time timeseries & occupancy charts</span>
        </div>
      </div>
    </div>
  );
}
