import React, { useState } from 'react';
import {
  Zap,
  Accessibility,
  CheckCircle2,
  AlertTriangle,
  Car,
  Ban,
  Clock,
  Sparkles,
  Info
} from 'lucide-react';

export default function InteractiveSlotGrid({
  slots = [],
  selectedSlot,
  onSelectSlot,
  pricing = {},
  durationHours = 2,
  vehicleType = 'car'
}) {
  const [activeSection, setActiveSection] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL');

  // Group sections
  const sections = ['ALL', ...Array.from(new Set(slots.map(s => s.section || 'A'))).sort()];

  // Filter slots
  const filteredSlots = slots.filter(slot => {
    if (activeSection !== 'ALL' && slot.section !== activeSection) return false;
    if (filterType === 'EV' && !slot.hasEvCharging) return false;
    if (filterType === 'ACCESSIBLE' && !slot.isAccessible) return false;
    return true;
  });

  const getSlotStateConfig = (slot) => {
    const isSelected = selectedSlot && selectedSlot._id === slot._id;

    if (isSelected) {
      return {
        bg: 'bg-emerald-500 text-slate-950 font-black border-emerald-300 shadow-lg shadow-emerald-500/30 scale-105 z-10',
        label: 'Selected',
        selectable: true,
      };
    }

    switch (slot.status) {
      case 'available':
        return {
          bg: 'bg-navy-850 hover:bg-emerald-950/40 border-emerald-500/40 hover:border-emerald-400 text-emerald-300 hover:scale-102 cursor-pointer',
          label: 'Available',
          selectable: true,
        };
      case 'reserved':
        return {
          bg: 'bg-amber-950/30 border-amber-500/30 text-amber-400/80 cursor-not-allowed',
          label: 'Reserved',
          selectable: false,
        };
      case 'occupied':
        return {
          bg: 'bg-rose-950/30 border-rose-500/35 text-rose-400/80 cursor-not-allowed',
          label: 'Occupied',
          selectable: false,
        };
      case 'out_of_service':
      default:
        return {
          bg: 'bg-navy-900/60 border-slate-700/40 text-slate-500 cursor-not-allowed opacity-60 line-through',
          label: 'Maintenance',
          selectable: false,
        };
    }
  };

  return (
    <div className="bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-navy-800">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Parking Space Floor Plan</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
              Live Map
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Select an available spot. Darker spaces are occupied or under maintenance.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Section Pills */}
          <div className="flex items-center bg-navy-850 p-1 rounded-xl border border-navy-700/60 text-xs">
            {sections.map(sec => (
              <button
                key={sec}
                onClick={() => setActiveSection(sec)}
                className={`px-3 py-1 rounded-lg font-semibold transition ${
                  activeSection === sec
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {sec === 'ALL' ? 'All Sections' : `Section ${sec}`}
              </button>
            ))}
          </div>

          {/* Quick attribute filter */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setFilterType(filterType === 'EV' ? 'ALL' : 'EV')}
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1 transition ${
                filterType === 'EV'
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                  : 'bg-navy-850 border-navy-700 text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>EV Only</span>
            </button>
            <button
              onClick={() => setFilterType(filterType === 'ACCESSIBLE' ? 'ALL' : 'ACCESSIBLE')}
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1 transition ${
                filterType === 'ACCESSIBLE'
                  ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                  : 'bg-navy-850 border-navy-700 text-slate-400 hover:text-white'
              }`}
            >
              <Accessibility className="w-3.5 h-3.5 text-blue-400" />
              <span>Accessible</span>
            </button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 py-4 border-b border-navy-800/80 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-emerald-500/20 border border-emerald-500" />
            <span className="text-slate-300">Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-emerald-500 border border-white" />
            <span className="text-slate-300 font-semibold">Your Selection</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-amber-500/20 border border-amber-500" />
            <span className="text-slate-400">Reserved</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-rose-500/20 border border-rose-500" />
            <span className="text-slate-400">Occupied</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-slate-800 border border-slate-700" />
            <span className="text-slate-500">Out of Service</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-slate-400">
          <span className="flex items-center gap-1 text-[11px]">
            <Zap className="w-3.5 h-3.5 text-emerald-400" /> EV Station
          </span>
          <span className="flex items-center gap-1 text-[11px]">
            <Accessibility className="w-3.5 h-3.5 text-blue-400" /> Accessible
          </span>
        </div>
      </div>

      {/* Visual Parking Layout */}
      <div className="py-6">
        {filteredSlots.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm">
            No parking slots match the selected filters.
          </div>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2.5">
            {filteredSlots.map(slot => {
              const state = getSlotStateConfig(slot);
              const isSelected = selectedSlot?._id === slot._id;

              return (
                <button
                  key={slot._id}
                  disabled={!state.selectable}
                  onClick={() => onSelectSlot(isSelected ? null : slot)}
                  className={`relative p-2.5 rounded-xl border flex flex-col items-center justify-between min-h-[70px] transition-all duration-200 group ${state.bg}`}
                >
                  {/* Slot Number */}
                  <span className="font-mono text-xs font-bold tracking-wider">
                    {slot.slotNumber}
                  </span>

                  {/* Feature Icons */}
                  <div className="flex items-center gap-1 my-1">
                    {slot.hasEvCharging && (
                      <Zap className={`w-3.5 h-3.5 ${isSelected ? 'text-slate-950' : 'text-emerald-400'}`} />
                    )}
                    {slot.isAccessible && (
                      <Accessibility className={`w-3.5 h-3.5 ${isSelected ? 'text-slate-950' : 'text-blue-400'}`} />
                    )}
                    {!slot.hasEvCharging && !slot.isAccessible && (
                      <Car className={`w-3.5 h-3.5 opacity-60 ${isSelected ? 'text-slate-950' : ''}`} />
                    )}
                  </div>

                  {/* Status sub-text */}
                  <span className="text-[9px] uppercase tracking-wider font-semibold opacity-80">
                    {isSelected ? 'PICKED' : slot.status === 'out_of_service' ? 'OOS' : slot.status}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Slot Callout Box */}
      {selectedSlot && (
        <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 via-navy-850 to-navy-900 border border-emerald-500/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500 text-slate-950 flex flex-col items-center justify-center font-black">
              <span className="text-[10px] leading-none uppercase">SLOT</span>
              <span className="text-base leading-none font-mono">{selectedSlot.slotNumber}</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-white text-sm">
                  Space {selectedSlot.slotNumber} Selected
                </h4>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 uppercase font-mono">
                  {selectedSlot.slotType}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                <span>Section {selectedSlot.section} (Level {selectedSlot.floor || 1})</span>
                {selectedSlot.hasEvCharging && <span>• ⚡ Fast EV Point</span>}
                {selectedSlot.isAccessible && <span>• ♿ Wheelchair Access</span>}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[10px] text-slate-400 uppercase">Estimated Total</div>
              <div className="text-base font-black text-emerald-400">
                ₹{((pricing.baseRate || 50) * durationHours).toFixed(2)}
              </div>
            </div>
            <button
              onClick={() => onSelectSlot(null)}
              className="px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-300 text-xs font-semibold border border-navy-700 transition"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
