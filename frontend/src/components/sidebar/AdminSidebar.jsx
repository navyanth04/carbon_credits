// src/components/AdminSidebar.jsx
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const links = [
  { to: '/admin',            label: 'Dashboard'           },
  { to: '/admin/employers',  label: 'Approved Employers' },
  { to: '/admin/trips',      label: 'All Trips'          },
  { to: '/admin/settings',   label: 'Settings'           },
  { to: null,                label: 'Logout'             }, // special
];

export default function AdminSidebar() {
  const { pathname } = useLocation();
  const navigate     = useNavigate();

  const handleLogout = () => {
    // 1) remove the auth token
    localStorage.removeItem('authToken');
    // 2) navigate back to login (RequireAuth will block /admin)
    navigate('/login', { replace: true });
  };

  return (
    <aside className="w-64 h-full bg-blue-800 text-white flex flex-col p-6 space-y-4">
      <h2 className="text-2xl font-bold mb-6">Admin</h2>
      {links.map(({ to, label }) => {
        const active = to === pathname;
        if (!to) {
          // render logout as a button
          return (
            <button
              key={label}
              onClick={handleLogout}
              className="text-left px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              {label}
            </button>
          );
        }
        return (
          <Link
            key={to}
            to={to}
            className={`px-4 py-2 rounded transition-colors ${
              active ? 'bg-blue-600' : 'hover:bg-blue-700'
            }`}
          >
            {label}
          </Link>
        );
      })}
    </aside>
  );
}
