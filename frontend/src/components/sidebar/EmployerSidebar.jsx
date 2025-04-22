// src/components/EmployerSidebar.jsx
import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  HomeIcon,
  ArrowsRightLeftIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  ArrowRightStartOnRectangleIcon
} from '@heroicons/react/24/outline'

const links = [
  { to: '/employer-dashboard', label: 'Dashboard',      Icon: HomeIcon                },
  { to: '/trades/all',         label: 'All Trades',     Icon: ArrowsRightLeftIcon, },
  { to: '/my-trips',           label: 'My Trips',       Icon: ClipboardDocumentListIcon },
  { to: '/settings',           label: 'Settings',       Icon: Cog6ToothIcon          },
  { to: null,                  label: 'Logout',         Icon: ArrowRightStartOnRectangleIcon },
]

export default function EmployerSidebar() {
  const { pathname } = useLocation()
  const navigate     = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    navigate('/login', { replace: true })
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col w-56 bg-green-800 text-white min-h-screen p-6 space-y-4">
        {links.map(({ to, label, Icon }) => {
          if (!to) {
            return (
              <button
                key={label}
                onClick={handleLogout}
                className="flex items-center px-4 py-2 rounded hover:bg-green-700 transition"
              >
                <Icon className="h-5 w-5 mr-2" />
                {label}
              </button>
            )
          }
          const active = pathname === to
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center px-4 py-2 rounded transition ${
                active
                  ? 'bg-green-600 font-semibold'
                  : 'hover:bg-green-700'
              }`}
            >
              <Icon className="h-5 w-5 mr-2" />
              {label}
            </Link>
          )
        })}
      </aside>

      {/* Mobile bottom bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-green-800 text-white flex md:hidden">
        {links.map(({ to, label, Icon }) => {
          if (!to) {
            return (
              <button
                key={label}
                onClick={handleLogout}
                className="flex-1 py-2 flex flex-col items-center justify-center border-l last:border-r"
              >
                <Icon className="h-6 w-6" />
                <span className="text-xs">{label}</span>
              </button>
            )
          }
          const active = pathname === to
          return (
            <Link
              key={to}
              to={to}
              className={`flex-1 py-2 flex flex-col items-center justify-center transition ${
                active
                  ? 'bg-green-700'
                  : 'hover:bg-green-700'
              }`}
            >
              <Icon className="h-6 w-6" />
              <span className="text-xs">{label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
