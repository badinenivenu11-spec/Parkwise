import React, { useState, useEffect } from 'react';
import { Calculator, Car, Bike, Truck, Sparkles, Clock, Check, ShieldCheck } from 'lucide-react';
import { facilityApi } from '../services/api';

export default function PriceCalculator({ initialFacility = null, compact = false }) {
  const [facilities, setFacilities] = useState([]);
  const [selectedFacilityId, setSelectedFacilityId] = useState(initialFacility?._id || '');
  const [vehicleType, setVehicleType] = useState('car');
  const [durationHours, setDurationHours] = useState(3);
  const [isOvernight, setIsOvernight] = useState(false);

  useEffect(() => {
    if (!initialFacility) {
      facilityApi.getAll({ limit: 50 }).then((res) => {
        if (res.data.success) {
          setFacilities(res.data.facilities);
          if (res.data.facilities.length > 0 && !selectedFacilityId) {
            setSelectedFacilityId(res.data.facilities[0]._id);
          }
        }
      });
    }
  }, [initialFacility]);

  const activeFacility = initialFacility || facilities.find((f) => f._id === selectedFacilityId);

  // Pricing rules calculation
  const pricingRule = activeFacility?.pricingRules?.find((p) => p.vehicleType === vehicleType) ||
    activeFacility?.pricingRules?.[0] || {
      baseRate: vehicleType === 'motorcycle' ? 20 : vehicleType === 'suv' ? 80 : 50,
      rateType: 'hourly',
      minimumCharge: 20,
      maximumDailyCharge: 500,
    };

  const calculateCost = () => {
    const hours = isOvernight ? Math.max(durationHours, 12) : durationHours;
    let base = 0;
    const breakdown = [];

    if (pricingRule.rateType === 'daily') {
      const days = Math.ceil(hours / 24);
      base = pricingRule.baseRate * days;
      breakdown.push({
        label: `Daily rate (₹${pricingRule.baseRate} × ${days} day${days > 1 ? 's' : ''})`,
        amount: base,
      });
    } else {
      base = pricingRule.baseRate * hours;
      breakdown.push({
        label: `Base fee (₹${pricingRule.baseRate}/hr × ${hours} hr${hours > 1 ? 's' : ''})`,
        amount: base,
      });
    }

    let total = base;

    // Minimum charge check
    if (pricingRule.minimumCharge && total < pricingRule.minimumCharge) {
      const adjustment = pricingRule.minimumCharge - total;
      breakdown.push({
        label: `Minimum booking adjustment`,
        amount: adjustment,
      });
      total = pricingRule.minimumCharge;
    }

    // Maximum daily charge cap check
    if (pricingRule.maximumDailyCharge && total > pricingRule.maximumDailyCharge && hours <= 24) {
      const discount = total - pricingRule.maximumDailyCharge;
      breakdown.push({
        label: `Daily maximum cap savings`,
        amount: -discount,
      });
      total = pricingRule.maximumDailyCharge;
    }

    return { total: Math.max(0, total), breakdown, hours };
  };

  const { total, breakdown, hours } = calculateCost();

  const vehicleOptions = [
    { type: 'motorcycle', label: 'Motorcycle / Scooter', icon: Bike },
    { type: 'car', label: 'Sedan / Hatchback', icon: Car },
    { type: 'suv', label: 'SUV / Compact SUV', icon: Truck },
    { type: 'van', label: 'Van / Transport', icon: Car },
  ];

  return (
    <div className={`bg-navy-900 border border-navy-800 rounded-2xl shadow-2xl p-6 ${compact ? '' : 'max-w-2xl mx-auto'}`}>
      <div className="flex items-center gap-3 pb-4 border-b border-navy-800">
        <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <Calculator className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white">Parking Duration & Cost Calculator</h3>
          <p className="text-xs text-slate-400">
            Real-time estimates with transparent rate breakdowns
          </p>
        </div>
      </div>

      <div className="space-y-5 pt-5">
        {/* Facility Selector (if not embedded) */}
        {!initialFacility && (
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Select Parking Facility
            </label>
            <select
              value={selectedFacilityId}
              onChange={(e) => setSelectedFacilityId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-navy-850 border border-navy-700 text-white text-sm focus:outline-none focus:border-emerald-500 transition"
            >
              {facilities.map((f) => (
                <option key={f._id} value={f._id}>
                  {f.name} — {f.address?.city}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Vehicle Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Vehicle Category
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {vehicleOptions.map((v) => {
              const Icon = v.icon;
              const isSelected = vehicleType === v.type;
              return (
                <button
                  key={v.type}
                  type="button"
                  onClick={() => setVehicleType(v.type)}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition ${
                    isSelected
                      ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 shadow-md'
                      : 'bg-navy-850 border-navy-700 text-slate-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[11px] font-semibold text-center leading-tight">
                    {v.label.split('/')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Duration Controls */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Parking Duration
            </label>
            <span className="text-sm font-black text-emerald-400 font-mono">
              {hours} Hour{hours > 1 ? 's' : ''}
            </span>
          </div>

          {/* Quick preset chips */}
          <div className="flex flex-wrap items-center gap-1.5 mb-3">
            {[1, 2, 4, 8, 12, 24].map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => {
                  setDurationHours(h);
                  setIsOvernight(h >= 12);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-semibold border transition ${
                  durationHours === h
                    ? 'bg-emerald-600 border-emerald-500 text-white'
                    : 'bg-navy-850 border-navy-700 text-slate-300 hover:bg-navy-800'
                }`}
              >
                {h}h
              </button>
            ))}
          </div>

          <input
            type="range"
            min="1"
            max="48"
            value={durationHours}
            onChange={(e) => setDurationHours(parseInt(e.target.value))}
            className="w-full accent-emerald-500 cursor-pointer h-2 bg-navy-800 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
            <span>1 Hour</span>
            <span>12 Hours (Half-Day)</span>
            <span>24 Hours (Full-Day)</span>
            <span>48 Hours</span>
          </div>
        </div>

        {/* Overnight Checkbox */}
        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="overnight-check"
            checked={isOvernight}
            onChange={(e) => setIsOvernight(e.target.checked)}
            className="w-4 h-4 rounded bg-navy-850 border-navy-700 text-emerald-600 focus:ring-emerald-500"
          />
          <label htmlFor="overnight-check" className="text-xs text-slate-300 font-medium cursor-pointer">
            Overnight parking requirement (automatically factors overnight parking terms)
          </label>
        </div>

        {/* Transparent Cost Breakdown */}
        <div className="p-4 rounded-xl bg-navy-950 border border-navy-800/80 space-y-2">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Pricing Breakdown
          </div>
          {breakdown.map((item, idx) => (
            <div key={idx} className="flex justify-between text-xs text-slate-300">
              <span>{item.label}</span>
              <span className={`font-mono font-semibold ${item.amount < 0 ? 'text-emerald-400' : 'text-white'}`}>
                {item.amount < 0 ? `- ₹${Math.abs(item.amount).toFixed(2)}` : `₹${item.amount.toFixed(2)}`}
              </span>
            </div>
          ))}

          <div className="border-t border-navy-800 pt-3 mt-3 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Estimated Total
              </span>
              <span className="text-[10px] text-slate-500">Taxes & fees included</span>
            </div>
            <div className="text-2xl font-black text-emerald-400 font-mono">
              ₹{total.toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
