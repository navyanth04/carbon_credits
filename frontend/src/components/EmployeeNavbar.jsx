// src/components/EmployeeNavbar.jsx
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  MapPinIcon,
  Cog6ToothIcon,
  ArrowRightStartOnRectangleIcon
} from '@heroicons/react/24/outline';

export default function EmployeeNavbar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  const tabs = [
    { to: '/employee-dashboard', label: 'Dashboard', Icon: HomeIcon },
    { to: '/my-trips',           label: 'Trips',     Icon: ClipboardDocumentListIcon },
    { to: '/journey-tracker',    label: 'Travel',    Icon: MapPinIcon },
    { to: '/settings',           label: 'Settings',  Icon: Cog6ToothIcon },
  ];

  return (
    <>
      {/* Desktop / tablet */}
      <nav className="hidden md:block bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 flex items-center h-16">
          {/* Logo */}
          <Link
            to="/employee-dashboard"
            className="text-2xl font-bold text-green-600"
          >
            CarbonCredits
          </Link>

          {/* Centered tabs */}
          <div className="flex-1 flex justify-center space-x-6">
            {tabs.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`
                  px-3 py-2 rounded-md transition
                  ${pathname === to
                    ? 'font-semibold text-green-600'
                    : 'text-gray-700 hover:text-green-600'}
                `}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Logout on far right */}
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-md"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Mobile bottom bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-md md:hidden">
        <div className="flex justify-around">
          {tabs.map(({ to, Icon }) => {
            const active = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className="flex-1 py-2 flex flex-col items-center justify-center"
              >
                <Icon
                  className={`h-6 w-6 mb-1 ${
                    active ? 'text-green-600' : 'text-gray-400'
                  }`}
                />
              </Link>
            );
          })}
          <button
            onClick={handleLogout}
            className="flex-1 py-2 flex flex-col items-center justify-center"
          >
            <ArrowRightStartOnRectangleIcon className="h-6 w-6 text-gray-400" />
          </button>
        </div>
      </nav>
    </>
  );
}
