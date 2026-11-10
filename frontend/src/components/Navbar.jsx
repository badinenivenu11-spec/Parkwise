import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationDrawer from './NotificationDrawer';
import {
  Compass,
  LayoutDashboard,
  CalendarDays,
  Car,
  Heart,
  Settings,
  LogOut,
  Bell,
  Menu,
  X,
  SlidersHorizontal,
  Calculator,
  Shield,
  HelpCircle,
  Building2,
  ParkingSquare,
  QrCode,
  Users,
  BarChart3,
  ChevronDown
} from 'lucide-react';

export default function Navbar() {
  const { user, role, logout, unreadCount } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const roleBadgeStyles = {
    driver: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    operator: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    admin: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  };

  return (
    <>
      <nav className="bg-navy-950/90 border-b border-navy-800 sticky top-7 z-30 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-2.5 group">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                  <span className="text-white font-extrabold text-xl tracking-tight">P</span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg font-black tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                      Park<span className="text-emerald-400">Ease</span>
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono font-semibold border border-emerald-500/20">
                      PRO
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 -mt-1 hidden sm:block">Smart Parking Platform</p>
                </div>
              </Link>

              {/* Desktop Nav Items */}
              <div className="hidden lg:flex items-center gap-1">
                <Link
                  to="/find"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                    isActive('/find')
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-navy-900'
                  }`}
                >
                  <Compass className="w-4 h-4 text-emerald-400" />
                  Find Parking
                </Link>

                <Link
                  to="/compare"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                    isActive('/compare')
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-navy-900'
                  }`}
                >
                  <SlidersHorizontal className="w-4 h-4 text-slate-400" />
                  Compare
                </Link>

                <Link
                  to="/calculator"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                    isActive('/calculator')
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-navy-900'
                  }`}
                >
                  <Calculator className="w-4 h-4 text-slate-400" />
                  Calculator
                </Link>

                {/* Role specific quick link in main bar */}
                {role === 'driver' && (
                  <Link
                    to="/driver"
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                      isActive('/driver')
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        : 'text-slate-300 hover:text-white hover:bg-navy-900'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4 text-emerald-400" />
                    Dashboard
                  </Link>
                )}

                {role === 'operator' && (
                  <Link
                    to="/operator"
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                      isActive('/operator')
                        ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                        : 'text-slate-300 hover:text-white hover:bg-navy-900'
                    }`}
                  >
                    <Building2 className="w-4 h-4 text-blue-400" />
                    Operator Hub
                  </Link>
                )}

                {role === 'admin' && (
                  <Link
                    to="/admin"
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                      isActive('/admin')
                        ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                        : 'text-slate-300 hover:text-white hover:bg-navy-900'
                    }`}
                  >
                    <Shield className="w-4 h-4 text-purple-400" />
                    Admin Panel
                  </Link>
                )}
              </div>
            </div>

            {/* Right side controls */}
            <div className="flex items-center gap-3">
              {/* Active session shortcut for drivers */}
              {role === 'driver' && (
                <Link
                  to="/driver/active-session"
                  className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold transition"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Active Session
                </Link>
              )}

              {/* Gate Entry shortcut for operators */}
              {role === 'operator' && (
                <Link
                  to="/operator/gate"
                  className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 text-xs font-semibold transition"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  Gate Entry / Exit
                </Link>
              )}

              {/* Notification Bell */}
              <button
                onClick={() => setNotifOpen(true)}
                className="relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-navy-850 transition"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-emerald-500 text-slate-950 font-bold text-[10px] rounded-full flex items-center justify-center shadow-lg">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* User / Demo Identity Profile Pill */}
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-navy-850 hover:bg-navy-800 border border-navy-700/80 transition"
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold flex items-center justify-center text-xs">
                    {user?.name ? user.name[0].toUpperCase() : 'D'}
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-xs font-semibold text-white truncate max-w-[100px]">
                      {user?.name || 'Dev Driver'}
                    </div>
                    <div className="text-[10px] text-slate-400 capitalize">
                      {role}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-navy-900 border border-navy-700 rounded-xl shadow-2xl py-2 z-50">
                    <div className="px-4 py-2 border-b border-navy-800">
                      <div className="text-xs font-bold text-white truncate">{user?.name}</div>
                      <div className="text-[11px] text-slate-400 truncate">{user?.email}</div>
                      <span className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full font-mono uppercase border ${roleBadgeStyles[role]}`}>
                        {role} Mode
                      </span>
                    </div>

                    <div className="py-1">
                      {role === 'driver' && (
                        <>
                          <Link
                            to="/driver"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-navy-800 transition"
                          >
                            <LayoutDashboard className="w-4 h-4 text-emerald-400" />
                            Driver Dashboard
                          </Link>
                          <Link
                            to="/driver/reservations"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-navy-800 transition"
                          >
                            <CalendarDays className="w-4 h-4 text-slate-400" />
                            My Reservations
                          </Link>
                          <Link
                            to="/driver/vehicles"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-navy-800 transition"
                          >
                            <Car className="w-4 h-4 text-slate-400" />
                            My Vehicles
                          </Link>
                          <Link
                            to="/driver/favorites"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-navy-800 transition"
                          >
                            <Heart className="w-4 h-4 text-rose-400" />
                            Favorites
                          </Link>
                        </>
                      )}

                      {role === 'operator' && (
                        <>
                          <Link
                            to="/operator"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-navy-800 transition"
                          >
                            <Building2 className="w-4 h-4 text-blue-400" />
                            Operator Dashboard
                          </Link>
                          <Link
                            to="/operator/facilities"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-navy-800 transition"
                          >
                            <ParkingSquare className="w-4 h-4 text-slate-400" />
                            Facility Management
                          </Link>
                          <Link
                            to="/operator/slots"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-navy-800 transition"
                          >
                            <LayoutDashboard className="w-4 h-4 text-slate-400" />
                            Slot Inventory
                          </Link>
                          <Link
                            to="/operator/gate"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-navy-800 transition"
                          >
                            <QrCode className="w-4 h-4 text-emerald-400" />
                            Gate Entry & Exit
                          </Link>
                        </>
                      )}

                      {role === 'admin' && (
                        <>
                          <Link
                            to="/admin"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-navy-800 transition"
                          >
                            <Shield className="w-4 h-4 text-purple-400" />
                            Admin Overview
                          </Link>
                          <Link
                            to="/admin/slots"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-navy-800 transition"
                          >
                            <LayoutDashboard className="w-4 h-4 text-emerald-400" />
                            Slot Management
                          </Link>
                          <Link
                            to="/admin/facilities"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-navy-800 transition"
                          >
                            <Building2 className="w-4 h-4 text-blue-400" />
                            Facility Management
                          </Link>
                          <Link
                            to="/admin/gate"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-navy-800 transition"
                          >
                            <QrCode className="w-4 h-4 text-amber-400" />
                            Barrier Gate Terminal
                          </Link>
                          <Link
                            to="/admin/users"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-navy-800 transition"
                          >
                            <Users className="w-4 h-4 text-slate-400" />
                            User Management
                          </Link>
                          <Link
                            to="/admin/analytics"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-navy-800 transition"
                          >
                            <BarChart3 className="w-4 h-4 text-slate-400" />
                            System Analytics
                          </Link>
                        </>
                      )}

                      <div className="border-t border-navy-800 my-1" />

                      <Link
                        to="/settings"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-navy-800 transition"
                      >
                        <Settings className="w-4 h-4 text-slate-400" />
                        Settings
                      </Link>

                      <Link
                        to="/login"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-navy-800 transition"
                      >
                        <Users className="w-4 h-4 text-slate-400" />
                        Switch Demo Account
                      </Link>

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                          navigate('/login');
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-400 hover:bg-navy-800 transition text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Clear Demo Session
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile menu trigger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-navy-850"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6 text-slate-200" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-navy-900 border-b border-navy-800 px-4 pt-2 pb-6 space-y-2">
            <Link
              to="/find"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-navy-800"
            >
              <Compass className="w-4 h-4 text-emerald-400" />
              Find Parking
            </Link>
            <Link
              to="/compare"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-navy-800"
            >
              <SlidersHorizontal className="w-4 h-4 text-slate-400" />
              Compare Facilities
            </Link>
            <Link
              to="/calculator"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-navy-800"
            >
              <Calculator className="w-4 h-4 text-slate-400" />
              Price Calculator
            </Link>
            <Link
              to="/faq"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-navy-800"
            >
              <HelpCircle className="w-4 h-4 text-slate-400" />
              Help & FAQ
            </Link>
            <Link
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-navy-800"
            >
              <Shield className="w-4 h-4 text-slate-400" />
              About ParkEase
            </Link>

            <div className="border-t border-navy-800 pt-2">
              <div className="text-[11px] font-semibold text-slate-400 px-3 py-1 uppercase">
                {role.toUpperCase()} Shortcuts
              </div>
              {role === 'driver' && (
                <>
                  <Link
                    to="/driver"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-navy-800"
                  >
                    <LayoutDashboard className="w-4 h-4 text-emerald-400" />
                    Driver Dashboard
                  </Link>
                  <Link
                    to="/driver/reservations"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-navy-800"
                  >
                    <CalendarDays className="w-4 h-4 text-slate-400" />
                    My Reservations
                  </Link>
                  <Link
                    to="/driver/active-session"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-navy-800"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Active Parking Session
                  </Link>
                </>
              )}

              {role === 'operator' && (
                <>
                  <Link
                    to="/operator"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-navy-800"
                  >
                    <Building2 className="w-4 h-4 text-blue-400" />
                    Operator Dashboard
                  </Link>
                  <Link
                    to="/operator/gate"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-navy-800"
                  >
                    <QrCode className="w-4 h-4 text-emerald-400" />
                    Gate Entry & Exit
                  </Link>
                </>
              )}

              {role === 'admin' && (
                <>
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-navy-800"
                  >
                    <Shield className="w-4 h-4 text-purple-400" />
                    Admin Overview
                  </Link>
                  <Link
                    to="/admin/slots"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-navy-800"
                  >
                    <LayoutDashboard className="w-4 h-4 text-emerald-400" />
                    Slot Management
                  </Link>
                  <Link
                    to="/admin/facilities"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-navy-800"
                  >
                    <Building2 className="w-4 h-4 text-blue-400" />
                    Facility Management
                  </Link>
                  <Link
                    to="/admin/gate"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-navy-800"
                  >
                    <QrCode className="w-4 h-4 text-amber-400" />
                    Barrier Gate Terminal
                  </Link>
                  <Link
                    to="/admin/users"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-navy-800"
                  >
                    <Users className="w-4 h-4 text-slate-400" />
                    User Management
                  </Link>
                  <Link
                    to="/admin/analytics"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-navy-800"
                  >
                    <BarChart3 className="w-4 h-4 text-slate-400" />
                    System Analytics
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Notification Drawer */}
      <NotificationDrawer isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
    </>
  );
}
