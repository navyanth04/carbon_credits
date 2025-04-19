// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import EmployeeDashboard from './pages/EmployeeDashboard';
import EmployerDashboard from './pages/EmployerDashboard';
import CreditTradingPage from './pages/CreditTradingPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboard from './pages/AdminDashboard';
import TripDetailsPage from './pages/TripDetailsPage';
import HelpPage from './pages/HelpPage';
import JourneyTracker from './pages/JourneyTracker';
import MyTripsPage from './pages/MyTripsPage';
import EmployerSignupPage from './pages/EmployerSignupPage';
import RequireAuth        from './components/RequireAuth';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/employer-signup" element={<EmployerSignupPage/>}/>

        {/* Protected Routes (which may later require authentication guards) */}
        <Route
          path="/employee-dashboard"
          element={
            <RequireAuth>
              <EmployeeDashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/employer-dashboard"
          element={
            <RequireAuth>
              <EmployerDashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/trading"
          element={
            <RequireAuth>
              <CreditTradingPage />
            </RequireAuth>
          }
        />
        <Route
          path="/profile"
          element={
            <RequireAuth>
              <ProfilePage />
            </RequireAuth>
          }
        />
        <Route
          path="/admin"
          element={
            <RequireAuth>
              <AdminDashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/trip-details"
          element={
            <RequireAuth>
              <TripDetailsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/journey-tracker"
          element={
            <RequireAuth>
              <JourneyTracker />
            </RequireAuth>
          }
        />
        <Route
          path="/my-trips"
          element={
            <RequireAuth>
              <MyTripsPage />
            </RequireAuth>
          }
        />
        {/* Fallback (optional) */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
