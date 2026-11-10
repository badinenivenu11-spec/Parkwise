import React from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  Database,
  Cpu,
  ShieldAlert,
  Code2,
  CheckCircle2,
  Sparkles,
  Server,
  Globe,
  Compass,
  ArrowRight
} from 'lucide-react';

export default function AboutPage() {
  const stack = [
    {
      category: 'Frontend Architecture',
      icon: Globe,
      items: [
        'React 18 with Vite for blazing fast HMR and optimized asset bundling',
        'Tailwind CSS 3.4 for custom deep-navy & emerald-green design system',
        'React Router v6 for dynamic, nested client-side routing',
        'Lucide React for consistent, high-fidelity SVG icons',
        'Recharts for interactive platform and driver spending analytics',
        'Leaflet with OpenStreetMap for interactive geospatial facility mapping',
        'React Context API for global state (Toast, Demo Auth, Notifications)'
      ]
    },
    {
      category: 'Backend & APIs',
      icon: Server,
      items: [
        'Node.js & Express.js RESTful API architecture',
        'Centralized asynchronous error handling and structured status responses',
        'Server-side pricing engine with rate validation (zero trust in client input)',
        'Atomic reservation creation & slot status state-machine transitions',
        'Real-time automated check-in and checkout overstay duration calculation'
      ]
    },
    {
      category: 'Database & Persistence',
      icon: Database,
      items: [
        'MongoDB document database with Mongoose ODM schemas and indexes',
        'Automated In-Memory MongoDB fallback with sample dataset auto-seeding',
        'Compound indices on facilities, slots, and time-range reservations',
        'One-click database re-seed and session reset routes'
      ]
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Title */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Final Year Project Overview</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white">
          About Park<span className="text-emerald-400">Ease</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
          An enterprise-grade smart parking management platform engineered with the MERN stack to eliminate urban congestion, automate lot operations, and provide transparent driver reservations.
        </p>
      </div>

      {/* Academic Disclosure Alert */}
      <div className="p-6 rounded-3xl bg-navy-900 border border-amber-500/40 text-xs text-amber-200/90 flex flex-col sm:flex-row items-start gap-4 shadow-xl">
        <ShieldAlert className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1.5">
          <h4 className="font-bold text-amber-300 text-sm">Academic Project Demonstration Disclosure</h4>
          <p className="leading-relaxed text-slate-300">
            This platform was built for presentation and academic demonstration. The identity mechanism uses a simulated session switcher rather than production passwords or OTPs, and no live financial transactions take place. All data is persisted in real MongoDB collections.
          </p>
        </div>
      </div>

      {/* Technical Stack Grid */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-black text-white">Full-Stack Technology Architecture</h2>
          <p className="text-xs text-slate-400 mt-1">Component breakdown and engineering principles</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stack.map((group, idx) => {
            const Icon = group.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-navy-900 border border-navy-800 space-y-4 shadow-xl flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-navy-850 text-emerald-400 flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-white text-sm mb-3">{group.category}</h3>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {group.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Core Database Entities */}
      <div className="bg-navy-900 border border-navy-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div>
          <h3 className="text-lg font-bold text-white">Core MongoDB Data Models</h3>
          <p className="text-xs text-slate-400 mt-0.5">Mongoose schemas governing the platform logic</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          {[
            {
              name: 'Facility',
              desc: 'Geo-coordinates, total & active slot counts, vehicle pricing schedules, operating hours, amenities flags.'
            },
            {
              name: 'Slot',
              desc: 'Slot identifier (A01, B04), floor level, state (available, occupied, reserved, out_of_service), EV charging flag.'
            },
            {
              name: 'Reservation',
              desc: 'Unique reference (PK...), driver snapshot, start and end timestamps, duration, rate breakdown, status lifecycle.'
            },
            {
              name: 'Vehicle',
              desc: 'Owner ID, license registration plate, vehicle type (motorcycle, car, SUV, van), EV status, default marker.'
            },
            {
              name: 'Review',
              desc: 'Driver ratings (1-5), verified booking reference, qualitative review, categorical aspect scores.'
            },
            {
              name: 'User',
              desc: 'Email identity, role (driver, operator, admin), telephone, favorites array, notification preferences.'
            }
          ].map((entity, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-navy-850 border border-navy-800 space-y-1.5">
              <span className="font-mono font-bold text-emerald-400 text-xs">Model: {entity.name}</span>
              <p className="text-slate-300 leading-relaxed text-[11px]">{entity.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center pt-4">
        <Link
          to="/find"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xl shadow-emerald-600/30 transition"
        >
          <Compass className="w-4 h-4" />
          <span>Experience the Live Platform</span>
        </Link>
      </div>
    </div>
  );
}
