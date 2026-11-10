import React from 'react';
import PriceCalculator from '../components/PriceCalculator';
import { Calculator, Sparkles, CheckCircle2 } from 'lucide-react';

export default function PriceCalculatorPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
          <Calculator className="w-3.5 h-3.5" />
          <span>Transparent Pricing Estimator</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white">
          Parking Cost Calculator
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
          Compare estimated parking rates across multiple facilities, durations, and vehicle categories with zero hidden charges.
        </p>
      </div>

      <PriceCalculator />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 text-xs">
        <div className="p-4 rounded-2xl bg-navy-900 border border-navy-800 space-y-1">
          <h4 className="font-bold text-white flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Server-Verified Rates</span>
          </h4>
          <p className="text-slate-400 leading-relaxed">
            All prices are dynamically evaluated on the Node.js backend using official operator pricing rules.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-navy-900 border border-navy-800 space-y-1">
          <h4 className="font-bold text-white flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
            <span>Daily Maximum Caps</span>
          </h4>
          <p className="text-slate-400 leading-relaxed">
            Multi-hour parking automatically caps at the maximum daily limit configured by the facility operator.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-navy-900 border border-navy-800 space-y-1">
          <h4 className="font-bold text-white flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
            <span>Vehicle-Specific Tiers</span>
          </h4>
          <p className="text-slate-400 leading-relaxed">
            Fair differential pricing for two-wheelers, sedans, and large commercial vans.
          </p>
        </div>
      </div>
    </div>
  );
}
