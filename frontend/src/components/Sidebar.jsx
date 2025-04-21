// src/components/Sidebar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const links = [
  { to: '/admin',        label: 'Dashboard' },
  { to: '/admin/employers', label: 'Approved Employers' },
  { to: '/admin/trips',     label: 'All Trips' },
  { to: '/admin/settings',  label: 'Settings' },
];

export default function Sidebar() {
  const { pathname } = useLocation();

  return (
    <aside className="w-64 h-full bg-blue-800 text-white flex flex-col p-6 space-y-4">
      <h2 className="text-2xl font-bold mb-6">Admin</h2>
      {links.map(({ to, label }) => {
        const active = pathname === to;
        return (
          <Link
            key={to}
            to={to}
            className={`px-4 py-2 rounded transition-colors ${
              active
                ? 'bg-blue-600'
                : 'hover:bg-blue-700'
            }`}
          >
            {label}
          </Link>
        );
      })}
    </aside>
  );
}
