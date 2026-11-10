import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';

// Navigation, Motion Background & Global Components
import DemoBanner from './components/DemoBanner';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import MotionBackground from './components/MotionBackground';
import ErrorBoundary from './components/ErrorBoundary';

// Public & Auth Pages
import HomePage from './pages/HomePage';
import FindParkingPage from './pages/FindParkingPage';
import FacilityDetailsPage from './pages/FacilityDetailsPage';
import SlotSelectionPage from './pages/SlotSelectionPage';
import ReservationConfirmationPage from './pages/ReservationConfirmationPage';
import DemoLoginPage from './pages/DemoLoginPage';
import DriverLoginPage from './pages/auth/DriverLoginPage';
import OperatorLoginPage from './pages/auth/OperatorLoginPage';
import AdminLoginPage from './pages/auth/AdminLoginPage';
import HelpFaqPage from './pages/HelpFaqPage';
import AboutPage from './pages/AboutPage';
import CompareFacilitiesPage from './pages/CompareFacilitiesPage';
import PriceCalculatorPage from './pages/PriceCalculatorPage';
import SettingsPage from './pages/SettingsPage';

// Driver Pages
import DriverDashboard from './pages/driver/DriverDashboard';
import MyReservationsPage from './pages/driver/MyReservationsPage';
import ActiveSessionPage from './pages/driver/ActiveSessionPage';
import VehicleManagementPage from './pages/driver/VehicleManagementPage';
import FavoritesPage from './pages/driver/FavoritesPage';
import NotificationsPage from './pages/driver/NotificationsPage';

// Operator Pages
import OperatorDashboard from './pages/operator/OperatorDashboard';
import FacilityManagementPage from './pages/operator/FacilityManagementPage';
import SlotManagementPage from './pages/operator/SlotManagementPage';
import GateManagementPage from './pages/operator/GateManagementPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagementPage from './pages/admin/UserManagementPage';
import AnalyticsPage from './pages/admin/AnalyticsPage';

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen flex flex-col text-slate-100 font-sans relative selection:bg-emerald-500 selection:text-slate-950">
            {/* Cinematic Motion Background */}
            <MotionBackground />

            {/* Top Demo Banner for seamless grading & role testing */}
            <DemoBanner />

            {/* Main Navigation Header */}
            <Navbar />

            {/* Page Content */}
            <main className="flex-1 relative z-10">
              <ErrorBoundary>
                <Routes>
                {/* Public Discovery Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/find" element={<FindParkingPage />} />
                <Route path="/facilities/:id" element={<FacilityDetailsPage />} />
                <Route path="/slots/:facilityId" element={<SlotSelectionPage />} />
                <Route path="/confirmation/:id" element={<ReservationConfirmationPage />} />
                <Route path="/compare" element={<CompareFacilitiesPage />} />
                <Route path="/calculator" element={<PriceCalculatorPage />} />
                
                {/* 3 Dedicated Login Pages & Unified Gateway */}
                <Route path="/login" element={<DemoLoginPage />} />
                <Route path="/login/driver" element={<DriverLoginPage />} />
                <Route path="/login/user" element={<DriverLoginPage />} />
                <Route path="/login/operator" element={<OperatorLoginPage />} />
                <Route path="/login/admin" element={<AdminLoginPage />} />

                <Route path="/faq" element={<HelpFaqPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/settings" element={<SettingsPage />} />

                {/* Driver Portal Routes */}
                <Route path="/driver" element={<DriverDashboard />} />
                <Route path="/driver/reservations" element={<MyReservationsPage />} />
                <Route path="/driver/active-session" element={<ActiveSessionPage />} />
                <Route path="/driver/history" element={<MyReservationsPage />} />
                <Route path="/driver/vehicles" element={<VehicleManagementPage />} />
                <Route path="/driver/favorites" element={<FavoritesPage />} />
                <Route path="/driver/notifications" element={<NotificationsPage />} />

                {/* Operator Portal Routes */}
                <Route path="/operator" element={<OperatorDashboard />} />
                <Route path="/operator/facilities" element={<FacilityManagementPage />} />
                <Route path="/operator/slots" element={<SlotManagementPage />} />
                <Route path="/operator/gate" element={<GateManagementPage />} />

                {/* Administrator Portal Routes */}
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<UserManagementPage />} />
                <Route path="/admin/analytics" element={<AnalyticsPage />} />
                <Route path="/admin/facilities" element={<FacilityManagementPage />} />
                <Route path="/admin/slots" element={<SlotManagementPage />} />
                <Route path="/admin/gate" element={<GateManagementPage />} />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </ErrorBoundary>
          </main>

            {/* Professional Footer with Academic Disclaimers */}
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
}
