import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { facilityApi } from '../services/api';
import FacilityCard from '../components/FacilityCard';
import PriceCalculator from '../components/PriceCalculator';
import {
  Search,
  MapPin,
  Calendar,
  Clock,
  Car,
  Zap,
  Shield,
  Umbrella,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  ChevronRight,
  TrendingUp,
  Compass
} from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();
  const [facilities, setFacilities] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search Bar State
  const [searchCity, setSearchCity] = useState('');
  const [vehicleType, setVehicleType] = useState('car');
  const [expectedDuration, setExpectedDuration] = useState('2');
  const [preferenceCovered, setPreferenceCovered] = useState(false);
  const [preferenceEV, setPreferenceEV] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [facRes, recRes] = await Promise.allSettled([
          facilityApi.getAll({ limit: 12 }),
          facilityApi.getRecommendations({ duration: 2 })
        ]);

        if (facRes.status === 'fulfilled' && facRes.value.data.success) {
          setFacilities(facRes.value.data.facilities);
        }

        if (recRes.status === 'fulfilled' && recRes.value.data.success) {
          setRecommendations(recRes.value.data.recommendations || []);
        }
      } catch (err) {
        console.error('Error fetching home data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchCity.trim()) params.append('city', searchCity.trim());
    if (vehicleType) params.append('vehicleType', vehicleType);
    if (expectedDuration) params.append('duration', expectedDuration);
    if (preferenceCovered) params.append('covered', 'true');
    if (preferenceEV) params.append('evCharging', 'true');
    navigate(`/find?${params.toString()}`);
  };

  // Grouped facilities
  const affordableOptions = [...facilities]
    .sort((a, b) => {
      const rateA = a.pricingRules?.[0]?.baseRate || 999;
      const rateB = b.pricingRules?.[0]?.baseRate || 999;
      return rateA - rateB;
    })
    .slice(0, 3);

  const evFacilities = facilities.filter(f => f.amenities?.evCharging).slice(0, 3);
  const coveredFacilities = facilities.filter(f => f.amenities?.covered).slice(0, 3);

  return (
    <div className="min-h-screen space-y-24 pb-20">
      {/* 1. Hero Section */}
      <section className="relative pt-12 pb-20 overflow-hidden">
        {/* Glow gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[300px] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart Parking Management Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
              Find Parking. <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Save Time.</span> Park Smarter.
            </h1>

            <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Reserve guaranteed parking spots in real-time. Transparent pricing, live slot availability tracking, automated gate entry, and zero circling for parking.
            </p>
          </div>

          {/* Search Panel Box */}
          <div className="max-w-4xl mx-auto bg-navy-900/90 border border-navy-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
            <form onSubmit={handleSearchSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* City / Landmark Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    City or Area
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Bengaluru, Mumbai"
                    value={searchCity}
                    onChange={(e) => setSearchCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-navy-850 border border-navy-700 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>

                {/* Vehicle Type */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Car className="w-3.5 h-3.5 text-emerald-400" />
                    Vehicle Type
                  </label>
                  <select
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-navy-850 border border-navy-700 text-white text-sm focus:outline-none focus:border-emerald-500 transition"
                  >
                    <option value="car">Car / Sedan</option>
                    <option value="suv">SUV</option>
                    <option value="motorcycle">Motorcycle</option>
                    <option value="van">Van</option>
                  </select>
                </div>

                {/* Duration */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    Duration
                  </label>
                  <select
                    value={expectedDuration}
                    onChange={(e) => setExpectedDuration(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-navy-850 border border-navy-700 text-white text-sm focus:outline-none focus:border-emerald-500 transition"
                  >
                    <option value="1">1 Hour</option>
                    <option value="2">2 Hours</option>
                    <option value="4">4 Hours (Half Day)</option>
                    <option value="8">8 Hours (Full Day)</option>
                    <option value="24">24 Hours</option>
                  </select>
                </div>

                {/* Search Button */}
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2"
                  >
                    <Search className="w-4 h-4" />
                    <span>Search Parking</span>
                  </button>
                </div>
              </div>

              {/* Preferences Checkboxes */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-navy-800 text-xs">
                <div className="flex items-center gap-4 text-slate-300">
                  <label className="flex items-center gap-2 cursor-pointer hover:text-white">
                    <input
                      type="checkbox"
                      checked={preferenceCovered}
                      onChange={(e) => setPreferenceCovered(e.target.checked)}
                      className="rounded bg-navy-850 border-navy-700 text-emerald-500 focus:ring-emerald-500 w-4 h-4"
                    />
                    <Umbrella className="w-3.5 h-3.5 text-blue-400" />
                    <span>Covered Parking Only</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer hover:text-white">
                    <input
                      type="checkbox"
                      checked={preferenceEV}
                      onChange={(e) => setPreferenceEV(e.target.checked)}
                      className="rounded bg-navy-850 border-navy-700 text-emerald-500 focus:ring-emerald-500 w-4 h-4"
                    />
                    <Zap className="w-3.5 h-3.5 text-emerald-400" />
                    <span>EV Charging Stations</span>
                  </label>
                </div>

                <div className="text-slate-400 font-medium">
                  Showing real-time availability across {facilities.length} active lots
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* 2. Smart Parking Recommendations */}
      {recommendations.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Smart Recommendation Engine</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Recommended For You
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Scored using deterministic weighted rules factoring availability, rate value, security, and amenities.
              </p>
            </div>
            <Link
              to="/find"
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              <span>Explore all facilities</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.slice(0, 3).map(({ facility, score, reasons }) => (
              <div key={facility._id} className="relative flex flex-col">
                {/* Recommendation pill */}
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[11px] font-bold px-3 py-1 rounded-t-xl flex items-center justify-between">
                  <span>Match Score: {score} pts</span>
                  <span className="text-[10px] font-normal opacity-90 truncate max-w-[170px]">
                    {reasons[0] || 'High availability'}
                  </span>
                </div>
                <div className="flex-1">
                  <FacilityCard facility={facility} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. Popular & Affordable Facilities */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Popular Parking Facilities
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Top-rated multi-level complexes and underground lots in major hubs
            </p>
          </div>
          <Link
            to="/find"
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {facilities.slice(0, 3).map((fac) => (
            <FacilityCard key={fac._id} facility={fac} />
          ))}
        </div>
      </section>

      {/* 4. EV Charging & Covered Parking Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* EV Charging banner */}
          <div className="bg-gradient-to-br from-navy-900 to-navy-850 border border-emerald-500/30 rounded-3xl p-8 relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-white">
                Electric Vehicle (EV) Superchargers
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Charge your electric vehicle while parked. Dedicated EV parking spaces with Level-2 and DC fast charging support at Central Park & Whitefield.
              </p>
              <div className="space-y-2 pt-2">
                {evFacilities.slice(0, 2).map(f => (
                  <Link
                    key={f._id}
                    to={`/facilities/${f._id}`}
                    className="flex items-center justify-between p-3 rounded-xl bg-navy-800/80 hover:bg-navy-800 border border-navy-700 text-xs text-slate-200 transition"
                  >
                    <span className="font-semibold">{f.name}</span>
                    <span className="text-emerald-400 font-bold">{f.availableSlots} spots free</span>
                  </Link>
                ))}
              </div>
            </div>
            <div className="pt-6">
              <Link
                to="/find?evCharging=true"
                className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5"
              >
                <span>Browse all EV-enabled facilities</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Covered Parking banner */}
          <div className="bg-gradient-to-br from-navy-900 to-navy-850 border border-blue-500/30 rounded-3xl p-8 relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center">
                <Umbrella className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-white">
                Covered & Underground Garages
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Shield your car from heat, rain, and city dust. Temperature-controlled multi-level garages with 24/7 CCTV surveillance and security guards.
              </p>
              <div className="space-y-2 pt-2">
                {coveredFacilities.slice(0, 2).map(f => (
                  <Link
                    key={f._id}
                    to={`/facilities/${f._id}`}
                    className="flex items-center justify-between p-3 rounded-xl bg-navy-800/80 hover:bg-navy-800 border border-navy-700 text-xs text-slate-200 transition"
                  >
                    <span className="font-semibold">{f.name}</span>
                    <span className="text-blue-400 font-bold">{f.availableSlots} spots free</span>
                  </Link>
                ))}
              </div>
            </div>
            <div className="pt-6">
              <Link
                to="/find?covered=true"
                className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1.5"
              >
                <span>Browse covered parking lots</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. How ParkEase Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
            Simple 4-Step Process
          </span>
          <h2 className="text-3xl font-extrabold text-white mt-1">
            How ParkEase Works
          </h2>
          <p className="text-xs text-slate-400 mt-2">
            Eliminate parking stress in just a few clicks from search to gate exit.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Discover & Compare',
              desc: 'Search by locality or landmark. Filter by price, EV support, and covered garages.',
              icon: Search,
            },
            {
              step: '02',
              title: 'Pick Exact Space',
              desc: 'Interactive floor plan lets you pick exact slots like A01 or B04 with live status.',
              icon: Car,
            },
            {
              step: '03',
              title: 'Scan QR at Gate',
              desc: 'Arrive at the facility. Present your digital demo pass to open the parking barrier.',
              icon: Sparkles,
            },
            {
              step: '04',
              title: 'Drive Out Hassle-Free',
              desc: 'Confirm departure. Exact duration and transparent breakdown calculated on server.',
              icon: CheckCircle2,
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-navy-900 border border-navy-800 relative group hover:border-emerald-500/40 transition"
              >
                <div className="text-4xl font-black text-navy-800 group-hover:text-emerald-500/20 transition mb-3 font-mono">
                  {item.step}
                </div>
                <div className="w-10 h-10 rounded-xl bg-navy-850 text-emerald-400 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-white mb-2">{item.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. Embedded Price Calculator Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
            Estimate Parking Costs
          </span>
          <h2 className="text-3xl font-extrabold text-white mt-1">
            Transparent Pricing Calculator
          </h2>
          <p className="text-xs text-slate-400 mt-2">
            No hidden surge fees. Calculate your parking cost across facilities and vehicle categories.
          </p>
        </div>

        <PriceCalculator />
      </section>

      {/* 7. Frequently Asked Questions */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Common questions regarding demo reservations, entry passes, and slot policies
          </p>
        </div>

        <div className="space-y-3">
          {[
            {
              q: 'How does demo identity work in ParkEase?',
              a: 'ParkEase uses a demo-only identity system where you can sign in with any email and immediately switch between Driver, Operator, and Admin experiences. In production, this would be replaced with JWT authentication and strict server-side RBAC.',
            },
            {
              q: 'Can I choose my specific parking space?',
              a: 'Yes! ParkEase provides an interactive slot selection grid where you can pick available spaces (such as A01, B04), view EV charging attributes, and verify wheelchair accessibility.',
            },
            {
              q: 'Are payments processed in real-time?',
              a: 'No. There is no live payment gateway configured in this demonstration build. All pricing breakdowns and fees are calculated server-side according to facility pricing rules for demonstration only.',
            },
            {
              q: 'What is the cancellation policy?',
              a: 'Most facilities support free cancellation up to 1 hour before scheduled arrival. When cancelled, the reserved slot is automatically released back into the pool of available parking spaces.',
            },
          ].map((item, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-navy-900 border border-navy-800 space-y-2">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                {item.q}
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed pl-6">
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 8. Call to Action Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-emerald-950 via-navy-900 to-navy-950 border border-emerald-500/30 rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden shadow-2xl">
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Ready to Park Smarter?
            </h2>
            <p className="text-sm text-slate-300">
              Explore parking lots across Bengaluru, Mumbai, and Delhi. Select your space and complete your reservation in under two minutes.
            </p>
            <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/find"
                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-xl shadow-emerald-600/30 transition flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                <span>Find Parking Now</span>
              </Link>
              <Link
                to="/compare"
                className="px-6 py-3 rounded-xl bg-navy-850 hover:bg-navy-800 text-slate-200 border border-navy-700 font-bold text-sm transition"
              >
                Compare Facilities
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
