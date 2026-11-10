import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, DEMO_PRESETS } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  ShieldAlert,
  Car,
  Building2,
  Shield,
  UserCheck,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Check,
  Layers,
  KeyRound
} from 'lucide-react';

export default function DemoLoginPage() {
  const { user, login, switchRole, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('driver');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      addToast('Please enter an email address', 'warning');
      return;
    }
    setLoading(true);
    const res = await login(email.trim().toLowerCase(), role, name.trim());
    setLoading(false);
    if (res.success) {
      if (role === 'driver') navigate('/driver');
      else if (role === 'operator') navigate('/operator');
      else if (role === 'admin') navigate('/admin');
      else navigate('/');
    }
  };

  const handleSelectPreset = async (preset) => {
    setLoading(true);
    const res = await login(preset.email, preset.role, preset.name);
    setLoading(false);
    if (res.success) {
      if (preset.role === 'driver') navigate('/driver');
      else if (preset.role === 'operator') navigate('/operator');
      else if (preset.role === 'admin') navigate('/admin');
      else navigate('/');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Multi-Role Identity Gateway</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Select Your <span className="text-emerald-400">ParkEase</span> Portal
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
          Choose a dedicated portal below to access specialized experiences for drivers, parking facility operators, or platform administrators.
        </p>
      </div>

      {/* 3 Dedicated Portal Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Driver Portal Card */}
        <Link
          to="/login/driver"
          className="p-6 rounded-3xl bg-navy-900 border border-emerald-500/30 hover:border-emerald-400 hover:bg-navy-850 hover:shadow-2xl hover:shadow-emerald-500/15 transition-all duration-200 group flex flex-col justify-between"
        >
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-black group-hover:scale-105 transition-transform">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold block">
                Commuters & Drivers
              </span>
              <h3 className="text-xl font-black text-white group-hover:text-emerald-300 transition-colors mt-0.5">
                Driver Portal
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Find nearby parking facilities, pick interactive floor spaces, view digital QR entry passes, and track active duration timers.
              </p>
            </div>

            <div className="pt-2 text-xs text-slate-300 space-y-1 font-mono">
              <div className="text-[11px] text-slate-500 font-sans uppercase font-bold">Preset Profiles:</div>
              <div>• Dev Driver (Swift ZXI)</div>
              <div>• Uma User (Creta SX)</div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-navy-800 flex items-center justify-between text-xs font-bold text-emerald-400 group-hover:translate-x-1 transition-transform">
            <span>Enter Driver Portal</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link>

        {/* Operator Portal Card */}
        <Link
          to="/login/operator"
          className="p-6 rounded-3xl bg-navy-900 border border-blue-500/30 hover:border-blue-400 hover:bg-navy-850 hover:shadow-2xl hover:shadow-blue-500/15 transition-all duration-200 group flex flex-col justify-between"
        >
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center font-black group-hover:scale-105 transition-transform">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-blue-400 font-bold block">
                Kiosk & Operations
              </span>
              <h3 className="text-xl font-black text-white group-hover:text-blue-300 transition-colors mt-0.5">
                Operator Station
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Automated barrier gate processing, license plate lookup, live space occupancy monitoring, and parking lot management.
              </p>
            </div>

            <div className="pt-2 text-xs text-slate-300 space-y-1 font-mono">
              <div className="text-[11px] text-slate-500 font-sans uppercase font-bold">Preset Profiles:</div>
              <div>• Om Operator (MG Road)</div>
              <div>• Priya Ops (Indiranagar)</div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-navy-800 flex items-center justify-between text-xs font-bold text-blue-400 group-hover:translate-x-1 transition-transform">
            <span>Open Operator Station</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link>

        {/* Admin Portal Card */}
        <Link
          to="/login/admin"
          className="p-6 rounded-3xl bg-navy-900 border border-purple-500/30 hover:border-purple-400 hover:bg-navy-850 hover:shadow-2xl hover:shadow-purple-500/15 transition-all duration-200 group flex flex-col justify-between"
        >
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center font-black group-hover:scale-105 transition-transform">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400 font-bold block">
                Governance & Control
              </span>
              <h3 className="text-xl font-black text-white group-hover:text-purple-300 transition-colors mt-0.5">
                Administrator Console
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Full platform god-mode: Add, edit, and delete slots, purge facilities, manage user roles, audit bookings, and set platform rules.
              </p>
            </div>

            <div className="pt-2 text-xs text-slate-300 space-y-1 font-mono">
              <div className="text-[11px] text-slate-500 font-sans uppercase font-bold">Preset Profile:</div>
              <div>• Alex Admin (God-Mode)</div>
              <div>• Unrestricted CRUD access</div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-navy-800 flex items-center justify-between text-xs font-bold text-purple-400 group-hover:translate-x-1 transition-transform">
            <span>Launch Admin Console</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link>
      </div>

      {/* Manual Email Login Form */}
      <div className="bg-navy-900 border border-navy-800 rounded-3xl p-6 sm:p-8 max-w-xl mx-auto shadow-2xl space-y-6">
        <div>
          <h3 className="text-base font-bold text-white">Universal Custom Email Login</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Log in with any custom email and role. Profiles are persisted automatically in MongoDB.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold uppercase mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              placeholder="e.g. yourname@parkease.demo"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-navy-850 border border-navy-700 text-white text-xs focus:outline-none focus:border-emerald-500 font-mono"
              required
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold uppercase mb-1.5">
              Display Name (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Alex Tester"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-navy-850 border border-navy-700 text-white text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold uppercase mb-2">
              Select Experience Role
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'driver', label: 'Driver', desc: 'Book & Track', color: 'emerald' },
                { id: 'operator', label: 'Operator', desc: 'Lots & Gates', color: 'blue' },
                { id: 'admin', label: 'Admin', desc: 'Full Control', color: 'purple' },
              ].map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id)}
                  className={`p-3 rounded-xl border text-center transition ${
                    role === r.id
                      ? r.color === 'purple'
                        ? 'bg-purple-500/15 border-purple-500 text-purple-300'
                        : r.color === 'blue'
                        ? 'bg-blue-500/15 border-blue-500 text-blue-300'
                        : 'bg-emerald-500/15 border-emerald-500 text-emerald-300'
                      : 'bg-navy-850 border-navy-700 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="text-xs font-bold">{r.label}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{r.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-xl shadow-emerald-600/30 transition flex items-center justify-center gap-2"
          >
            <UserCheck className="w-4 h-4" />
            <span>{loading ? 'Entering Platform...' : 'Enter Selected Experience'}</span>
          </button>
        </form>

        {user && (
          <div className="pt-4 border-t border-navy-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">
              Current Session: <strong className="text-white">{user.email}</strong> ({user.role})
            </span>
            <button
              onClick={logout}
              className="text-rose-400 hover:text-rose-300 font-semibold"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>

      {/* Production Architecture Disclaimer */}
      <div className="max-w-xl mx-auto p-5 rounded-2xl bg-navy-950 border border-navy-800 text-xs text-slate-400 space-y-2">
        <div className="flex items-center gap-2 text-amber-400 font-bold">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>Notice on Authentication & Authorization Architecture</span>
        </div>
        <p className="leading-relaxed">
          This demo authentication system uses a header-based identity mechanism (<code>x-demo-email</code>) to allow effortless role-switching during evaluation and grading. Role selection does not represent secure server authorization.
        </p>
      </div>
    </div>
  );
}
