import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Github, Heart, Car, Sparkles, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-navy-950 border-t border-navy-800/80 text-slate-400 text-sm mt-20">
      {/* Academic / Demonstration Notice */}
      <div className="bg-navy-900/50 border-b border-navy-800/60 py-3 px-4">
        <div className="max-w-7xl mx-auto flex items-start sm:items-center gap-3 text-xs text-amber-300/90">
          <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400 mt-0.5 sm:mt-0" />
          <span>
            <strong>Academic Demonstration Project:</strong> ParkEase is built for academic presentation. The identity system is simulation-based without passwords or OAuth. In a production environment, production-grade JWT auth, HTTPS encryption, server-side RBAC, and payment gateway integration would be implemented.
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand info */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-3 group">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center font-black text-white text-base">
                P
              </div>
              <span className="text-xl font-black text-white tracking-tight">
                Park<span className="text-emerald-400">Ease</span>
              </span>
            </Link>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm mb-4">
              Next-generation smart parking management platform. Real-time slot availability, transparent dynamic pricing, gate control automation, and predictive analytics.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Backend & MongoDB Online
              </span>
              <span>•</span>
              <span>Port 5001</span>
            </div>
          </div>

          {/* Discovery Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Discovery
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/find" className="hover:text-emerald-400 transition">
                  Find Parking
                </Link>
              </li>
              <li>
                <Link to="/compare" className="hover:text-emerald-400 transition">
                  Compare Facilities
                </Link>
              </li>
              <li>
                <Link to="/calculator" className="hover:text-emerald-400 transition">
                  Cost Calculator
                </Link>
              </li>
              <li>
                <Link to="/find?evCharging=true" className="hover:text-emerald-400 transition">
                  EV Charging Lots
                </Link>
              </li>
              <li>
                <Link to="/find?covered=true" className="hover:text-emerald-400 transition">
                  Covered Garages
                </Link>
              </li>
            </ul>
          </div>

          {/* Portals */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Portals & Roles
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/driver" className="hover:text-emerald-400 transition">
                  Driver Dashboard
                </Link>
              </li>
              <li>
                <Link to="/driver/active-session" className="hover:text-emerald-400 transition">
                  Active Session
                </Link>
              </li>
              <li>
                <Link to="/operator" className="hover:text-blue-400 transition">
                  Operator Hub
                </Link>
              </li>
              <li>
                <Link to="/operator/gate" className="hover:text-blue-400 transition">
                  Gate Entry & Exit
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-purple-400 transition">
                  Admin Analytics
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-emerald-400 transition">
                  Demo Switcher
                </Link>
              </li>
            </ul>
          </div>

          {/* Project Details */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Platform Info
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/faq" className="hover:text-emerald-400 transition">
                  Help & FAQs
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-emerald-400 transition">
                  System Architecture
                </Link>
              </li>
              <li>
                <Link to="/settings" className="hover:text-emerald-400 transition">
                  Demo Settings
                </Link>
              </li>
              <li className="pt-2">
                <span className="text-[11px] text-slate-500 block">Tech Stack:</span>
                <span className="text-[11px] text-slate-400 font-mono">
                  React • Vite • Tailwind • Node • Express • Mongo
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-navy-800/60 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div>
            © {new Date().getFullYear()} ParkEase. Final Year Presentation Build.
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-400">Design Palette: Deep Navy & Emerald Green</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
