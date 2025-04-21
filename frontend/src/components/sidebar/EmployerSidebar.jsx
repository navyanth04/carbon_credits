// src/components/EmployerSidebar.jsx
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const links = [
  { to: '/employer-dashboard',   label: 'Dashboard'       },
  { to: '/journey-tracker',      label: 'Journey Tracker' },
  { to: '/my-trips',             label: 'My Trips'        },
  { to: '/settings',             label: 'Settings'        },
  // no `to` for logout — we’ll handle it specially
  { to: null,                    label: 'Logout'          },
];

export default function EmployerSidebar() {
  const { pathname } = useLocation();
  const navigate     = useNavigate();

  const handleLogout = () => {
    // 1) clear your token (and any other app state)
    localStorage.removeItem('authToken');
    // 2) force a re‑render / redirect
    //    a) either reload the page so RequireAuth will send you to /login
    // window.location.reload();
    //    b) or navigate explicitly:
    navigate('/login', { replace: true });
  };

  return (
    <aside className="w-56 bg-green-800 text-white flex-shrink-0 min-h-screen flex flex-col p-6 space-y-4">
      {links.map(({ to, label }) => {
        const active = to === pathname;
        if (!to) {
          // logout button
          return (
            <button
              key={label}
              onClick={handleLogout}
              className="text-left px-4 py-2 rounded hover:bg-green-700 transition-colors"
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
              active ? 'bg-green-600' : 'hover:bg-green-700'
            }`}
          >
            {label}
          </Link>
        );
      })}
    </aside>
  );
}
