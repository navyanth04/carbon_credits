// src/components/AdminSidebar.jsx
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  HomeIcon,
  UserGroupIcon,
  ArrowsRightLeftIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  ArrowRightStartOnRectangleIcon
} from '@heroicons/react/24/outline';

const links = [
  { to: '/admin',            label: 'Dashboard',         Icon: HomeIcon                 },
  { to: '/admin/employers',  label: 'Employers',         Icon: UserGroupIcon            },
  { to: '/admin/trades',  label: 'Trades',               Icon: ArrowsRightLeftIcon           },
  { to: '/admin/trips',      label: 'Trips',             Icon: ClipboardDocumentListIcon },
  { to: '/admin/settings',   label: 'Settings',          Icon: Cog6ToothIcon            },
];

export default function AdminSidebar() {
  const { pathname } = useLocation();
  const navigate     = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/login', { replace: true });
  };

  return (
    <>
      {/* Desktop / Tablet Sidebar */}
      <aside className="hidden md:flex flex-col w-64 h-screen bg-blue-800 text-white p-6 space-y-4">
        <h2 className="text-2xl font-bold mb-6">Admin</h2>

        {links.map(({ to, label, Icon }) => {
          const active = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center space-x-3 px-4 py-2 rounded-md transition-colors
                ${active ? 'bg-blue-600' : 'hover:bg-blue-700'}`}
            >
              <Icon className="h-6 w-6" />
              <span className="font-medium">{label}</span>
            </Link>
          );
        })}

        <button
          onClick={handleLogout}
          className="mt-auto flex items-center space-x-3 px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          <ArrowRightStartOnRectangleIcon className="h-6 w-6" />
          <span className="font-medium">Logout</span>
        </button>
      </aside>

      {/* Mobile Bottom Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-blue-800 text-white shadow-md md:hidden">
        <div className="flex justify-around">
          {links.map(({ to, label, Icon }) => {
            const active = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className="flex-1 py-2 flex flex-col items-center justify-center"
              >
                <Icon className={`h-6 w-6 mb-1 ${active ? 'text-white' : 'text-blue-300'}`} />
                <span className={`text-xs ${active ? 'text-white' : 'text-blue-300'}`}>
                  {label}
                </span>
              </Link>
            );
          })}
          <button
            onClick={handleLogout}
            className="flex-1 py-2 flex flex-col items-center justify-center"
          >
            <ArrowRightStartOnRectangleIcon className="h-6 w-6 mb-1 text-blue-300" />
            <span className="text-xs text-blue-300">Logout</span>
          </button>
        </div>
      </nav>
    </>
  );
}
