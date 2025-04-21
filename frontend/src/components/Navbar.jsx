// src/components/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const role     = localStorage.getItem('userRole');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // Define menu items per role
  const menus = {
    EMPLOYEE: [
      { label: 'Dashboard', to: '/employee-dashboard' },
      { label: 'Log Trip',   to: '/journey-tracker' },
      { label: 'My Trips',   to: '/my-trips' },
      { label: 'Profile',    to: '/profile' }
    ],
    EMPLOYER: [
      { label: 'Dashboard', to: '/employer-dashboard' },
      { label: 'Employees', to: '/employer-dashboard' }, // or a specific /employees
      { label: 'Trading',   to: '/trading' },
      { label: 'Trips',     to: '/my-trips' }
    ],
    ADMIN: [
      { label: 'Admin Home',  to: '/admin' },
      { label: 'Employers',   to: '/admin/employers' },
      { label: 'All Trades',  to: '/admin/trades' }
    ]
  };

  const items = menus[role] || [];

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-green-600">
          CarbonCredits
        </Link>
        <div className="flex items-center space-x-4">
          {items.map((m) => (
            <Link key={m.to} to={m.to} className="hover:text-gray-700">
              {m.label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-md"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
