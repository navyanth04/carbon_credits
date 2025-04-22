// src/pages/admin/SettingsPage.jsx
import React from 'react'
import { Link } from 'react-router-dom'

export default function SettingsPage() {
  return (
    <div className="m-4 space-y-6">
      <h2 className="text-2xl mb-4">Settings & Resources</h2>

      <div className="space-y-4">
        <Link
          to="/profile"
          className="block px-4 py-2 bg-blue-100 hover:bg-blue-200 rounded"
        >
          View / Edit Profile
        </Link>

        <Link
          to="/help"
          className="block px-4 py-2 bg-green-100 hover:bg-green-200 rounded"
        >
          Help & FAQ
        </Link>
      </div>
    </div>
  )
}
