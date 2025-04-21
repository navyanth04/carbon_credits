import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function EmployeeNavbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16 items-center">
          {/* Left: logo / title */}
          <div className="flex-shrink-0">
            <Link to="/employee-dashboard" className="text-2xl font-bold text-green-600">
              CarbonCredits
            </Link>
          </div>

          {/* Center: nav links */}
          <div className="hidden md:flex space-x-6">
            <Link
              to="/employee-dashboard"
              className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md"
            >
              Dashboard
            </Link>
            <Link
              to="/my-trips"
              className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md"
            >
              My Trips
            </Link>
            <Link
              to="/journey-tracker"
              className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md"
            >
              Journey Tracker
            </Link>
            <Link
              to="/settings"
              className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md"
            >
              Settings
            </Link>
          </div>

          {/* Right: logout */}
          <div>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-md"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
