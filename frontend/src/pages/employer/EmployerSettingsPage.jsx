// src/pages/employer/SettingsPage.jsx
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import EmployerSidebar from '../../components/sidebar/EmployerSidebar'

export default function EmployerSettingsPage() {
  const [info, setInfo]       = useState({ name: '', cashBalance: 0, totalCredits: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    async function fetchInfo() {
      try {
        const token = localStorage.getItem('authToken')
        const res   = await axios.get(
          'https://carbon-credits-backend.onrender.com/api/v1/employer/summary',
          { headers: { Authorization: `Bearer ${token}` } }
        )
        const { name, cashBalance, totalCredits } = res.data
        setInfo({
          name,
          cashBalance:  typeof cashBalance  === 'number' ? cashBalance  : 0,
          totalCredits: typeof totalCredits === 'number' ? totalCredits : 0
        })
      } catch (err) {
        console.error(err)
        setError('Failed to load your account info.')
      } finally {
        setLoading(false)
      }
    }
    fetchInfo()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <p className="text-gray-600">Loading settings…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-gray-100">
      <EmployerSidebar />

      <div className="flex-1 p-4">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6 space-y-6">
          <h2 className="text-2xl font-bold text-gray-800 text-center">
            Settings & Profile
          </h2>

          <div className="space-y-2">
            <p className="text-gray-700">
              <span className="font-semibold">Organization:</span> {info.name}
            </p>
            <p className="text-gray-700">
              <span className="font-semibold">Cash Balance:</span>{' '}
              <span className="text-green-700">
                ${info.cashBalance.toFixed(2)}
              </span>
            </p>
            <p className="text-gray-700">
              <span className="font-semibold">Carbon Credits:</span>{' '}
              <span className="text-indigo-700">
                {info.totalCredits.toFixed(2)}
              </span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
            <Link
              to="/profile"
              className="flex-1 text-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
            >
              View / Edit Profile
            </Link>
            <Link
              to="/help"
              className="flex-1 text-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
            >
              Help & FAQ
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
