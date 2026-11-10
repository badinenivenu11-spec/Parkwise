import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  Building2,
  QrCode,
  Sparkles,
  ArrowRight,
  UserCheck,
  CheckCircle2,
  Car,
  Layers,
  Shield,
  Radio,
  Search
} from 'lucide-react';

export default function OperatorLoginPage() {
  const { user, login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const operatorPresets = [
    {
      name: 'Om Operator',
      email: 'operator@parkease.demo',
      facilities: 'Central Park Complex & Koramangala Smart Parking',
      tagline: 'Lead field operator for multi-level garages & EV bays',
    },
    {
      name: 'Priya Ops',
      email: 'operator2@parkease.demo',
      facilities: 'Indiranagar Underground & Mumbai Bandra Hub',
      tagline: 'Underground & commercial facility barrier supervisor',
    },
  ];

  const handlePresetSelect = async (preset) => {
    setLoading(true);
    const res = await login(preset.email, 'operator', preset.name);
    setLoading(false);
    if (res.success) {
      addToast(`Operator session verified! Welcome, ${preset.name}.`, 'success');
      navigate('/operator');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      addToast('Please enter your operator email', 'warning');
      return;
    }
    setLoading(true);
    const res = await login(email.trim().toLowerCase(), 'operator', name.trim() || 'Facility Operator');
    setLoading(false);
    if (res.success) {
      addToast('Welcome to ParkEase Operator Station!', 'success');
      navigate('/operator');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-10">
      {/* Top Breadcrumb & Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-navy-800 text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <Link to="/" className="hover:text-blue-400 transition">Home</Link>
          <span>/</span>
          <span className="text-white font-semibold">Operator Terminal Sign-In</span>
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
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold">
          <Building2 className="w-3.5 h-3.5" />
          <span>Facility Operations & Gate Kiosk Terminal</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Automated <span className="text-blue-400">Barrier Control</span> & Lots
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
          Sign in to manage parking lots, process barrier check-in/checkout, monitor live bay capacity, and verify visitor QR passes.
        </p>
      </div>

      {/* Preset Operator Cards */}
      <div className="space-y-3">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center">
          1-Click Demonstration Operator Profiles
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
          {operatorPresets.map((preset) => {
            const isCurrent = user?.email === preset.email;
            return (
              <button
                key={preset.email}
                onClick={() => handlePresetSelect(preset)}
                className={`p-5 rounded-3xl border text-left flex flex-col justify-between transition-all duration-200 group ${
                  isCurrent
                    ? 'bg-blue-950/40 border-blue-500 shadow-xl shadow-blue-500/20 scale-102'
                    : 'bg-navy-900 border-navy-800 hover:border-blue-500/50 hover:bg-navy-850'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-500/15 text-blue-400 border border-blue-500/30 flex items-center justify-center font-black">
                      <Building2 className="w-5 h-5" />
                    </div>
                    {isCurrent && (
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-bold border border-blue-500/40">
                        ACTIVE OPERATOR
                      </span>
                    )}
                  </div>
                  <h4 className="font-extrabold text-white text-base">{preset.name}</h4>
                  <div className="text-xs font-mono text-blue-400 mt-0.5">{preset.email}</div>
                  <div className="text-[11px] font-mono text-slate-300 mt-2 bg-navy-950 px-2.5 py-1 rounded-lg border border-navy-800">
                    🏢 {preset.facilities}
                  </div>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">{preset.tagline}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-navy-800 flex items-center justify-between text-xs text-blue-400 font-bold group-hover:translate-x-1 transition-transform">
                  <span>Sign In as Operator</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Manual Operator Sign In Form */}
      <div className="bg-navy-900 border border-navy-800 rounded-3xl p-6 sm:p-8 max-w-xl mx-auto shadow-2xl space-y-5">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <QrCode className="w-4 h-4 text-blue-400" />
            <span>Custom Operator Kiosk Authentication</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Log in with an operator email address to control gates and view facility capacity.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold uppercase mb-1.5">
              Operator Email Address
            </label>
            <input
              type="email"
              placeholder="e.g. operator@parkease.demo"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-navy-850 border border-navy-700 text-white text-xs focus:outline-none focus:border-blue-500 font-mono"
              required
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold uppercase mb-1.5">
              Operator Name / Station ID
            </label>
            <input
              type="text"
              placeholder="e.g. Om Operator (Gate 1)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-navy-850 border border-navy-700 text-white text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs shadow-xl shadow-blue-600/30 transition flex items-center justify-center gap-2"
          >
            <UserCheck className="w-4 h-4" />
            <span>{loading ? 'Authenticating Kiosk...' : 'Open Operator Station'}</span>
          </button>
        </form>
      </div>

      {/* Value Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto text-xs text-slate-300">
        <div className="p-4 rounded-2xl bg-navy-900 border border-navy-800 flex items-center gap-3">
          <QrCode className="w-5 h-5 text-blue-400 shrink-0" />
          <span>1-Click QR Code & License Plate Scanner</span>
        </div>
        <div className="p-4 rounded-2xl bg-navy-900 border border-navy-800 flex items-center gap-3">
          <Radio className="w-5 h-5 text-blue-400 shrink-0" />
          <span>Real-time Gate Barrier Check-In / Out</span>
        </div>
        <div className="p-4 rounded-2xl bg-navy-900 border border-navy-800 flex items-center gap-3">
          <Layers className="w-5 h-5 text-blue-400 shrink-0" />
          <span>Automated Slot Bay Occupancy Sync</span>
        </div>
      </div>
    </div>
  );
}
