import React, { useState } from 'react';
import { useAuth, DEMO_PRESETS } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { seedApi } from '../services/api';
import { ShieldAlert, RotateCcw, UserCheck, Sparkles, Check } from 'lucide-react';

export default function DemoBanner() {
  const { user, role, switchRole, quickSwitchUser } = useAuth();
  const { addToast } = useToast();
  const [resetting, setResetting] = useState(false);
  const [showPresets, setShowPresets] = useState(false);

  const handleReset = async () => {
    if (!window.confirm('Reset all demo sessions, reservations, and occupancy to fresh state?')) return;
    try {
      setResetting(true);
      const res = await seedApi.resetSessions();
      if (res.data.success) {
        addToast('Demo database refreshed: Slots freed and sessions reset!', 'success');
        window.location.reload();
      }
    } catch (err) {
      addToast('Reset failed: ' + (err.response?.data?.message || err.message), 'error');
    } finally {
      setResetting(false);
    }
  };

  const handleFullReseed = async () => {
    if (!window.confirm('Wipe and completely re-seed all sample facilities, slots, users, and vehicles?')) return;
    try {
      setResetting(true);
      const res = await seedApi.run();
      if (res.data.success) {
        addToast('Complete database re-seed successful!', 'success');
        window.location.reload();
      }
    } catch (err) {
      addToast('Re-seed failed: ' + (err.response?.data?.message || err.message), 'error');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-navy-900 via-navy-850 to-navy-900 border-b border-navy-700/60 text-xs text-slate-300 py-1.5 px-4 sticky top-0 z-40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Demo badge */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Demo Environment
          </span>
          <span className="hidden sm:inline text-slate-400">
            Simulated Identity & Data • No Live Payments
          </span>
        </div>

        {/* Center: Role Switcher Buttons */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 font-medium mr-1 hidden md:inline">Role:</span>
          <button
            onClick={() => switchRole('driver')}
            className={`px-2.5 py-1 rounded-md font-medium transition-all flex items-center gap-1 ${
              role === 'driver'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-navy-800 text-slate-300 hover:bg-navy-700'
            }`}
          >
            🚗 Driver
          </button>
          <button
            onClick={() => switchRole('operator')}
            className={`px-2.5 py-1 rounded-md font-medium transition-all flex items-center gap-1 ${
              role === 'operator'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-navy-800 text-slate-300 hover:bg-navy-700'
            }`}
          >
            🏢 Operator
          </button>
          <button
            onClick={() => switchRole('admin')}
            className={`px-2.5 py-1 rounded-md font-medium transition-all flex items-center gap-1 ${
              role === 'admin'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-navy-800 text-slate-300 hover:bg-navy-700'
            }`}
          >
            ⚙️ Admin
          </button>
        </div>

        {/* Right: Quick account selector & database reset */}
        <div className="flex items-center gap-2">
          {/* Quick preset account toggle */}
          <div className="relative">
            <button
              onClick={() => setShowPresets(!showPresets)}
              className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-navy-800 hover:bg-navy-700 text-slate-200 border border-navy-700 transition"
              title="Switch demo profile"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-semibold text-slate-200 truncate max-w-[110px]">
                {user?.name || 'Dev Driver'}
              </span>
            </button>

            {showPresets && (
              <div className="absolute right-0 mt-1 w-64 bg-navy-900 border border-navy-700 rounded-xl shadow-2xl p-2 z-50">
                <div className="text-[11px] font-semibold text-slate-400 px-2 py-1 uppercase tracking-wider">
                  Select Demo Identity
                </div>
                {DEMO_PRESETS.map((preset) => (
                  <button
                    key={preset.email}
                    onClick={() => {
                      quickSwitchUser(preset.email);
                      setShowPresets(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs transition flex items-center justify-between ${
                      user?.email === preset.email
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        : 'hover:bg-navy-800 text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">{preset.name}</div>
                      <div className="text-[10px] text-slate-400">{preset.desc}</div>
                    </div>
                    {user?.email === preset.email && <Check className="w-4 h-4 text-emerald-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Reset / Re-seed action */}
          <button
            onClick={handleReset}
            disabled={resetting}
            className="flex items-center gap-1 px-2 py-1 rounded-md bg-navy-800 hover:bg-amber-950/40 border border-navy-700 hover:border-amber-600/50 text-slate-300 hover:text-amber-300 transition"
            title="Free all occupied slots and reset reservations"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Reset Sessions</span>
          </button>

          <button
            onClick={handleFullReseed}
            disabled={resetting}
            className="flex items-center gap-1 px-2 py-1 rounded-md bg-navy-800 hover:bg-emerald-950/40 border border-navy-700 hover:border-emerald-600/50 text-slate-300 hover:text-emerald-300 transition"
            title="Complete database re-seed"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">Full Re-Seed</span>
          </button>
        </div>
      </div>
    </div>
  );
}
