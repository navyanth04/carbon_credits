// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/help" element={<HelpPage />} />

        {/* Protected Routes (which may later require authentication guards) */}
        <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
        <Route path="/employer-dashboard" element={<EmployerDashboard />} />
        <Route path="/trading" element={<CreditTradingPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/trip-details" element={<TripDetailsPage />} />
        <Route path="/journey-tracker" element={<JourneyTracker/>}/>
      </Routes>
    </Router>
  );
}

export default App;
