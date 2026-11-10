import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HelpCircle,
  Search,
  ShieldCheck,
  Clock,
  Car,
  CreditCard,
  RotateCcw,
  Sparkles,
  ChevronDown
} from 'lucide-react';

export default function HelpFaqPage() {
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedIndex, setExpandedIndex] = useState(null);

  const faqs = [
    {
      category: 'RESERVATIONS',
      q: 'How do I book a parking space on ParkEase?',
      a: 'Browse facilities using the "Find Parking" page, select your desired location, pick your arrival time and duration, and choose an available space on the interactive floor layout (e.g. A01, B04). You will receive an immediate confirmation with a scannable digital demo pass.'
    },
    {
      category: 'RESERVATIONS',
      q: 'Can I extend an ongoing parking session?',
      a: 'Yes. Navigate to your "Active Parking Session" screen in the Driver Portal. Click "Extend Parking" and choose the additional hours needed. The system verifies in real-time that no conflicting reservation has booked your slot, updates your expected exit timestamp, and recalculates your total charge.'
    },
    {
      category: 'CANCELLATIONS',
      q: 'What happens when I cancel my reservation?',
      a: 'When you cancel a confirmed reservation, the slot status is atomically freed in the MongoDB database and returned to the facility’s available capacity pool. You receive a cancellation confirmation notification in your dashboard.'
    },
    {
      category: 'CANCELLATIONS',
      q: 'Is there a penalty or cancellation fee?',
      a: 'In this demonstration platform, standard cancellations up to 1 hour before scheduled arrival are free. Because no payment gateway is connected, no real monetary deductions occur.'
    },
    {
      category: 'PRICING',
      q: 'How are parking fees calculated?',
      a: 'Parking fees are calculated strictly on the backend server using facility pricing schedules configured by the operator. Rates vary by vehicle category (motorcycle, car, SUV, van) and duration (hourly, daily caps, minimum charges). The server never trusts pricing submitted from the frontend.'
    },
    {
      category: 'OPERATORS',
      q: 'How does the operator manage facility capacity?',
      a: 'Operators access a specialized Operator Hub where they can inspect today’s arrivals and departures, manually check vehicles in and out, mark damaged slots for maintenance, and add new parking slots in bulk.'
    },
    {
      category: 'DEMO',
      q: 'Is my credit card or bank account charged?',
      a: 'No. ParkEase is an academic demonstration project. There are no payment gateways or real transactions. All billing totals and fee receipts represent simulated demonstration calculations.'
    },
    {
      category: 'DEMO',
      q: 'How can I test the platform from different roles?',
      a: 'Use the top Demo Banner or the Demo Login page to switch seamlessly between Driver (booking & vehicles), Parking Operator (gate check-in & lot management), and Administrator (system-wide analytics & user oversight).'
    }
  ];

  const categories = ['ALL', 'RESERVATIONS', 'CANCELLATIONS', 'PRICING', 'OPERATORS', 'DEMO'];

  const filtered = faqs.filter((item) => {
    if (activeCategory !== 'ALL' && item.category !== activeCategory) return false;
    if (searchTerm.trim()) {
      const s = searchTerm.toLowerCase();
      return item.q.toLowerCase().includes(s) || item.a.toLowerCase().includes(s);
    }
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Support & Knowledge Base</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white">
          Frequently Asked Questions
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
          Everything you need to know about parking discovery, slot reservations, cancellation rules, and role switching.
        </p>
      </div>

      {/* Search and Category Filter */}
      <div className="space-y-4">
        <div className="relative max-w-xl mx-auto">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search questions or keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-navy-900 border border-navy-750 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition shadow-xl"
          />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                activeCategory === cat
                  ? 'bg-emerald-600 border-emerald-500 text-white shadow-md'
                  : 'bg-navy-900 border-navy-800 text-slate-400 hover:text-white'
              }`}
            >
              {cat === 'ALL' ? 'All Questions' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* FAQs List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-12 text-center bg-navy-900 border border-navy-800 rounded-3xl text-slate-400 text-xs">
            No matching questions found. Try a different search phrase.
          </div>
        ) : (
          filtered.map((item, idx) => {
            const isExpanded = expandedIndex === idx;
            return (
              <div
                key={idx}
                className="bg-navy-900 border border-navy-800 rounded-2xl overflow-hidden transition shadow-lg"
              >
                <button
                  onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-navy-850/60 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                    <span className="font-bold text-sm text-white">{item.q}</span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${
                      isExpanded ? 'rotate-180 text-emerald-400' : ''
                    }`}
                  />
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5 pt-1 text-xs text-slate-300 leading-relaxed border-t border-navy-800/60 pl-10">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Need more help banner */}
      <div className="p-6 rounded-3xl bg-navy-900 border border-navy-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-white text-sm">Need to test a full workflow?</h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Switch between driver, parking operator, and admin accounts anytime from the top bar.
          </p>
        </div>
        <Link
          to="/login"
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition"
        >
          Open Demo Switcher
        </Link>
      </div>
    </div>
  );
}
