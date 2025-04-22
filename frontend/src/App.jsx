// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import EmployerDashboard from './pages/employer/EmployerDashboard';
import CreditTradingPage from './pages/CreditTradingPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboard from './pages/admin/AdminDashboard';
import TripDetailsPage from './pages/TripDetailsPage';
import HelpPage from './pages/HelpPage';
import JourneyTracker from './pages/JourneyTracker';
import MyTripsPage from './pages/MyTripsPage';
import EmployerSignupPage from './pages/employer/EmployerSignupPage';
import RequireAuth        from './components/RequireAuth';
import ApprovedEmployersPage from './pages/admin/ApprovedEmployersPage';
import EmployerDetailPage from './pages/admin/EmployerDetailPage';
import AllTripsPage from './pages/admin/AllTripsPage';
import SettingsPage from './pages/admin/SettingsPage';
import AdminWithSidebar from './layouts/AdminWithSidebar';
import RedirectIfAuthenticated from './components/RedirectIfAuthenticated';
import NewTrade from './pages/trade/NewTrade';
import TradesPage from './pages/trade/TradesPage';
import TradeReview from './pages/trade/TradeReview';
import AdminTradesPage from './pages/admin/AdminTradesPage';
import EmployerSettingsPage from './pages/employer/EmployerSettingsPage';
import EmployeeTripsPage from './pages/employee/EmployeeTripsPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route element={<RedirectIfAuthenticated/>}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/employer-signup" element={<EmployerSignupPage/>}/>
        </Route>
        <Route path="/help" element={<HelpPage />} />


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
            <RequireAuth requiredRole={"EMPLOYER"}>
              <EmployerDashboard />
            </RequireAuth>
          }
        />

        <Route
          path="/employer/settings"
          element={
            <RequireAuth requiredRole={"EMPLOYER"}>
              <EmployerSettingsPage />
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
        {/* <Route
          path="/admin"
          element={
            <RequireAuth>
              <AdminDashboard />
            </RequireAuth>
          }
        /> */}
        <Route
          path="/trip-details"
          element={
            <RequireAuth>
              <TripDetailsPage />
            </RequireAuth>
          }
        />

        <Route
          path="/employee/trips"
          element={
            <RequireAuth requiredRole={"EMPLOYEE"}>
              <EmployeeTripsPage />
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
        {/* Trades */}
        <Route 
          path="/trades/new"   
          element={
            <RequireAuth>
              <NewTrade/>
            </RequireAuth>} 
        />

        <Route 
          path="/trades/all"    
          element={
            <RequireAuth>
              <TradesPage/>
            </RequireAuth>} 
        />

        <Route 
          path="/trades/review"
          element={
            <RequireAuth requiredRole="ADMIN">
              <TradeReview/>
            </RequireAuth>} 
        />

        {/* admin */}

        <Route path="/admin/*" element={
          <RequireAuth requiredRole="ADMIN">
            <AdminWithSidebar>
              <Outlet />
            </AdminWithSidebar>
          </RequireAuth>
        }>
          {/* /admin → AdminDashboard */}
          <Route index                   element={<AdminDashboard />} />
          {/* /admin/employers → list */}
          <Route path="employers"        element={<ApprovedEmployersPage />} />
          {/* /admin/employers/:id → detail */}
          <Route path="employers/:id"    element={<EmployerDetailPage />} />
          {/* /admin/trips → all trips */}
          <Route path="trips"            element={<AllTripsPage />} />
          {/* /admin/settings → settings */}
          <Route path="settings"         element={<SettingsPage />} />
          {/* /admin/trades → all trades */}
          <Route path="trades"           element={<AdminTradesPage />}/>
          {/* catch any /admin/... typo back to dashboard */}
          <Route path="*"                element={<Navigate to="/admin" replace />} />
        </Route>



        {/* Fallback (optional) */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
